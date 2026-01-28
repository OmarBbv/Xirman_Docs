import * as Sentry from "@sentry/nestjs";

Sentry.init({
  dsn: "https://30c69e56cfaa7c6fdef7aec3e25e2ef6@o4510789802000384.ingest.de.sentry.io/4510789821792336",
  sendDefaultPii: true,
  debug: false,
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});