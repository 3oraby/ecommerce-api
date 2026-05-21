const storageProvider = require("./storage.provider");

exports.uploadImage = async (file, folder = "uploads") => {
  return await storageProvider.uploadFile(file, folder);
};

exports.uploadMultipleImages = async (files, folder = "uploads") => {
  return await storageProvider.uploadFiles(files, folder);
};
