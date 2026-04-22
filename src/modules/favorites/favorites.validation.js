const { z } = require("zod");

exports.paramsSchema = z.object({
  params: z.object({
    productId: z.string().regex(/^\d+$/, "Product ID must be a numeric string"),
  }),
});
