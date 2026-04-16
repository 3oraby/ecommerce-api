const { z } = require("zod");

exports.createStateSchema = z.object({
  params: z.object({
    countryId: z.string().regex(/^\d+$/, "Country ID must be a numeric string"),
  }),
  body: z
    .object({
      name: z.string().min(2, "Name must be at least 2 characters"),
    })
    .strict(),
});

exports.updateStateSchema = z.object({
  params: z.object({
    countryId: z.string().regex(/^\d+$/, "Country ID must be a numeric string"),
    id: z.string().regex(/^\d+$/, "ID must be a numeric string"),
  }),
  body: z
    .object({
      name: z.string().min(2, "Name must be at least 2 characters").optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: "Request body cannot be empty",
    }),
});

exports.stateIdParamsSchema = z.object({
  params: z.object({
    countryId: z.string().regex(/^\d+$/, "Country ID must be a numeric string"),
    id: z.string().regex(/^\d+$/, "ID must be a numeric string"),
  }),
});
