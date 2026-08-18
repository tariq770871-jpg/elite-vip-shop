/**
 * Environment Variable Validation
 *
 * Validates that all required environment variables are present at build/start time.
 * Provides clear error messages when configuration is missing.
 *
 * Usage: import '@/lib/env' at the top of layout.tsx or instrumentation.ts
 */

type EnvVarDef = {
  name: string;
  required: boolean;
  public: boolean; // NEXT_PUBLIC_ prefix
  description: string;
};

const ENV_SCHEMA: EnvVarDef[] = [
  // Required
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    required: true,
    public: true,
    description: "Supabase project URL",
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    required: true,
    public: true,
    description: "Supabase anonymous key (safe for browser)",
  },
  {
    name: "SUPABASE_SERVICE_ROLE_KEY",
    required: true,
    public: false,
    description: "Supabase service role key (server-only, never expose)",
  },
  {
    name: "NEXT_PUBLIC_SITE_URL",
    required: false,
    public: true,
    description: "Public site URL (e.g., https://elite-vip-shop.vercel.app)",
  },
  // Optional
  {
    name: "NEXT_PUBLIC_GA_MEASUREMENT_ID",
    required: false,
    public: true,
    description: "Google Analytics 4 Measurement ID",
  },
  {
    name: "NEXT_PUBLIC_GSC_VERIFICATION",
    required: false,
    public: true,
    description: "Google Search Console verification code",
  },
  {
    name: "NEXT_PUBLIC_WHATSAPP_NUMBER",
    required: false,
    public: true,
    description: "WhatsApp contact number",
  },
  {
    name: "SUPABASE_DB_PASSWORD",
    required: false,
    public: false,
    description: "Database password for direct PostgreSQL connections",
  },
  {
    name: "TELEGRAM_BOT_TOKEN",
    required: false,
    public: false,
    description: "Telegram bot token for admin notifications",
  },
  {
    name: "TELEGRAM_CHAT_ID",
    required: false,
    public: false,
    description: "Telegram chat ID for admin notifications",
  },
];

/**
 * Validate required environment variables.
 * Logs warnings for missing required vars in development, throws in production.
 * Should be called once at application startup.
 */
export function validateEnv(): {
  valid: boolean;
  missing: string[];
  warnings: string[];
} {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const varDef of ENV_SCHEMA) {
    const value = process.env[varDef.name];

    if (!value || value === "") {
      if (varDef.required) {
        missing.push(varDef.name);
      } else {
        warnings.push(`${varDef.name} — ${varDef.description}`);
      }
    }

    // Warn if a server-only variable is accidentally prefixed with NEXT_PUBLIC_
    if (!varDef.public && varDef.name.startsWith("NEXT_PUBLIC_")) {
      warnings.push(
        `${varDef.name} is a server-only variable but has NEXT_PUBLIC_ prefix — it will be exposed to the browser!`
      );
    }
  }

  if (missing.length > 0) {
    const isDev = process.env.NODE_ENV === "development";
    const message = [
      `❌ Missing required environment variables:`,
      ...missing.map((n) => `  - ${n}`),
      ``,
      `Please check your .env.local file. See .env.example for reference.`,
    ].join("\n");

    if (isDev) {
      console.warn(message);
      console.warn(
        `⚠️ Running with missing env vars — some features will use fallback/mock data.`
      );
    } else {
      // In production: fail-fast. A deployment missing required env vars
      // will produce 503s on every endpoint with no obvious root cause.
      // Throwing here surfaces the failure at boot so the operator can
      // fix it immediately instead of debugging mysterious runtime errors.
      // (instrumentation.ts runs this once at server start.)
      console.error(message);
      throw new Error(
        `Missing required environment variables: ${missing.join(", ")}. ` +
        `Application cannot start in production without these. ` +
        `See .env.example for the full list.`
      );
    }
  }

  if (warnings.length > 0 && missing.length === 0) {
    console.info(
      `ℹ️ Optional environment variables not set:\n${warnings.map((w) => `  - ${w}`).join("\n")}`
    );
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}
