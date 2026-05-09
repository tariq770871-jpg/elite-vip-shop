"use client";

import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-10 text-destructive" />
          </div>
          <div>
            <h2 className="mb-2 text-xl font-bold">حدث خطأ غير متوقع</h2>
            <p className="text-sm text-muted-foreground max-w-md">
              نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى أو العودة للرئيسية.
            </p>
            {this.state.error && (
              <p className="mt-2 text-xs text-muted-foreground/60 font-mono" dir="ltr">
                {this.state.error.message}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="gap-2"
            >
              <RefreshCw className="size-4" />
              إعادة المحاولة
            </Button>
            <Button
              onClick={() => window.location.href = "/"}
              className="btn-3d-sm gap-2"
            >
              <Home className="size-4" />
              الرئيسية
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
