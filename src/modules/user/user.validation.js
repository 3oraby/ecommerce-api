const { z } = require("zod");
const Roles = require("../../enums/roles.enum");

exports.createUserSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email("Invalid email format"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .optional(),
    phone: z.string().optional(),
    birth_date: z.string().datetime().optional().or(z.date().optional()),
    profile_image: z.string().url("Invalid URL").optional(),
    role: z.enum([Roles.ADMIN, Roles.CUSTOMER, Roles.SELLER]).optional(),
    is_active: z.boolean().optional(),
    is_verified: z.boolean().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

exports.updateUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a numeric string"),
  }),
  body: z
    .object({
      name: z.string().optional(),
      email: z.string().email("Invalid email format").optional(),
      password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .optional(),
      phone: z.string().optional(),
      birth_date: z.string().datetime().optional().or(z.date().optional()),
      profile_image: z.string().url("Invalid URL").optional(),
      role: z.enum([Roles.ADMIN, Roles.CUSTOMER, Roles.SELLER]).optional(),
      is_active: z.boolean().optional(),
      is_verified: z.boolean().optional(),
    })
    .strict(),
  query: z.object({}).optional(),
});

exports.userIdParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a numeric string"),
  }),
});
