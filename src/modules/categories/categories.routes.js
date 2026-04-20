const express = require("express");
const categoriesController = require("./categories.controller");
const validate = require("../../middlewares/validate.middleware");
const { authenticate } = require("../../middlewares/authenticate.middleware");
const { restrictTo } = require("../../middlewares/restrictTo.middleware");
const Roles = require("../../enums/roles.enum");
const {
  createCategorySchema,
  updateCategorySchema,
  paramsSchema,
} = require("./categories.validation");

const router = express.Router();

// --- PUBLIC ---
router.get("/", categoriesController.getAllCategories);
router.get("/:id", validate(paramsSchema), categoriesController.getCategoryById);

// --- ADMIN ONLY ---
router.use(authenticate);
router.use(restrictTo(Roles.ADMIN));

router.post("/", validate(createCategorySchema), categoriesController.createCategory);
router.patch("/:id", validate(updateCategorySchema), categoriesController.updateCategory);
router.delete("/:id", validate(paramsSchema), categoriesController.deleteCategory);

module.exports = router;
