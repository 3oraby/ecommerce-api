const ApiError = require("../utils/apiError");
const HttpStatus = require("../enums/httpStatus.enum");

exports.sanitizeAndValidateIds = async ({
  ids,
  findByIds,
  errorMessage = "Invalid IDs",
}) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new ApiError("IDs must be a non-empty array", HttpStatus.BAD_REQUEST);
  }

  const uniqueIds = [...new Set(ids.map((id) => Number(id)))].filter(
    (id) => !isNaN(id),
  );

  const records = await findByIds(uniqueIds);

  if (records.length !== uniqueIds.length) {
    throw new ApiError(errorMessage, HttpStatus.BAD_REQUEST);
  }

  return uniqueIds;
};
