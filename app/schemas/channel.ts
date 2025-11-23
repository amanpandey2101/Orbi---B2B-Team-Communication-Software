import z from "zod";

export function transformChannelName(name: string): string {
  return name
    .toLowerCase()
    .replaceAll(/\s+/g, "-")
    .replaceAll(/[^a-z0-9-]/g, "")
    .replaceAll(/-+/g, "-")
    .replaceAll(/(^-)|(-$)/g, "");
}

export const ChannelNameSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(50, "Name can be a maximum of 50 characters.")
    .transform((name, ctx) => {
      const transformed = transformChannelName(name);

      if (transformed.length < 2) {
        ctx.addIssue({
          code: "custom",
          message: "The channel name must contain at least 2 characters after conversion.",
        });

        return z.NEVER;
      }

      return transformed;
    }),
});

export type ChannelSchemaNameType = z.infer<typeof ChannelNameSchema>;