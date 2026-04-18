const City = require("./cities.model");

exports.createCity = async (data) => {
  return await City.create(data);
};

exports.getCityById = async (id) => {
  return await City.findByPk(id);
};

exports.findCityByStateAndName = async (state_id, name) => {
  return await City.findOne({ where: { state_id, name } });
};

exports.getCities = async () => {
  return await City.findAll();
};

exports.getCitiesByState = async (state_id) => {
  return await City.findAll({ where: { state_id } });
};

exports.updateCity = async (id, data) => {
  const city = await City.findByPk(id);
  if (!city) return null;
  return await city.update(data);
};

exports.deleteCity = async (id) => {
  const city = await City.findByPk(id);
  if (!city) return null;
  await city.destroy();
  return true;
};
