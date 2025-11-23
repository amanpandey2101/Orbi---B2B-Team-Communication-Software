import z from "zod";

export const workspaceSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(50, "Name can be a maximum of 50 characters."),
});

export type WorkspaceSchemaType = z.infer<typeof workspaceSchema>;