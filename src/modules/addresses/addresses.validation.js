const { z } = require("zod");

exports.createAddressSchema = z.object({
  body: z
    .object({
      address_line1: z
        .string()
        .min(2, "Address line 1 must be at least 2 characters"),
      address_line2: z.string().optional(),
      country_id: z.number().int("Country ID must be an integer"),
      state_id: z.number().int("State ID must be an integer"),
      city_id: z.number().int("City ID must be an integer"),
      is_default: z.boolean().optional(),
    })
    .strict(),
});

exports.updateAddressSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a numeric string"),
  }),
  body: z
    .object({
      address_line1: z
        .string()
        .min(2, "Address line 1 must be at least 2 characters")
        .optional(),
      address_line2: z.string().optional(),
      country_id: z.number().int("Country ID must be an integer").optional(),
      state_id: z.number().int("State ID must be an integer").optional(),
      city_id: z.number().int("City ID must be an integer").optional(),
      is_default: z.boolean().optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: "Request body cannot be empty",
    })
    .refine((data) => !("is_default" in data), {
      message:
        "Default address must be changed using the dedicated endpoint: PATCH /addresses/:id/default",
      path: ["is_default"],
    }),
});

exports.addressIdParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a numeric string"),
  }),
});
