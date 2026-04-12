const HttpStatus = require("../enums/httpStatus.enum");

const sendResponse = ({
  res,
  statusCode = HttpStatus.OK,
  status = "success",
  accessToken = null,
  message = null,
  data = null,
  results = null,
}) => {
  const response = {
    status,
  };

  if (message) response.message = message;
  if (results !== null) response.results = results;
  if (accessToken !== null) response.accessToken = accessToken;
  if (data !== null) response.data = data;

  res.status(statusCode).json(response);
};

module.exports = sendResponse;