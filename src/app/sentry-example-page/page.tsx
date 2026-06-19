"use client";

import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";

export default function SentryExamplePage() {
  async function triggerError() {
    await Sentry.startSpan({ name: "Sentry example page test span" }, async () => {
      const res = await fetch("/api/sentry-example-api");
      if (!res.ok) {
        // Surfaces a client-side error too, in addition to the server-side one above.
        throw new Error("Sentry example frontend error");
      }
    });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f7f6ef] p-6 text-center">
      <h1 className="text-2xl font-semibold text-slate-950">Sentry test page</h1>
      <p className="max-w-sm text-sm text-slate-500">
        Click the button to trigger a backend and a frontend error. If Sentry is
        configured correctly, both should show up in your Sentry Issues within a
        minute or two.
      </p>
      <Button onClick={triggerError} className="rounded-xl bg-emerald-800 hover:bg-emerald-900">
        Trigger test error
      </Button>
    </div>
  );
}
