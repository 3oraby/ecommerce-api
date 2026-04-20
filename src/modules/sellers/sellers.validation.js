const { z } = require("zod");

exports.createSellerSchema = z.object({
  body: z
    .object({
      store_name: z.string().min(2, "Store name must be at least 2 characters"),
      business_info: z.string().optional(),
      is_store_verified: z.boolean().optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: "Request body cannot be empty",
    })
    .refine((data) => !("is_store_verified" in data), {
      message: "Wrong Route! you can not set is_store_verified",
      path: ["is_store_verified"],
    }),
});

exports.updateSellerSchema = z.object({
  body: z
    .object({
      store_name: z
        .string()
        .min(2, "Store name must be at least 2 characters")
        .optional(),
      business_info: z.string().optional(),
      is_store_verified: z.boolean().optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: "Request body cannot be empty",
    })
    .refine((data) => !("is_store_verified" in data), {
      message: "Wrong Route! you can not set is_store_verified",
      path: ["is_store_verified"],
    }),
});

exports.paramsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a numeric string"),
  }),
});
