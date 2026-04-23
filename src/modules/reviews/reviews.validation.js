const { z } = require("zod");

exports.createReviewSchema = z.object({
  params: z
    .object({
      productId: z.string().regex(/^\d+$/, "Invalid product ID"),
    })
    .strict(),
  body: z
    .object({
      rating: z.number().int().min(1).max(5),
      review: z.string().min(1).max(1000).optional(),
    })
    .strict(),
});

exports.updateReviewSchema = z.object({
  params: z
    .object({
      productId: z.string().regex(/^\d+$/, "Invalid product ID"),
    })
    .strict(),
  body: z
    .object({
      rating: z.number().int().min(1).max(5).optional(),
      review: z.string().min(1).max(1000).optional(),
    })
    .strict()
    .refine((data) => data.rating !== undefined || data.review !== undefined, {
      message: "At least one field to update must be provided",
    }),
});

exports.getProductReviewsSchema = z.object({
  params: z.object({
    productId: z.string().regex(/^\d+$/, "Invalid product ID"),
  }),
});
