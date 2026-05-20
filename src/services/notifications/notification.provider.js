const firebaseProvider = require("./firebase.provider");

class NotificationProvider {
  async sendPushNotification(tokens, payload) {
    return await firebaseProvider.sendPushNotification(tokens, payload);
  }
}

module.exports = new NotificationProvider();
