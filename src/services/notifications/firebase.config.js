const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

class FirebaseConfig {
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
        const serviceAccountPath = path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "src/config/firebase-service-account.json");
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

  getMessaging() {
    return this.messaging;
  }
}

module.exports = new FirebaseConfig();
