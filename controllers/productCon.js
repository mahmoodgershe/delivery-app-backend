const sharp = require("sharp");
const catchAsync = require("../helpers/catchAsync");
const ValidationError = require("../validation/ValidationsError");
const { ObjectId } = require("mongodb");

const Product = "products";
exports.createProduct = catchAsync(async (req, res, next) => {
   const file = req.file;
   const buffer = file?.buffer;

   const regularImage = await sharp(buffer).resize(400, 400).png({ quality: 70 }).toBuffer();
   const smallImage = await sharp(buffer).resize(150, 150).png({ quality: 90 }).toBuffer();
   const icon = await sharp(buffer).resize(50, 50).png().toBuffer();
   const newProduct = {
      product_name: req.body.product_name,
      description: req.body.description,
      price: req.body.price * 1,
      category_id: ObjectId(req.body.category_id),
      ingredients: JSON.parse(req.body.ingredients),
      user_id: ObjectId(req.user._id),
      insert_date: new Date(),
      prepare_time: req.body.prepare_time * 1,
      available: true,
      priority: 1,
      regular_image: {
         data: Buffer(regularImage),
         type: file.mimetype,
      },
      small_image: {
         data: Buffer(smallImage),
         type: file.mimetype,
      },
      icon: {
         data: Buffer(icon),
         type: file.mimetype,
      },
   };
   await req.db
      .db(process.env.databasename)
      .collection(Product)
      .insertOne(newProduct, { writeConcerm: { w: 1, j: true } });

   newProduct.regular_image = undefined;
   newProduct.small_image = undefined;

   res.status(201).json({
      status: "success",
      product: newProduct,
   });
});

exports.getProduct = catchAsync(async (req, res, next) => {
   if (!ObjectId.isValid(req.params.id)) {
      return next(new ValidationError("Invalid product ID.", ["Invalid product id"]));
   }
   const product = await req.db
      .db(process.env.databasename)
      .collection(Product)
      .findOne({ _id: ObjectId(req.params.id) });
   if (!product) {
      return next(new ValidationError("Invalid product ID.", ["Invalid product id"]));
   }
   product.small_image = undefined;
   product.icon = undefined;
   res.json({
      status: "success",
      product,
   });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
   if (!ObjectId.isValid(req.params.id)) {
      return next(
         new ValidationError("Invalid product id", ["المنتج غير موجود ربما تم حذفه مؤخراً"])
      );
   }

   const deletedProduct = await req.db
      .db(process.env.databasename)
      .collection(Product)
      .deleteOne({ _id: ObjectId(req.params.id) }, { writeConcerm: { w: 1, j: true } });

   res.status(200).json({
      status: "success",
      deletedProduct: "product deleted succesfully",
   });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
   if (!ObjectId.isValid(req.params.id)) {
      return next(
         new ValidationError("Invalid product id", ["المنتج غير موجود ربما تم حذفه مؤخراً"])
      );
   }
   const file = req.file;
   const buffer = file?.buffer;

   const regularImage = await sharp(buffer).resize(400, 400).png({ quality: 70 }).toBuffer();
   const smallImage = await sharp(buffer).resize(150, 150).png({ quality: 90 }).toBuffer();
   const icon = await sharp(buffer).resize(50, 50).png().toBuffer();
   const updatedProduct = await req.db
      .db(process.env.databasename)
      .collection(Product)
      .updateOne(
         { _id: ObjectId(req.params.id) },
         {
            $set: {
               ...req.body,
               ingredients: JSON.parse(req.body.ingredients),
               category_id: ObjectId(req.body.category_id),
               regular_image: {
                  data: Buffer(regularImage),
                  type: file.mimetype,
               },
               small_image: {
                  data: Buffer(smallImage),
                  type: file.mimetype,
               },
               icon: {
                  data: Buffer(icon),
                  type: file.mimetype,
               },
            },
         },
         { writeConcerm: { w: 1, j: true } }
      );

   res.status(200).json({
      status: "success",
      updatedProduct: "product updated succesfully",
   });
});

exports.getProducts = catchAsync(async (req, res, next) => {
   let { limit, page, sort, mode } = req.query;

   let queryObj = { ...req.query };
   ["page", "sort", "fields", "limit", "mode"].forEach(el => delete queryObj[el]);
   sort = sort || "insert_date";
   page = page * 1 || 1;
   limit = limit * 1 || 10;
   const skip = (page * 1 - 1) * limit;
   let projectObject = {
      _id: 1,
      category_id: 1,
      product_name: 1,
      price: 1,
      prepare_time: 1,
      insert_date: 1,
      product_image: 1,
   };

   if (mode == "noimages") {
      delete projectObject["product_image"];
   }
   if (mode == "mobile") {
      projectObject = { ...projectObject, small_image: 1 };
   }
   if (mode == "search") {
      projectObject = { ...projectObject, icon: 1 };
   }

   const recordsCount = await req.db.db(process.env.databasename).collection(Product).count();
   const pageCount = Math.ceil(recordsCount / limit);

   let aggregateArray = [
      { $project: { ...projectObject } },
      {
         $lookup: {
            from: "categories",
            localField: "category_id",
            foreignField: "_id",
            as: "category",
         },
      },
   ];

   if (mode == "mobile") {
      aggregateArray = [...aggregateArray, { $skip: skip }, { $limit: limit }];
   }

   if (mode == "search") {
      aggregateArray = [
         { $match: { product_name: new RegExp(req.query.term) } },
         ...aggregateArray,
      ];
   }

   const products = await req.db
      .db(process.env.databasename)
      .collection(Product)
      .aggregate(aggregateArray)
      .toArray();

   res.status(200).json({
      status: "success",
      results: products.length,
      pageCount,
      products,
   });
});
