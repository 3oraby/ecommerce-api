const categoriesRepository = require("./categories.repository");
const ApiError = require("../../utils/apiError");
const HttpStatus = require("../../enums/httpStatus.enum");

const normalizeName = (name) => {
  if (!name) return name;
  return name.trim().toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

exports.createCategory = async (data) => {
  const normalizedName = normalizeName(data.name);

  const existingCategory = await categoriesRepository.findByName(normalizedName);
  if (existingCategory) {
    throw new ApiError("Category name already exists", HttpStatus.BadRequest);
  }

  return await categoriesRepository.create({
    ...data,
    name: normalizedName,
  });
};

exports.getAllCategories = async () => {
  return await categoriesRepository.findAll();
};

exports.getCategoryById = async (id) => {
  const category = await categoriesRepository.findByPk(id);
  if (!category) {
    throw new ApiError("Category not found", HttpStatus.NotFound);
  }
  return category;
};

exports.updateCategory = async (id, data) => {
  const category = await categoriesRepository.findByPk(id);
  if (!category) {
    throw new ApiError("Category not found", HttpStatus.NotFound);
  }

  const updateData = { ...data };

  if (data.name) {
    const normalizedName = normalizeName(data.name);
    const existingCategory = await categoriesRepository.findByNameExceptId(normalizedName, id);
    if (existingCategory) {
      throw new ApiError("Category name already exists", HttpStatus.BadRequest);
    }
    updateData.name = normalizedName;
  }

  return await categoriesRepository.update(id, updateData);
};

exports.deleteCategory = async (id) => {
  const result = await categoriesRepository.destroy(id);
  if (!result) {
    throw new ApiError("Category not found", HttpStatus.NotFound);
  }
  return result;
};
