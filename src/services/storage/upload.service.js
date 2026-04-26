const supabase = require("../../config/supabase");
const crypto = require("crypto");

exports.uploadImage = async (file, folder = "uploads") => {
  if (!file || !file.buffer) {
    throw new Error("Invalid file object provided for upload.");
  }

  const uniqueName = `${Date.now()}-${crypto.randomUUID()}-${file.originalname.replace(/\s+/g, "_")}`;

  const { data, error } = await supabase.storage
    .from(process.env.SUPABASE_BUCKET_NAME)
    .upload(`${folder}/${uniqueName}`, file.buffer, {
      contentType: file.mimetype,
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

exports.uploadMultipleImages = async (files, folder = "uploads") => {
  if (!files || !Array.isArray(files) || files.length === 0) {
    throw new Error("Please provide at least one image to upload");
  }

  const uploadPromises = files.map(async (file, index) => {
    if (!file) {
      throw new Error(`Image at index ${index} is missing`);
    }

    if (!file.buffer) {
      throw new Error(
        `Invalid file format for image "${file.originalname || `index ${index}`}". Please upload a valid image file`,
      );
    }

    const uniqueName = `${Date.now()}-${crypto.randomUUID()}-${file.originalname.replace(/\s+/g, "_")}`;

    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME)
      .upload(`${folder}/${uniqueName}`, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      throw new Error(
        `Failed to upload image "${file.originalname}". Please try again`,
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  });

  return Promise.all(uploadPromises);
};
