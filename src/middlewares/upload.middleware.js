const multer = require("multer");
const AppError = require("../utils/apiError");
const HttpStatus = require("../enums/httpStatus.enum");
const FileFields = require("../enums/fileFields.enum");

// Use memory storage to hold file data in a Buffer
const storage = multer.memoryStorage();

// Filter for accepting only image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(
      new AppError("Only image files are allowed", HttpStatus.BadRequest),
      false,
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Reusable middlewares
exports.uploadSingleImage = (fieldName = FileFields.IMAGE) =>
  upload.single(fieldName);
exports.uploadMultipleImages = (fieldName = FileFields.IMAGE, maxCount = 5) =>
  upload.array(fieldName, maxCount);
