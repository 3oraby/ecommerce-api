const { z } = require("zod");

exports.addToCartSchema = z.object({
  body: z.object({
    quantity: z.number().int().positive().optional().default(1),
  }).strict(),
  params: z.object({
    productId: z.string().regex(/^\d+$/, "Product ID must be a numeric string"),
  }),
});

exports.updateCartItemSchema = z.object({
  body: z.object({
    quantity: z.number().int().nonnegative(),
  }).strict(),
  params: z.object({
    productId: z.string().regex(/^\d+$/, "Product ID must be a numeric string"),
  }),
});

exports.paramsSchema = z.object({
  params: z.object({
    productId: z.string().regex(/^\d+$/, "Product ID must be a numeric string"),
  }),
});
