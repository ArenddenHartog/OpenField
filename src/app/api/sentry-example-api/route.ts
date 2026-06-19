export const dynamic = "force-dynamic";

class SentryExampleApiError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = "SentryExampleApiError";
  }
}

export function GET() {
  throw new SentryExampleApiError("This error is raised on the backend called by the example page.");
}
