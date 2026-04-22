const { z } = require("zod");
const PaymentMethod = require("../../enums/paymentMethod.enum");
const OrderStatus = require("../../enums/orderStatus.enum");

exports.checkoutSchema = z.object({
  body: z
    .object({
      address_id: z.number().int().positive(),
      payment_method: z.enum(Object.values(PaymentMethod)),
    })
    .strict(),
});

exports.updateStatusSchema = z.object({
  body: z
    .object({
      status: z.enum(Object.values(OrderStatus)),
    })
    .strict(),
  params: z.object({
    id: z.string().regex(/^\d+$/, "Invalid order ID"),
  }),
});

exports.paramIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "Invalid order ID"),
  }),
});
