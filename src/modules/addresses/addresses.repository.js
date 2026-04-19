const Address = require("./addresses.model");
const sequelize = require("../../config/sequelize");

exports.createAddress = async (data, resetOthers = false) => {
  if (resetOthers && data.user_id) {
    return await sequelize.transaction(async (t) => {
      await Address.update({ is_default: false }, { where: { user_id: data.user_id }, transaction: t });
      return await Address.create(data, { transaction: t });
    });
  }
  return await Address.create(data);
};

exports.getAddressById = async (id) => {
  return await Address.findByPk(id);
};

exports.getUserAddresses = async (user_id) => {
  return await Address.findAll({
    where: { user_id },
    order: [
      ["is_default", "DESC"],
      ["created_at", "ASC"],
    ],
  });
};

exports.findExactAddress = async (user_id, data) => {
  return await Address.findOne({
    where: {
      user_id,
      address_line1: data.address_line1,
      country_id: data.country_id,
      state_id: data.state_id,
      city_id: data.city_id,
    },
  });
};

exports.updateAddress = async (id, data, user_id = null) => {
  if (data.is_default && user_id) {
    return await sequelize.transaction(async (t) => {
      await Address.update({ is_default: false }, { where: { user_id }, transaction: t });
      const address = await Address.findByPk(id, { transaction: t });
      if (!address) return null;
      return await address.update(data, { transaction: t });
    });
  }
  const address = await Address.findByPk(id);
  if (!address) return null;
  return await address.update(data);
};

exports.deleteAddress = async (id, nextDefaultId = null) => {
  if (nextDefaultId) {
    return await sequelize.transaction(async (t) => {
      const nextAddress = await Address.findByPk(nextDefaultId, { transaction: t });
      if (nextAddress) await nextAddress.update({ is_default: true }, { transaction: t });
      
      const address = await Address.findByPk(id, { transaction: t });
      if (address) await address.destroy({ transaction: t });
      return true;
    });
  }
  const address = await Address.findByPk(id);
  if (!address) return null;
  await address.destroy();
  return true;
};

exports.resetDefaultAddresses = async (user_id) => {
  return await Address.update({ is_default: false }, { where: { user_id } });
};

exports.setDefaultAddress = async (id, user_id) => {
  return await sequelize.transaction(async (t) => {
    await Address.update({ is_default: false }, { where: { user_id }, transaction: t });
    const address = await Address.findByPk(id, { transaction: t });
    if (!address) return null;
    return await address.update({ is_default: true }, { transaction: t });
  });
};

exports.countUserAddresses = async (user_id) => {
  return await Address.count({ where: { user_id } });
};
