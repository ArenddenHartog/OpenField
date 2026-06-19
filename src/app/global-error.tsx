"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#f7f6ef] p-6 text-center">
          <h1 className="text-xl font-semibold text-slate-950">Something went wrong</h1>
          <p className="max-w-sm text-sm text-slate-500">
            We&apos;ve been notified and are looking into it. Try refreshing the page.
          </p>
        </div>
      </body>
    </html>
  );
}
