const User = require("./user.model");

exports.createUser = async (userData) => {
  return await User.create(userData);
};

exports.findByEmail = async (email) => {
  return await User.findOne({ where: { email } });
};

exports.findByEmailWithDeleted = async (email) => {
  return await User.findOne({
    where: { email },
    paranoid: false,
  });
};

exports.findById = async (id) => {
  return await User.findByPk(id);
};

exports.findAll = async () => {
  return await User.findAll({ attributes: { exclude: ["password"] } });
};

exports.updateUserById = async (id, updateData) => {
  const user = await User.findByPk(id);
  if (!user) return null;
  return await user.update(updateData);
};

exports.deleteUserById = async (id) => {
  const user = await User.findByPk(id);
  if (!user) return null;
  await user.destroy();
  return true;
};
