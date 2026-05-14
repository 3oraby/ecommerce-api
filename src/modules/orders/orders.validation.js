const { z } = require("zod");
const PaymentMethod = require("../../enums/paymentMethod.enum");
const OrderStatus = require("../../enums/orderStatus.enum");

exports.checkoutSchema = z.object({
  body: z
    .object({
      address_id: z.number().int().positive(),
      payment_method: z.enum(
        Object.values(PaymentMethod),
        `Expected payment_method to be one of ${Object.values(PaymentMethod).join(", ")}`,
      ),
      wallet_phone: z.string().optional(),
    })
    .strict(),
});

exports.updateStatusSchema = z.object({
  body: z
    .object({
      status: z.enum(
        Object.values(OrderStatus),
        `Expected status to be one of ${Object.values(OrderStatus).join(", ")}`,
      ),
    })
    .strict(),
  params: z.object({
    id: z.string().regex(/^\d+$/, "Invalid order ID"),
  }),
});

exports.retryPaymentSchema = z.object({
  body: z
    .object({
      payment_method: z.enum(
        Object.values(PaymentMethod),
        `Expected payment_method to be one of ${Object.values(PaymentMethod).join(", ")}`,
      ),
      wallet_phone: z.string().optional(),
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