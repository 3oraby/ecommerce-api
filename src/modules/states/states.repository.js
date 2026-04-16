const State = require("./states.model");

exports.createState = async (data) => {
  return await State.create(data);
};

exports.getStateById = async (id) => {
  return await State.findByPk(id);
};

exports.findStateByCountryAndName = async (country_id, name) => {
  return await State.findOne({ where: { country_id, name } });
};

exports.getStates = async () => {
  return await State.findAll();
};

exports.getStatesByCountry = async (country_id) => {
  return await State.findAll({ where: { country_id } });
};

exports.updateState = async (id, data) => {
  const state = await State.findByPk(id);
  if (!state) return null;
  return await state.update(data);
};

exports.deleteState = async (id) => {
  const state = await State.findByPk(id);
  if (!state) return null;
  await state.destroy();
  return true;
};
