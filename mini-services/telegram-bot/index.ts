// Telegram Bot Notification Service - Elite VIP Shop
// Sends notifications to admin via Telegram Bot API

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const PORT = 3005
const CONFIG_FILE = join(__dirname, 'config.json')

let TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
let TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || ''

function loadConfig() {
  if (existsSync(CONFIG_FILE)) {
    try {
      const saved = JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'))
      if (saved.botToken) TELEGRAM_BOT_TOKEN = saved.botToken
      if (saved.chatId) TELEGRAM_CHAT_ID = saved.chatId
      console.log('[Telegram] ✅ Loaded saved configuration')
    } catch {
      console.log('[Telegram] ⚠️ Failed to load saved config')
    }
  }
}

function saveConfig(token: string, chatId: string) {
  TELEGRAM_BOT_TOKEN = token
  TELEGRAM_CHAT_ID = chatId
  writeFileSync(CONFIG_FILE, JSON.stringify({ botToken: token, chatId: chatId }), 'utf-8')
  console.log('[Telegram] ✅ Configuration saved')
}

loadConfig()

const notificationQueue: any[] = []

async function sendTelegramMessage(text: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('[Telegram] ⚠️ Not configured. Message queued.')
    notificationQueue.push({ text, timestamp: new Date().toISOString() })
    return false
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    })

    const data = await response.json()

    if (data.ok) {
      console.log('[Telegram] ✅ Message sent successfully')
      return true
    } else {
      console.error('[Telegram] ❌ Failed:', data.description)
      notificationQueue.push({ text, timestamp: new Date().toISOString() })
      return false
    }
  } catch (error) {
    console.error('[Telegram] ❌ Error:', error)
    notificationQueue.push({ text, timestamp: new Date().toISOString() })
    return false
  }
}

function formatContactMessage(data: { name: string; email?: string; phone?: string; subject?: string; message: string }): string {
  const time = new Date().toLocaleString('ar-YE', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return `
<b>📩 رسالة تواصل جديدة</b>

👤 المرسل: <b>${data.name}</b>
${data.email ? `📧 البريد: <code>${data.email}</code>\n` : ''}${data.phone ? `📱 الهاتف: <code>${data.phone}</code>\n` : ''}${data.subject ? `📝 الموضوع: <b>${data.subject}</b>\n` : ''}
💬 الرسالة:
<i>${data.message}</i>

⏰ ${time}

<i>— متجر النخبة Elite VIP Shop</i>
  `.trim()
}

function formatOrderNotification(data: { orderNumber: string; customerName: string; total: number; items: string }): string {
  return `
<b>🛒 طلب جديد</b>

🆔 رقم الطلب: <b>${data.orderNumber}</b>
👤 العميل: <b>${data.customerName}</b>
💰 المبلغ: <b>${data.total.toLocaleString("ar-SA")} ر.ي</b>

📋 المنتجات:
${data.items}

⏰ ${new Date().toLocaleString('ar-YE', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}

<i>— متجر النخبة Elite VIP Shop</i>
  `.trim()
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url)

    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers })
    }

    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        service: 'telegram-bot',
        queueSize: notificationQueue.length,
        configured: !!(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID),
      }), { status: 200, headers })
    }

    if (url.pathname === '/configure' && req.method === 'POST') {
      try {
        const body = await req.json()
        const { botToken, chatId } = body
        if (botToken && chatId) {
          saveConfig(botToken, chatId)
          return new Response(JSON.stringify({ success: true, message: 'تم حفظ الإعدادات' }), { status: 200, headers })
        }
        return new Response(JSON.stringify({ error: 'بيانات غير كاملة' }), { status: 400, headers })
      } catch {
        return new Response(JSON.stringify({ error: 'خطأ' }), { status: 500, headers })
      }
    }

    if (url.pathname === '/queue' && req.method === 'GET') {
      return new Response(JSON.stringify({ queue: notificationQueue, size: notificationQueue.length }), { status: 200, headers })
    }

    if (url.pathname === '/notify' && req.method === 'POST') {
      try {
        const body = await req.json()
        const { type, data } = body

        let message: string

        if (type === 'contact_message') {
          message = formatContactMessage(data)
        } else if (type === 'new_order') {
          message = formatOrderNotification(data)
        } else {
          message = typeof data === 'string' ? data : JSON.stringify(data)
        }

        const sent = await sendTelegramMessage(message)

        return new Response(JSON.stringify({
          success: sent,
          message: sent ? 'تم إرسال الإشعار' : 'تم تخزين الإشعار في قائمة الانتظار',
          queueSize: notificationQueue.length,
        }), { status: 200, headers })
      } catch {
        return new Response(JSON.stringify({ error: 'خطأ في معالجة الطلب' }), { status: 500, headers })
      }
    }

    if (url.pathname === '/retry' && req.method === 'POST') {
      if (notificationQueue.length === 0) {
        return new Response(JSON.stringify({ success: true, message: 'لا توجد إشعارات معلقة' }), { status: 200, headers })
      }

      let sent = 0
      let failed = 0

      while (notificationQueue.length > 0) {
        const item = notificationQueue.shift()!
        const ok = await sendTelegramMessage(item.text)
        if (ok) sent++
        else failed++
      }

      return new Response(JSON.stringify({ success: true, sent, failed }), { status: 200, headers })
    }

    return new Response(JSON.stringify({ error: 'غير موجود' }), { status: 404, headers })
  },
})

console.log(`🤖 Telegram Bot Service running on port ${PORT}`)
console.log(`📡 Configured: ${!!(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) ? 'Yes ✅' : 'No ⚠️'}`)
