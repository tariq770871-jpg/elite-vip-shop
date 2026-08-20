"use client";

import { useEffect } from "react";

/**
 * Global Error Boundary
 *
 * Catches errors in the Root Layout that error.tsx cannot handle.
 * Without this file, a Layout crash results in a blank white screen.
 *
 * IMPORTANT: This component MUST include its own <html> and <body> tags
 * because the Root Layout is NOT rendered when a global error occurs.
 * It must also be a Client Component ("use client").
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service in production
    console.error("Global error (Layout crash):", error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>خطأ - متجر النخبة</title>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
              body {
                font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
                background: #0a0a0a;
                color: #e5e5e5;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 1rem;
                direction: rtl;
              }
              .error-container {
                text-align: center;
                max-width: 480px;
                width: 100%;
              }
              .error-icon {
                width: 80px; height: 80px;
                margin: 0 auto 1.5rem;
                background: rgba(239, 68, 68, 0.1);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .error-icon svg {
                width: 40px; height: 40px;
                color: #ef4444;
              }
              .error-title {
                font-size: 1.5rem;
                font-weight: 700;
                margin-bottom: 0.75rem;
                color: #fff;
              }
              .error-message {
                font-size: 0.875rem;
                color: #a3a3a3;
                line-height: 1.7;
                margin-bottom: 2rem;
              }
              .error-actions {
                display: flex;
                gap: 0.75rem;
                justify-content: center;
                flex-wrap: wrap;
              }
              .btn {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.625rem 1.25rem;
                border-radius: 0.75rem;
                font-size: 0.875rem;
                font-weight: 600;
                cursor: pointer;
                border: none;
                transition: opacity 0.15s;
              }
              .btn:hover { opacity: 0.9; }
              .btn-primary {
                background: linear-gradient(135deg, #d4a843, #b8942e);
                color: #000;
              }
              .btn-outline {
                background: transparent;
                color: #e5e5e5;
                border: 1px solid #404040;
              }
              .error-detail {
                margin-top: 1.5rem;
                padding: 0.75rem;
                background: rgba(239, 68, 68, 0.05);
                border: 1px solid rgba(239, 68, 68, 0.15);
                border-radius: 0.5rem;
                font-size: 0.75rem;
                color: #737373;
                font-family: monospace;
                direction: ltr;
                text-align: left;
                word-break: break-all;
                max-height: 120px;
                overflow-y: auto;
              }
            `,
          }}
        />
      </head>
      <body>
        <div className="error-container">
          <div className="error-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h1 className="error-title">حدث خطأ حرج</h1>
          <p className="error-message">
            نعتذر، حدث خطأ غير متوقع في النظام. يرجى تحديث الصفحة أو العودة إلى الصفحة الرئيسية والمحاولة مرة أخرى.
          </p>
          <div className="error-actions">
            <button className="btn btn-primary" onClick={() => reset()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              إعادة المحاولة
            </button>
            <button className="btn btn-outline" onClick={() => (window.location.href = "/")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              الصفحة الرئيسية
            </button>
          </div>
          {error?.digest && (
            <div className="error-detail">Ref: {error.digest}</div>
          )}
        </div>
      </body>
    </html>
  );
}
