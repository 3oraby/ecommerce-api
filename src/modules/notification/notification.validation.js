const { z } = require("zod");

exports.saveFcmTokenSchema = z.object({
  body: z
    .object({
      fcmToken: z
        .string({
          message: "fcmToken is required and should be a string",
        })
        .trim()
        .min(
          100,
          "Invalid FCM token: token is too short to be a valid Firebase token",
        )
        .max(5000, "Invalid FCM token: token is too long")
        .regex(/^[A-Za-z0-9:_-]+$/, "Invalid FCM token format"),
    })
    .strict(),
});

exports.testNotificationSchema = z.object({
  body: z
    .object({
      title: z.string({ message: "Title is required" }).optional(),
      body: z.string({ message: "Body is required" }).optional(),
      data: z.object().passthrough().optional(),
    })
    .strict()
    .optional(),
});
