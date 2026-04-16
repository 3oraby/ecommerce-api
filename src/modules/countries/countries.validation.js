const { z } = require("zod");

exports.createCountrySchema = z.object({
  body: z
    .object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      code: z
        .string()
        .length(2, "Code must be exactly 2 characters")
        .regex(/^[A-Z]{2}$/, "Code must be exactly 2 uppercase letters")
        .optional(),
    })
    .strict(),
});

exports.updateCountrySchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a numeric string"),
  }),
  body: z
    .object({
      name: z.string().min(2, "Name must be at least 2 characters").optional(),
      code: z
        .string()
        .length(2, "Code must be exactly 2 characters")
        .regex(/^[A-Z]{2}$/, "Code must be exactly 2 uppercase letters")
        .optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: "Request body cannot be empty",
    }),
});

exports.countryIdParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a numeric string"),
  }),
});
