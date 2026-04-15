const { z } = require("zod");
const Roles = require("../../enums/roles.enum");

exports.signupValidation = z.object({
  body: z.object({
    name: z
      .string({
        message: "Invalid request body. Expected 'name' field",
      })
      .min(3, "Name must be at least 3 characters long"),

    email: z
      .string({
        message: "Invalid request body. Expected 'email' field",
      })
      .email("Invalid email address"),

    password: z
      .string({
        message: "Invalid request body. Expected 'password' field",
      })
      .min(6, "Password must be at least 6 characters long"),

    role: z
      .string({
        message: "Role is required",
      })
      .transform((val) => val.toUpperCase())
      .refine(
        (val) => [Roles.ADMIN, Roles.SELLER, Roles.CUSTOMER].includes(val),
        {
          message: "Invalid role. Expected 'admin', 'seller', or 'customer'",
        },
      ),

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
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Expected YYYY-MM-DD")
      .optional(),
  }),
});

exports.loginValidation = z.object({
  body: z.object({
    email: z.string({
      message: "Invalid request body. Expected 'email' field",
    }),

    password: z.string({
      message: "Invalid request body. Expected 'password' field",
    }),
  }),
});

exports.verifyEmailValidation = z.object({
  body: z.object({
    email: z.string({
      message: "Invalid request body. Expected 'email' field",
    }),

    otp: z.string({
      message: "Invalid request body. Expected 'otp' field",
    }),
  }),
});

exports.resendEmailVerificationValidation = z.object({
  body: z.object({
    email: z
      .string({
        message: "Invalid request body. Expected 'email' field",
      })
      .email("Invalid email address"),
  }),
});

exports.forgotPasswordValidation = z.object({
  body: z.object({
    email: z
      .string({
        message: "Invalid request body. Expected 'email' field",
      })
      .email("Invalid email address"),
  }),
});

exports.verifyResetOtpValidation = z.object({
  body: z.object({
    email: z
      .string({
        message: "Invalid request body. Expected 'email' field",
      })
      .email("Invalid email address"),
    otp: z.string({
      message: "Invalid request body. Expected 'otp' field",
    }),
  }),
});

exports.resetPasswordValidation = z.object({
  body: z.object({
    resetToken: z.string({
      message: "Invalid request body. Expected 'resetToken' field",
    }),
    newPassword: z
      .string({
        message: "Invalid request body. Expected 'newPassword' field",
      })
      .min(6, "Password must be at least 6 characters long"),
  }),
});

exports.resendPasswordResetOtpValidation = z.object({
  body: z.object({
    email: z
      .string({
        message: "Invalid request body. Expected 'email' field",
      })
      .email("Invalid email address"),
  }),
});

exports.updatePasswordValidation = z.object({
  body: z
    .object({
      currentPassword: z.string({
        message: "Invalid request body. Expected 'currentPassword' field",
      }),

      newPassword: z
        .string({
          message: "Invalid request body. Expected 'newPassword' field",
        })
        .min(6, "Password must be at least 6 characters long"),
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: "New password must be different from current password",
      path: ["newPassword"],
    }),
});
