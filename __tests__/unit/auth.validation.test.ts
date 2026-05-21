import { loginSchema, registerSchema } from "@/features/auth/validations/auth.validation";

describe("auth validation", () => {
  it("accepts valid login input", () => {
    expect(loginSchema.safeParse({ email: "user@example.com", password: "password123" }).success).toBe(true);
  });

  it("rejects unsafe usernames", () => {
    expect(
      registerSchema.safeParse({
        email: "user@example.com",
        password: "password123",
        username: "bad name!"
      }).success
    ).toBe(false);
  });
});
