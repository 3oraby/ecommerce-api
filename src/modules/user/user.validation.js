const { z } = require("zod");
const Roles = require("../../enums/roles.enum");
const AccountStatus = require("../../enums/accountStatus.enum");

exports.createUserSchema = z.object({
  body: z
    .object({
      name: z.string().min(3, "Name must be at least 3 characters").optional(),
      email: z.string().email("Invalid email format"),
      password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .optional(),
      phone: z
        .string()
        .regex(/^01[0125][0-9]{8}$/, "Invalid Egyptian phone number")
        .optional(),
      birth_date: z
        .string()
        .regex(
          /^\d{4}-\d{2}-\d{2}$/,
          "Invalid date format. Expected YYYY-MM-DD",
        )
        .optional(),
      role: z.nativeEnum(Roles).optional(),
      account_status: z.nativeEnum(AccountStatus).optional(),
    })
    .strict(),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

exports.updateUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a numeric string"),
  }),
  body: z
    .object({
      name: z.string().min(3, "Name must be at least 3 characters").optional(),
      phone: z
        .string()
        .regex(/^01[0125][0-9]{8}$/, "Invalid Egyptian phone number")
        .optional(),
      role: z.nativeEnum(Roles).optional(),
      account_status: z.nativeEnum(AccountStatus).optional(),
      birth_date: z
        .string()
        .regex(
          /^\d{4}-\d{2}-\d{2}$/,
          "Invalid date format. Expected YYYY-MM-DD",
        )
        .optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: "Request body cannot be empty",
    }),
  query: z.object({}).optional(),
});

exports.updateMeSchema = z.object({
  body: z
    .object({
      name: z.string().min(3, "Name must be at least 3 characters").optional(),
      phone: z
        .string()
        .transform((val) => val.replace(/^(\+2|002)/, "0"))
        .refine(
          (val) => /^01[0125][0-9]{8}$/.test(val) || /^\+\d{10,15}$/.test(val),
          {
            message: "Invalid phone number",
          },
        )
        .optional(),
      birth_date: z
        .string()
        .regex(
          /^\d{4}-\d{2}-\d{2}$/,
          "Invalid date format. Expected YYYY-MM-DD",
        )
        .optional(),
    })
    .strict(),
});

exports.userIdParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a numeric string"),
  }),
});
