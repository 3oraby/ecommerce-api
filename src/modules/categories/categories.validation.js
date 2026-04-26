const { z } = require("zod");

exports.createCategorySchema = z.object({
  body: z
    .object({
      name: z
        .string({ message: "name is required" })
        .min(2, "Name must be at least 2 characters"),
      description: z.string().optional(),
    })
    .strict(),
});

exports.updateCategorySchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a numeric string"),
  }),
  body: z
    .object({
      name: z.string().min(2, "Name must be at least 2 characters").optional(),
      description: z.string().optional(),
      image: z.string().url("Image must be a valid URL").optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: "Request body cannot be empty",
    }),
});

exports.paramsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a numeric string"),
  }),
});
