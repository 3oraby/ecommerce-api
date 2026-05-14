const axios = require("axios");
const crypto = require("crypto");

class PaymobService {
  constructor() {
    this.apiKey = process.env.PAYMOB_API_KEY;
    this.hmacSecret = process.env.PAYMOB_HMAC;
    this.baseUrl = process.env.PAYMOB_API_URL;

    this.cardIntegrationId = process.env.PAYMOB_CARD_INTEGRATION_ID;
    this.walletIntegrationId = process.env.PAYMOB_WALLET_INTEGRATION_ID;
    this.fawryIntegrationId = process.env.PAYMOB_FAWRY_INTEGRATION_ID;
    this.iframeId = process.env.PAYMOB_IFRAME_ID;
  }

  async authenticate() {
    const response = await axios.post(`${this.baseUrl}/auth/tokens`, {
      api_key: this.apiKey,
    });
    return response.data.token;
  }

  async createOrder(token, amountCents, merchantOrderId, items = []) {
    const response = await axios.post(`${this.baseUrl}/ecommerce/orders`, {
      auth_token: token,
      delivery_needed: "false",
      amount_cents: amountCents,
      currency: "EGP",
      merchant_order_id: merchantOrderId,
      items: items,
    });
    return response.data;
  }

  async createPaymentKey(
    token,
    orderId,
    amountCents,
    integrationId,
    billingData,
  ) {
    const response = await axios.post(
      `${this.baseUrl}/acceptance/payment_keys`,
      {
        auth_token: token,
        amount_cents: amountCents,
        expiration: 3600,
        order_id: orderId,
        billing_data: billingData,
        currency: "EGP",
        integration_id: integrationId,
      },
    );
    return response.data.token;
  }

  generateIframeUrl(paymentKey) {
    return `https://accept.paymob.com/api/acceptance/iframes/${this.iframeId}?payment_token=${paymentKey}`;
  }

  async generateWalletUrl(paymentKey, phoneNumber) {
    const response = await axios.post(
      `${this.baseUrl}/acceptance/payments/pay`,
      {
        source: {
          identifier: phoneNumber,
          subtype: "WALLET",
        },
        payment_token: paymentKey,
      },
    );
    return response.data;
  }

  async generateFawryReference(paymentKey) {
    const response = await axios.post(
      `${this.baseUrl}/acceptance/payments/pay`,
      {
        source: {
          identifier: "Fawry",
          subtype: "Fawry",
        },
        payment_token: paymentKey,
      },
    );
    return response.data;
  }

  verifyWebhookHmac(queryData, hmac) {
    const obj = queryData.obj || {};
    const sourceData = obj.source_data || {};

    const payload = [
      obj.amount_cents,
      obj.created_at,
      obj.currency,
      obj.error_occured,
      obj.has_parent_transaction,
      obj.id,
      obj.integration_id,
      obj.is_3d_secure,
      obj.is_auth,
      obj.is_capture,
      obj.is_refunded,
      obj.is_standalone_payment,
      obj.is_voided,
      obj.order?.id,
      obj.owner,
      obj.pending,
      sourceData.pan || "",
      sourceData.sub_type || "",
      sourceData.type || "",
      obj.success,
    ];

    const lexographicalString = payload
      .map((value) => {
        if (value === undefined || value === null) {
          return "";
        }

        return String(value);
      })
      .join("");

    console.log("lexographicalString:", lexographicalString);

    const calculatedHmac = crypto
      .createHmac("sha512", this.hmacSecret)
      .update(lexographicalString)
      .digest("hex");

    console.log("generated:", calculatedHmac);
    console.log("received :", hmac);

    return calculatedHmac === hmac;
  }
}

module.exports = new PaymobService();
