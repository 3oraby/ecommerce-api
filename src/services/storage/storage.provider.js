const supabaseProvider = require("./providers/supabase.storage");
const crypto = require("crypto");

class StorageProvider {
  constructor(provider) {
    this.provider = provider;
    this.provider.init();
  }

  _generateUniqueName(originalname) {
    const safeName = originalname ? originalname.replace(/\s+/g, "_") : "file";
    return `${Date.now()}-${crypto.randomUUID()}-${safeName}`;
  }

  init() {
    supabaseProvider.init();
  }

  async uploadLocalFile(localFilePath, destinationPath) {
    try {
      return await this.provider.uploadFile(localFilePath, destinationPath);
    } catch (error) {
      console.error("Storage upload error:", error);
      throw new Error("Failed to upload local file to storage");
    }
  }

  async uploadFile(file, folder = "uploads") {
    if (!file || !file.buffer) {
      throw new Error("Invalid file object provided for upload.");
    }

    const uniqueName = this._generateUniqueName(file.originalname);
    const destinationPath = `${folder}/${uniqueName}`;

    try {
      return await this.provider.uploadBuffer(file.buffer, destinationPath, file.mimetype);
    } catch (error) {
      console.error("Storage upload error:", error);
      throw new Error(`Failed to upload image "${file.originalname || 'file'}". Please try again`);
    }
  }

  async uploadFiles(files, folder = "uploads") {
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new Error("Please provide at least one image to upload");
    }

    const uploadPromises = files.map((file, index) => {
      if (!file) throw new Error(`Image at index ${index} is missing`);
      return this.uploadFile(file, folder);
    });

    return Promise.all(uploadPromises);
  }
}

module.exports = new StorageProvider(supabaseProvider);
