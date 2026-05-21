const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

class SupabaseStorageProvider {
  init() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase env vars");
    }

    this.bucketName = process.env.SUPABASE_BUCKET_NAME || "products";
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
    };
    return mimeTypes[ext] || "application/octet-stream";
  }

  _checkClient() {
    if (!this.supabase) {
      this.init();
      if (!this.supabase) {
        throw new Error(
          "Storage provider not initialized. Check configuration.",
        );
      }
    }
  }

  async uploadBuffer(buffer, destinationPath, mimeType) {
    this._checkClient();

    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(destinationPath, buffer, {
        contentType: mimeType || "application/octet-stream",
        upsert: true,
      });

    if (error) {
      throw new Error(error.message); // Will be caught by generic provider
    }

    return this.getPublicUrl(destinationPath);
  }

  async uploadFile(localFilePath, destinationPath) {
    const fileBuffer = fs.readFileSync(localFilePath);
    const mimeType = this.getMimeType(localFilePath);
    return this.uploadBuffer(fileBuffer, destinationPath, mimeType);
  }

  getPublicUrl(destinationPath) {
    this._checkClient();
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(destinationPath);
    return data.publicUrl;
  }
}

module.exports = new SupabaseStorageProvider();
