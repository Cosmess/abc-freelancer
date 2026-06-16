import type { z } from "zod";

export type SignupFieldErrors<T extends Record<string, unknown>> = Partial<
  Record<keyof T, string[]>
>;

export function validateSignupValues<T extends Record<string, unknown>>(
  schema: z.ZodType,
  values: T,
): SignupFieldErrors<T> {
  const parsed = schema.safeParse(values);

  if (parsed.success) {
    return {};
  }

  return parsed.error.flatten().fieldErrors as SignupFieldErrors<T>;
}

export function validateSignupField<T extends Record<string, unknown>>(
  schema: z.ZodType,
  values: T,
  field: keyof T,
): string[] | undefined {
  return validateSignupValues(schema, values)[field];
}
