const sendResponse = ({
  res,
  statusCode = 200,
  status = "success",
  message = null,
  data = null,
  results = null,
}) => {
  const response = {
    status,
  };

  if (message) response.message = message;
  if (results !== null) response.results = results;
  if (data !== null) response.data = data;

  res.status(statusCode).json(response);
};

module.exports = sendResponse;