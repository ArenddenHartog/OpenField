"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code || !supabase) {
      router.replace("/");
      return;
    }
    supabase.auth
      .exchangeCodeForSession(code)
      .finally(() => router.replace("/"));
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f6ef]">
      <p className="text-sm text-slate-500">Signing you in…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <CallbackHandler />
    </Suspense>
  );
}
