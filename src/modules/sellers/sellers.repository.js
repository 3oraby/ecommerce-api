const SellerProfile = require("./sellers.model");

exports.findAll = async () => {
  return await SellerProfile.findAll();
};

exports.findByPk = async (id) => {
  return await SellerProfile.findByPk(id);
};

exports.findByUserId = async (user_id) => {
  return await SellerProfile.findOne({ where: { user_id } });
};

exports.create = async (data) => {
  return await SellerProfile.create(data);
};

exports.update = async (user_id, data) => {
  const profile = await SellerProfile.findOne({ where: { user_id } });
  if (!profile) return null;
  return await profile.update(data);
};

exports.destroy = async (user_id) => {
  const profile = await SellerProfile.findOne({ where: { user_id } });
  if (!profile) return null;
  await profile.destroy();
  return true;
};
