import z from "zod";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const inviteMemberSchema = z.object({
  name: z.string().min(3, "Minimum 3 characters").max(50, "Maximum 50 characters"),
  email: z.string().regex(EMAIL_REGEX, { message: "Please provide a valid email." }),
});

export type InviteMemberSchemaType = z.infer<typeof inviteMemberSchema>;