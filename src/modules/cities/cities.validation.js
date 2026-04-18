const { z } = require("zod");

exports.createCitySchema = z.object({
  params: z.object({
    stateId: z.string().regex(/^\d+$/, "State ID must be a numeric string"),
  }),
  body: z
    .object({
      name: z.string().min(2, "Name must be at least 2 characters"),
    })
    .strict(),
});

exports.updateCitySchema = z.object({
  params: z.object({
    stateId: z.string().regex(/^\d+$/, "State ID must be a numeric string"),
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

exports.cityIdParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a numeric string"),
  }),
});

exports.getCitiesByStateParamsSchema = z.object({
  params: z.object({
    stateId: z.string().regex(/^\d+$/, "State ID must be a numeric string"),
    id: z.string().regex(/^\d+$/, "ID must be a numeric string"),
  }),
});

exports.stateIdParamsSchema = z.object({
  params: z.object({
    stateId: z.string().regex(/^\d+$/, "State ID must be a numeric string"),
  }),
});
