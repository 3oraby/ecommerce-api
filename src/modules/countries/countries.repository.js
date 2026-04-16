const Country = require("./countries.model");

exports.createCountry = async (data) => {
  return await Country.create(data);
};

exports.findCountryById = async (id) => {
  return await Country.findByPk(id);
};

exports.findCountryByName = async (name) => {
  return await Country.findOne({ where: { name } });
};

exports.findCountryByCode = async (code) => {
  return await Country.findOne({ where: { code } });
};

exports.getAllCountries = async () => {
  return await Country.findAll();
};

exports.updateCountry = async (id, data) => {
  const country = await Country.findByPk(id);
  if (!country) return null;
  return await country.update(data);
};

exports.deleteCountry = async (id) => {
  const country = await Country.findByPk(id);
  if (!country) return null;
  await country.destroy();
  return true;
};
