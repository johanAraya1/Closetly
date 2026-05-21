export class AppError extends Error {
  constructor(
    message: string,
    public code = "APP_ERROR",
    public recoverable = true
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unexpected error";
};
