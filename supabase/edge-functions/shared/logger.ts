export type LogContext = Record<string, unknown> & {
  requestId?: string;
  userId?: string;
};

export const log = (level: "info" | "warn" | "error", message: string, context: LogContext = {}) => {
  console.log(
    JSON.stringify({
      level,
      message,
      timestamp: new Date().toISOString(),
      service: "closetly-edge",
      ...context
    })
  );
};
