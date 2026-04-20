const { Op } = require("sequelize");
const Category = require("./categories.model");

exports.findAll = async () => {
  return await Category.findAll();
};

exports.findByPk = async (id) => {
  return await Category.findByPk(id);
};

exports.findByName = async (name) => {
  return await Category.findOne({ where: { name } });
};

exports.findByNameExceptId = async (name, excludeId) => {
  return await Category.findOne({
    where: {
      name,
      id: { [Op.ne]: excludeId },
    },
  });
};

exports.create = async (data) => {
  return await Category.create(data);
};

exports.update = async (id, data) => {
  const category = await Category.findByPk(id);
  if (!category) return null;
  return await category.update(data);
};

exports.destroy = async (id) => {
  const category = await Category.findByPk(id);
  if (!category) return null;
  await category.destroy();
  return true;
};
