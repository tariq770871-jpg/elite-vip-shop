// Telegram Bot Notification Service - Elite VIP Shop
// Sends notifications to admin via Telegram Bot API
//
// SECURITY:
//   - All endpoints require Bearer token authentication (MINI_SERVICE_BEARER_TOKEN)
//   - Bot token is NEVER persisted to disk (env var only)
//   - All user-supplied input is HTML-escaped before insertion into Telegram HTML messages
//   - Strict CORS allowlist (no wildcard)
//   - All sensitive operations are logged with timestamp + IP (for audit trail)
//   - Rate limit per IP: 60 req/min (sliding window)
//
// Run: bun index.ts (requires Bun runtime — not part of Next.js deployment)

import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

// ─── Configuration ─────────────────────────────────────────────
const PORT = parseInt(process.env.MINI_SERVICE_PORT || '3005', 10)

// REQUIRED: Bearer token — generate with `openssl rand -hex 32`
const BEARER_TOKEN = process.env.MINI_SERVICE_BEARER_TOKEN || ''

// Telegram credentials (env only — NEVER persisted to disk)
let TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
let TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || ''

// Optional: legacy config file (READ-ONLY — we no longer write to it)
// Kept only for migration from old format. Will be removed in v0.3.
const LEGACY_CONFIG_FILE = join(__dirname, 'config.json')

// Strict CORS allowlist (no wildcard, no reflect)
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,https://elite-vip-shop.vercel.app')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean)

// ─── HTML escaping for Telegram HTML parse mode ───────────────
// Telegram HTML mode supports a strict subset of HTML.
// User-supplied text MUST be escaped to prevent:
//   - HTML injection (attacker injects <b>bold</b> or <a href="phish">links</a>)
//   - Phishing via fake admin messages
//   - Breaking the Telegram message structure
function escapeTelegramHtml(s: string): string {
  if (typeof s !== 'string') return ''
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// ─── Bearer token verification ────────────────────────────────
function verifyAuth(req: Request): boolean {
  if (!BEARER_TOKEN) {
    console.error('[AUTH] MINI_SERVICE_BEARER_TOKEN is not set — refusing all requests')
    return false
  }
  const authHeader = req.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false

  // Constant-time comparison to prevent timing attacks
  const provided = authHeader.slice(7)
  if (provided.length !== BEARER_TOKEN.length) return false
  let diff = 0
  for (let i = 0; i < provided.length; i++) {
    diff |= provided.charCodeAt(i) ^ BEARER_TOKEN.charCodeAt(i)
  }
  return diff === 0
}

// ─── In-memory rate limiter (per IP, sliding window) ──────────
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 60

interface RateLimitEntry { count: number; resetAt: number }
const rateLimitMap = new Map<string, RateLimitEntry>()

function rateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT_MAX) return false
  entry.count++
  return true
}

// Clean expired entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(ip)
  }
}, 5 * 60_000).unref?.()

// ─── Request IP extraction (behind proxy) ──────────────────────
function getClientIp(req: Request): string {
  // Trust X-Forwarded-For only from the first hop (Vercel/Cloudflare)
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return 'unknown'
}

// ─── Audit logging ─────────────────────────────────────────────
function auditLog(event: string, ip: string, detail: Record<string, unknown> = {}): void {
  console.log(JSON.stringify({
    ts: new Date().toISOString(),
    event,
    ip,
    ...detail,
  }))
}

// ─── Legacy config loader (read-only) ─────────────────────────
// Loads from old config.json IF present, but does NOT write.
// This allows a smooth migration: env vars take precedence, then
// legacy file, then nothing (queue mode).
function loadLegacyConfig(): void {
  if (!existsSync(LEGACY_CONFIG_FILE)) return
  try {
    const saved = JSON.parse(readFileSync(LEGACY_CONFIG_FILE, 'utf-8'))
    if (!TELEGRAM_BOT_TOKEN && saved.botToken) {
      TELEGRAM_BOT_TOKEN = saved.botToken
      console.warn('[Config] ⚠️ Loaded bot token from legacy config.json — please migrate to env var TELEGRAM_BOT_TOKEN')
    }
    if (!TELEGRAM_CHAT_ID && saved.chatId) {
      TELEGRAM_CHAT_ID = saved.chatId
      console.warn('[Config] ⚠️ Loaded chat ID from legacy config.json — please migrate to env var TELEGRAM_CHAT_ID')
    }
  } catch {
    console.warn('[Config] ⚠️ Failed to load legacy config.json — ignoring')
  }
}
loadLegacyConfig()

// ─── Notification queue (when Telegram is unavailable) ────────
interface QueuedNotification {
  text: string
  timestamp: string
}
const notificationQueue: QueuedNotification[] = []
const MAX_QUEUE_SIZE = 100 // prevent OOM

// ─── Telegram API client ──────────────────────────────────────
async function sendTelegramMessage(text: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    if (notificationQueue.length < MAX_QUEUE_SIZE) {
      notificationQueue.push({ text, timestamp: new Date().toISOString() })
    }
    return false
  }

  // Bot token format validation (basic — prevents obvious injection)
  // Telegram bot tokens are digits:alphanumeric, 35-46 chars
  if (!/^\d{6,12}:[A-Za-z0-9_-]{30,40}$/.test(TELEGRAM_BOT_TOKEN)) {
    console.error('[Telegram] ❌ Invalid bot token format')
    return false
  }

  try {
    // Use AbortController to prevent hanging on slow Telegram API
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
        signal: controller.signal,
      }
    )
    clearTimeout(timeout)

    const data = await response.json()

    if (data.ok) return true

    console.error('[Telegram] ❌ API error:', data.description)
    if (notificationQueue.length < MAX_QUEUE_SIZE) {
      notificationQueue.push({ text, timestamp: new Date().toISOString() })
    }
    return false
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[Telegram] ❌ Request timed out (10s)')
    } else {
      console.error('[Telegram] ❌ Network error:', error instanceof Error ? error.message : String(error))
    }
    if (notificationQueue.length < MAX_QUEUE_SIZE) {
      notificationQueue.push({ text, timestamp: new Date().toISOString() })
    }
    return false
  }
}

// ─── Message formatters (ALL user input is escaped) ───────────
function formatContactMessage(data: {
  name: string
  email?: string
  phone?: string
  subject?: string
  message: string
}): string {
  const time = new Date().toLocaleString('ar-YE', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  // ALL fields are user-supplied — escape every one
  const name = escapeTelegramHtml(data.name || '')
  const email = escapeTelegramHtml(data.email || '')
  const phone = escapeTelegramHtml(data.phone || '')
  const subject = escapeTelegramHtml(data.subject || '')
  const message = escapeTelegramHtml(data.message || '')

  return [
    `<b>📩 رسالة تواصل جديدة</b>`,
    ``,
    `👤 المرسل: <b>${name}</b>`,
    email ? `📧 البريد: <code>${email}</code>` : null,
    phone ? `📱 الهاتف: <code>${phone}</code>` : null,
    subject ? `📝 الموضوع: <b>${subject}</b>` : null,
    ``,
    `💬 الرسالة:`,
    `<i>${message}</i>`,
    ``,
    `⏰ ${escapeTelegramHtml(time)}`,
    ``,
    `<i>— متجر النخبة Elite VIP Shop</i>`,
  ].filter(Boolean).join('\n')
}

function formatOrderNotification(data: {
  orderNumber: string
  customerName: string
  total: number
  items: string
}): string {
  // Escape all string fields (items is pre-formatted by caller, but escape anyway)
  const orderNumber = escapeTelegramHtml(data.orderNumber || '')
  const customerName = escapeTelegramHtml(data.customerName || '')
  const items = escapeTelegramHtml(data.items || '')
  const total = Number(data.total) || 0

  return [
    `<b>🛒 طلب جديد</b>`,
    ``,
    `🆔 رقم الطلب: <b>${orderNumber}</b>`,
    `👤 العميل: <b>${customerName}</b>`,
    `💰 المبلغ: <b>${total.toLocaleString('ar-SA')} ر.ي</b>`,
    ``,
    `📋 المنتجات:`,
    items,
    ``,
    `⏰ ${escapeTelegramHtml(new Date().toLocaleString('ar-YE', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }))}`,
    ``,
    `<i>— متجر النخبة Elite VIP Shop</i>`,
  ].join('\n')
}

// ─── HTTP server ───────────────────────────────────────────────
const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url)
    const ip = getClientIp(req)

    // ─── CORS ───
    const origin = req.headers.get('origin') || ''
    const corsOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ''

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    }
    if (corsOrigin) {
      headers['Access-Control-Allow-Origin'] = corsOrigin
      headers['Vary'] = 'Origin'
    }

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers })
    }

    // ─── Rate limit (skip /health to allow monitoring) ───
    if (url.pathname !== '/health' && !rateLimit(ip)) {
      auditLog('rate_limit_exceeded', ip, { path: url.pathname })
      return new Response(JSON.stringify({ error: 'Too Many Requests' }), {
        status: 429,
        headers: { ...headers, 'Retry-After': '60' },
      })
    }

    // ─── /health (no auth — for monitoring) ───
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        service: 'telegram-bot',
        queueSize: notificationQueue.length,
        configured: !!(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID),
        version: '0.3.0-secured',
      }), { status: 200, headers })
    }

    // ─── Auth gate — all other endpoints require Bearer token ───
    if (!verifyAuth(req)) {
      auditLog('auth_failed', ip, { path: url.pathname, method: req.method })
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers })
    }

    // ─── /queue (GET) — view pending notifications ───
    if (url.pathname === '/queue' && req.method === 'GET') {
      auditLog('queue_viewed', ip)
      return new Response(JSON.stringify({
        queue: notificationQueue,
        size: notificationQueue.length,
      }), { status: 200, headers })
    }

    // ─── /notify (POST) — send a notification ───
    if (url.pathname === '/notify' && req.method === 'POST') {
      try {
        const body = await req.json()
        const { type, data } = body

        if (!type || !data) {
          return new Response(JSON.stringify({ error: 'Missing type or data' }), { status: 400, headers })
        }

        // Allowlist of notification types (prevents arbitrary message injection)
        let message: string
        if (type === 'contact_message') {
          message = formatContactMessage(data)
        } else if (type === 'new_order') {
          message = formatOrderNotification(data)
        } else {
          auditLog('notify_invalid_type', ip, { type })
          return new Response(JSON.stringify({ error: `Unknown notification type: ${type}` }), { status: 400, headers })
        }

        const sent = await sendTelegramMessage(message)
        auditLog('notify_sent', ip, { type, sent })

        return new Response(JSON.stringify({
          success: sent,
          message: sent ? 'تم إرسال الإشعار' : 'تم تخزين الإشعار في قائمة الانتظار',
          queueSize: notificationQueue.length,
        }), { status: 200, headers })
      } catch (err) {
        auditLog('notify_error', ip, { error: err instanceof Error ? err.message : String(err) })
        return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500, headers })
      }
    }

    // ─── /retry (POST) — flush the queue ───
    if (url.pathname === '/retry' && req.method === 'POST') {
      if (notificationQueue.length === 0) {
        return new Response(JSON.stringify({
          success: true,
          message: 'لا توجد إشعارات معلقة',
        }), { status: 200, headers })
      }

      let sent = 0
      let failed = 0
      const total = notificationQueue.length

      while (notificationQueue.length > 0) {
        const item = notificationQueue.shift()!
        const ok = await sendTelegramMessage(item.text)
        if (ok) sent++
        else failed++
      }

      auditLog('retry_flushed', ip, { total, sent, failed })

      return new Response(JSON.stringify({ success: true, sent, failed }), { status: 200, headers })
    }

    // ─── 404 ───
    return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404, headers })
  },
})

console.log(`🤖 Telegram Bot Service (SECURED) running on port ${PORT}`)
console.log(`📡 Status: ${TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID ? 'Configured ✅' : 'Not configured ⚠️ (queue mode)'}`)
console.log(`🔒 Bearer auth: ${BEARER_TOKEN ? 'Enabled ✅' : 'DISABLED ⚠️ — set MINI_SERVICE_BEARER_TOKEN env var!'}`)
console.log(`🌐 CORS allowlist: ${ALLOWED_ORIGINS.length} origins`)

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received, shutting down...')
  server.stop()
  process.exit(0)
})
process.on('SIGINT', () => {
  console.log('[Server] SIGINT received, shutting down...')
  server.stop()
  process.exit(0)
})
