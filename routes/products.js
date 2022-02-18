const express = require("express");
const router = express.Router();
const { uploadOptions } = require("../controllers/imageCon");
const { createProduct, updateProduct, deleteProduct, getProduct, getProducts } = require("../controllers/productCon");
const { protect, restrictTo } = require("../controllers/authCon");
const { createProductValidator } = require("../validation/validator");

router.get("/", getProducts);
router.get("/:id", getProduct);
router.post(
  "/",
  protect,
  restrictTo("admin"),
  uploadOptions.single("product_image"),
  createProductValidator,
  createProduct
);
router.put(
  "/:id",
  protect,
  restrictTo("admin", "manager"),
  uploadOptions.single("product_image"),
  createProductValidator,
  updateProduct
);
router.delete("/:id", protect, restrictTo("admin", "manager"), deleteProduct);

module.exports = router;
