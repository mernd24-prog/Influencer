import { z } from "zod";

export const PASSWORD_MAX_LENGTH = 26;

const optionalText = (max, message) =>
  z.string().trim().max(max, message).optional().or(z.literal(""));

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email address is required.").email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required.").max(PASSWORD_MAX_LENGTH, `Password cannot exceed ${PASSWORD_MAX_LENGTH} characters.`),
});

export const associateSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required.").min(2, "Enter at least 2 characters.").max(50, "Enter no more than 50 characters."),
  lastName: optionalText(50, "Enter no more than 50 characters."),
  email: z.string().trim().min(1, "Email address is required.").email("Enter a valid email address.").max(254, "Email address is too long."),
  phone: z.string().trim().regex(/^\+?[0-9]{7,15}$/, "Use 7–15 digits, with an optional + prefix.").or(z.literal("")),
  code: z.string().trim().regex(/^[A-Za-z0-9_-]{3,30}$/, "Use 3–30 letters, numbers, hyphens, or underscores.").or(z.literal("")),
});

export const profileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required.").max(50, "First name cannot exceed 50 characters."),
  lastName: optionalText(50, "Last name cannot exceed 50 characters."),
  phone: z.string().trim().regex(/^\+?[0-9]{7,15}$/, "Enter a valid phone number."),
  dateOfBirth: z.string().optional(),
  address: z.object({
    postalCode: optionalText(12, "Postal code cannot exceed 12 characters."),
  }).passthrough(),
}).passthrough();

export const createWithdrawalSchema = ({ minimum, maximum }) => z.object({
  amount: z.string().trim().min(1, "Enter a withdrawal amount.").regex(/^\d+(?:\.\d{1,2})?$/, "Withdrawal amount can have at most 2 decimal places."),
  destination: z.enum(["saved_bank", "saved_upi", "one_time_upi", "upi_qr"]),
  upiId: z.string().trim(),
  payoutQrUrl: z.string().trim(),
}).superRefine((value, context) => {
  const amount = Number(value.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    context.addIssue({ code: "custom", path: ["amount"], message: "Enter a valid withdrawal amount greater than zero." });
  } else if (amount < minimum) {
    context.addIssue({ code: "custom", path: ["amount"], message: `Minimum withdrawal is ${minimum} coins.` });
  } else if (amount > maximum) {
    context.addIssue({ code: "custom", path: ["amount"], message: `You can withdraw up to ${maximum} coins.` });
  }

  if (["one_time_upi", "upi_qr"].includes(value.destination) && !/^[\w.-]+@[\w.-]+$/.test(value.upiId)) {
    context.addIssue({ code: "custom", path: ["upiId"], message: "Enter a valid UPI ID." });
  }
  if (value.destination === "upi_qr" && !value.payoutQrUrl) {
    context.addIssue({ code: "custom", path: ["payoutQrUrl"], message: "Upload a UPI QR image." });
  }
});

export const getZodFieldErrors = (error) => {
  const errors = {};
  error?.issues?.forEach((issue) => {
    const field = issue.path[0];
    if (field && !errors[field]) errors[field] = issue.message;
  });
  return errors;
};

export const getFirstZodError = (error, fallback = "Please check the form fields.") =>
  error?.issues?.[0]?.message || fallback;
