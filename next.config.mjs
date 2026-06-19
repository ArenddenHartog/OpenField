import { withSentryConfig } from "@sentry/nextjs";

const nextConfig = {};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  disableLogger: true,
  // Skip source map upload entirely when no auth token is configured
  // (e.g. local dev, or before the user has set up a Sentry project).
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
});
