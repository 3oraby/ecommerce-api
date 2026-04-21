const { z } = require("zod");

exports.createProductSchema = z.object({
  body: z
    .object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      description: z.string().optional(),
      price: z.number().positive("Price must be a positive number"),
      stock: z.number().int().nonnegative("Stock must be a non-negative integer"),
      categories: z.array(z.number().int()).min(1, "At least one category is required"),
      images: z.array(z.string().url("Each image must be a valid URL")).min(1, "At least one image is required"),
    })
    .strict(),
});

exports.updateProductSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a numeric string"),
  }),
  body: z
    .object({
      name: z.string().min(2).optional(),
      description: z.string().optional(),
      price: z.number().positive().optional(),
      stock: z.number().int().nonnegative().optional(),
      categories: z.array(z.number().int()).min(1).optional(),
      main_image: z.string().url().optional(),
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

exports.categoryParamsSchema = z.object({
  params: z.object({
    categoryId: z.string().regex(/^\d+$/, "Category ID must be a numeric string"),
  }),
});
