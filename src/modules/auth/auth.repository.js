const User = require("../user/user.model");

exports.getUserByEmail = async (email) => {
  return await User.findOne({ where: { email } });
};

exports.createUser = async (userData) => {
  return await User.create(userData);
};
