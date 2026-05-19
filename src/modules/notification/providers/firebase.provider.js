const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

class FirebaseProvider {
  constructor() {
    this.messaging = null;
    this.initialize();
  }

  initialize() {
    if (admin.apps.length > 0) {
      this.messaging = admin.messaging();
      return;
    }

    try {
      let credential;
      
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        credential = admin.credential.cert(serviceAccount);
      } else {
        const serviceAccountPath = path.resolve(process.cwd(), "firebase-service-account.json");
        if (fs.existsSync(serviceAccountPath)) {
          credential = admin.credential.cert(require(serviceAccountPath));
        } else {
          console.warn("Firebase service account credentials not found. Push notifications will fail.");
        }
      }

      if (credential) {
        admin.initializeApp({
          credential,
        });
        this.messaging = admin.messaging();
        console.log("Firebase initialized successfully");
      }
    } catch (error) {
      console.error("Failed to initialize Firebase:", error.message);
    }
  }

  async sendPushNotification(tokens, notification, data = {}) {
    if (!this.messaging) {
      throw new Error("Firebase messaging not initialized");
    }

    if (!tokens || tokens.length === 0) {
      return null;
    }

    const message = {
      notification,
      data: this._stringifyData(data),
      tokens,
    };

    return await this.messaging.sendEachForMulticast(message);
  }

  // FCM data payload strictly requires string values
  _stringifyData(data) {
    const stringified = {};
    for (const key in data) {
      stringified[key] = String(data[key]);
    }
    return stringified;
  }
}

module.exports = new FirebaseProvider();
