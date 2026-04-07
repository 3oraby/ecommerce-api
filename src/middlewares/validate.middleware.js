const ApiError = require("../utils/apiError");
const { fromZodError } = require("zod-validation-error"); // for nicer messages

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    const error = fromZodError(err);
    return ApiError(error.message, HttpStatus.BadRequest);
  }
};

module.exports = validate;
