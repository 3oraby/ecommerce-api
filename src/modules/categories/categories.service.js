const categoriesRepository = require("./categories.repository");
const ApiError = require("../../utils/apiError");
const HttpStatus = require("../../enums/httpStatus.enum");
const {
  invalidateCategoriesCache,
} = require("../../services/cache/cacheInvalidation.helper");
const { cacheOrFetch } = require("../../services/cache/cache.helper");
const cacheKeysUtil = require("../../services/cache/cacheKeys.util");

const normalizeName = (name) => {
  if (!name) return name;
  return name
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

exports.createCategory = async (data) => {
  const normalizedName = normalizeName(data.name);

  const existingCategory =
    await categoriesRepository.findByName(normalizedName);
  if (existingCategory) {
    throw new ApiError("Category name already exists", HttpStatus.BadRequest);
  }

  const category = await categoriesRepository.create({
    ...data,
    name: normalizedName,
  });

  invalidateCategoriesCache();
  return category;
};

exports.getAllCategories = async () => {
  const cacheKey = cacheKeysUtil.categories();

  const cachedCategories = await cacheOrFetch(
    cacheKey,
    async () => {
      return await categoriesRepository.findAll();
    },
    "1w"
  );

  return cachedCategories;
};

exports.getCategoryById = async (id) => {
  const cacheKey = cacheKeysUtil.category(id);

  const cachedCategory = await cacheOrFetch(
    cacheKey,
    async () => {
      return await categoriesRepository.findByPk(id);
    },
    "1w",
  );

  if (!cachedCategory) {
    throw new ApiError("Category not found", HttpStatus.NotFound);
  }

  return cachedCategory;
};

exports.updateCategory = async (id, data) => {
  const category = await categoriesRepository.findByPk(id);
  if (!category) {
    throw new ApiError("Category not found", HttpStatus.NotFound);
  }

  const updateData = { ...data };

  if (data.name) {
    const normalizedName = normalizeName(data.name);
    const existingCategory = await categoriesRepository.findByNameExceptId(
      normalizedName,
      id,
    );
    if (existingCategory) {
      throw new ApiError("Category name already exists", HttpStatus.BadRequest);
    }
    updateData.name = normalizedName;
  }

  const updatedCategory = await categoriesRepository.update(id, updateData);

  invalidateCategoriesCache({categoryId: id});
  return updatedCategory;
};

exports.deleteCategory = async (id) => {
  const category = await categoriesRepository.findByPk(id);
  if (!category) {
    throw new ApiError("Category not found", HttpStatus.NotFound);
  }

  await categoriesRepository.destroy(id);

  invalidateCategoriesCache({categoryId: id});
  return category;
};
