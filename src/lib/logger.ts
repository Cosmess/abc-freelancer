export type SecurityEvent =
  | "auth.login.success"
  | "auth.login.failure"
  | "auth.login.email_not_verified"
  | "auth.signup.success"
  | "auth.signup.failure"
  | "auth.logout"
  | "auth.resend_verification"
  | "access.denied"
  | "payment.webhook.received"
  | "payment.webhook.invalid_signature"
  | "payment.webhook.missing_signature"
  | "payment.sync.error"
  | "rate_limit.exceeded";

export function logSecurity(
  event: SecurityEvent,
  context: Record<string, unknown> = {},
) {
  console.log(
    JSON.stringify({
      level: "security",
      event,
      timestamp: new Date().toISOString(),
      ...context,
    }),
  );
}

export function logError(
  message: string,
  context: Record<string, unknown> = {},
) {
  console.error(
    JSON.stringify({
      level: "error",
      message,
      timestamp: new Date().toISOString(),
      ...context,
    }),
  );
}
