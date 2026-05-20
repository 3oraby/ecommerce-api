const firebaseConfig = require("./firebase.config");

class FirebaseProvider {
  async sendPushNotification(tokens, payload) {
    const messaging = firebaseConfig.getMessaging();
    
    if (!messaging) {
      throw new Error("Firebase messaging not initialized");
    }

    if (!tokens || tokens.length === 0) {
      return null;
    }

    const message = {
      notification: {
        title: payload.title || "title_test",
        body: payload.body || "body_test",
      },
      data: this._stringifyData(payload.data || {}),
      tokens,
    };

    const response = await messaging.sendEachForMulticast(message);
    
    const result = {
      success: true,
      failedTokens: [],
      originalResponse: response
    };

    if (response && response.responses) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const error = resp.error;
          if (
            error.code === 'messaging/invalid-registration-token' ||
            error.code === 'messaging/registration-token-not-registered'
          ) {
            result.failedTokens.push(tokens[idx]);
          }
        }
      });
    }

    return result;
  }

  _stringifyData(data) {
    const stringified = {};
    for (const key in data) {
      stringified[key] = String(data[key]);
    }
    return stringified;
  }
}

module.exports = new FirebaseProvider();
