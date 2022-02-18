const { ObjectId } = require("mongodb");
const catchAsync = require("../helpers/catchAsync");
const ValidationError = require("../validation/ValidationsError");
const Product = "products";
const User = "users";

exports.addBookmark = catchAsync(async (req, res, next) => {
   const product_id = req.body.product_id;

   if (!ObjectId.isValid(product_id)) {
      return new ValidationError("Invalid product id", ["Invalid product id"]);
   }

   const product = await req.db
      .db(process.env.databasename)
      .collection(Product)
      .findOne({ _id: new ObjectId(product_id) });

   if (!product) {
      return new ValidationError("Invalid product id", ["Invalid product id"]);
   }

   const newBookmark = await req.db
      .db(process.env.databasename)
      .collection(User)
      .updateOne(
         { _id: req.user._id },
         { $addToSet: { bookmarks: ObjectId(product_id) } },
         { writeConcerm: { w: 1, j: true } }
      );

   // product.product_image = undefined;

   //TODO
   product.icon = product.product_image;
   res.status(201).json({
      status: "success",
      product,
   });
});

exports.deleteBookmark = catchAsync(async (req, res, next) => {
   const product_id = req.params.id;
   if (!ObjectId.isValid(product_id)) {
      return new ValidationError("Invalid product id", ["Invalid product id"]);
   }
   const { matchedCount, modifiedCount } = await req.db
      .db(process.env.databasename)
      .collection(User)
      .updateOne(
         { _id: req.user._id },
         { $pull: { bookmarks: ObjectId(product_id) } },
         { writeConcerm: { w: 1, j: true } }
      );
   if (!matchedCount || !modifiedCount) {
      return new ValidationError("invalid id or some thing else ", ["لم يتم الحذف بنجاح"]);
   }
   res.status(201).json({
      status: "success",
      bookmark: product_id,
   });
});

exports.fetchBookmarks = catchAsync(async (req, res, next) => {
   const bookmarks = await req.db
      .db(process.env.databasename)
      .collection(User)
      .aggregate([
         { $match: { _id: req.user._id } },
         {
            $lookup: {
               from: "products",
               localField: "bookmarks",
               foreignField: "_id",
               as: "bookmark_items",
            },
         },
         {
            $project: { _id: 0, bookmark_items: 1, bookmarks: 1 },
         },
      ])
      .toArray();

   return res.status(200).json({
      status: "success",
      bookmarkIds: bookmarks.bookmarks,
      bookmarks: bookmarks[0].bookmark_items,
   });
});
