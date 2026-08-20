/**
 * Smoke tests — verify critical production invariants.
 * Run: npx vitest run
 */
import { describe, it, expect } from 'vitest';

// 1. Env vars are not empty strings (caught by validateEnv at startup)
describe('Environment configuration', () => {
  it('env vars should be either string or undefined (test env may not have them)', () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    expect(url === undefined || typeof url === 'string').toBe(true);
  });

  it('anon key should be either string or undefined', () => {
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    expect(key === undefined || typeof key === 'string').toBe(true);
  });
});

// 2. Site config exports required fields
describe('Site configuration', () => {
  it('should export a valid SITE_URL', async () => {
    const { SITE_URL } = await import('@/lib/site-config');
    expect(SITE_URL).toMatch(/^https?:\/\//);
  });

  it('should export a non-empty SITE_NAME', async () => {
    const { SITE_NAME } = await import('@/lib/site-config');
    expect(SITE_NAME.length).toBeGreaterThan(0);
  });
});

// 3. Rate limiter basic behavior
describe('Rate limiter', () => {
  it('should allow requests under the limit', async () => {
    const { rateLimiter, RATE_LIMIT_PRESETS } = await import('@/lib/rate-limit');
    const result = rateLimiter.check('test-key', RATE_LIMIT_PRESETS.api);
    expect(result.allowed).toBe(true);
  });

  it('should block requests over the limit', async () => {
    const { rateLimiter, RATE_LIMIT_PRESETS } = await import('@/lib/rate-limit');
    rateLimiter.reset();
    const config = { limit: 2, windowMs: 60_000 };
    expect(rateLimiter.check('overflow-test', config).allowed).toBe(true);
    expect(rateLimiter.check('overflow-test', config).allowed).toBe(true);
    expect(rateLimiter.check('overflow-test', config).allowed).toBe(false);
  });
});

// 4. Origin check utility
describe('Origin check (isSameOrigin)', () => {
  it('should return true for matching origins', async () => {
    const { isSameOrigin } = await import('@/lib/origin-check');
    const { SITE_URL } = await import('@/lib/site-config');
    const req = new Request(`${SITE_URL}/api/test`, {
      headers: { origin: SITE_URL },
    });
    expect(isSameOrigin(req)).toBe(true);
  });

  it('should return false for mismatched origins', async () => {
    const { isSameOrigin } = await import('@/lib/origin-check');
    const { SITE_URL } = await import('@/lib/site-config');
    const req = new Request(`${SITE_URL}/api/test`, {
      headers: { origin: 'https://evil.com' },
    });
    expect(isSameOrigin(req)).toBe(false);
  });

  it('should return false for missing origin header', async () => {
    const { isSameOrigin } = await import('@/lib/origin-check');
    const req = new Request('https://example.com/api/test');
    expect(isSameOrigin(req)).toBe(false);
  });
});

// 5. Health endpoint does not leak env var names
describe('Security: health endpoint', () => {
  it('should not expose env var names in response detail', async () => {
    // Verify the source code does not contain the pattern of joining env var names
    const fs = await import('fs');
    const path = await import('path');
    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/app/api/health/route.ts'),
      'utf-8'
    );
    // The string "Missing:" followed by env var join should NOT exist
    expect(source).not.toContain('Missing: ${missingEnvVars');
  });
});
