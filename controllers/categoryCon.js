const catchAsync = require("../helpers/catchAsync");
const AppError = require("../helpers/appError");
const { ObjectId } = require("mongodb");
const ValidationError = require("../validation/ValidationsError");
const Category = "categories";

exports.createCategory = catchAsync(async (req, res, next) => {
   const newCategory = {
      category_name: req.body.category_name,
      color: req.body.color,
   };
   await req.db
      .db(process.env.databasename)
      .collection(Category)
      .insertOne(newCategory, { writeConcerm: { w: 1, j: true } });
   res.status(201).json({
      status: "success",
      category: newCategory,
   });
});

exports.getCategory = catchAsync(async (req, res, next) => {
   //validate
   if (!ObjectId.isValid(req.params.id)) {
      return next(new ValidationError("Invalid category ID.", ["Invalid category id"]));
   }
   const category = await req.db
      .db(process.env.databasename)
      .collection(Category)
      .findOne({ _id: ObjectId(req.params.id) });
   if (!category) {
      return next(new ValidationError("Invalid category ID.", ["Invalid category id"]));
   }
   res.json({
      status: "success",
      category: category,
   });
});

exports.getCategories = catchAsync(async (req, res, next) => {
   const categories = await req.db
      .db(process.env.databasename)
      .collection(Category)
      .find()
      .toArray();
   res.json({
      status: "success",
      results: categories.length,
      categories: categories,
   });
});

//set
exports.updateCategory = catchAsync(async (req, res, next) => {
   //run validation in validator
   const { category_name, color } = req.body;

   await req.db
      .db(process.env.databasename)
      .collection(Category)
      .updateOne(
         { _id: ObjectId(req.params.id) },
         { $set: { category_name, color } },
         { writeConcerm: { w: 1, j: 1 } }
      );
   res.json({
      status: "success",
      message: "updated succefully",
   });
});

//ok
exports.deleteCategory = catchAsync(async (req, res, next) => {
   if (!ObjectId.isValid(req.params.id)) {
      return next(new ValidationError("Invalid category ID.", ["Invalid category id"]));
   }
   const category = await req.db
      .db(process.env.databasename)
      .collection(Category)
      .deleteOne({ _id: ObjectId(req.params.id) }, { writeConcerm: { w: 1, j: 1 } });

   if (!category.deletedCount) {
      return next(new ValidationError("Invalid category ID.", ["Invalid category id"]));
   }

   res.json({
      status: "success",
      message: "Category deleted successfully",
   });
});
