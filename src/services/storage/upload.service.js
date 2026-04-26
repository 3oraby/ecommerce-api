const supabase = require("../../config/supabase");
const crypto = require("crypto");

exports.uploadImage = async (file, folder = "uploads") => {
  if (!file || !file.buffer) {
    throw new Error("Invalid file object provided for upload.");
  }

  // Generate unique file name
  const uniqueName = `${Date.now()}-${crypto.randomUUID()}-${file.originalname.replace(/\s+/g, "_")}`;

  // Upload file buffer to Supabase
  const { data, error } = await supabase.storage
    .from(process.env.SUPABASE_BUCKET_NAME)
    .upload(`${folder}/${uniqueName}`, file.buffer, {
      contentType: file.mimetype,
      // upsert: false,
    });

  if (error) {
    console.error("Supabase upload error:", error);
    throw new Error("Failed to upload image to storage");
  }

  const { data: publicUrlData } = supabase.storage
    .from(process.env.SUPABASE_BUCKET_NAME)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
};
