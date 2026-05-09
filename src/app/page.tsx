import { App } from "@/components/app";
import { ErrorBoundary } from "@/components/error-boundary";

export default function Home() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
