const catchAsync = require("../helpers/catchAsync");
const AppError = require("../helpers/appError");
const { ObjectId } = require("mongodb");
const ValidationError = require("../validation/ValidationsError");
const Order = "orders";
const Product = "products";

exports.createOrder = catchAsync(async (req, res, next) => {
   const { order_items, address, note } = req.body;

   const resolvedOrderItems = await Promise.all(
      order_items.map(async order_item => {
         const data = await req.db
            .db(process.env.databasename)
            .collection(Product)
            .findOne({ _id: ObjectId(order_item.product_id) });
         if (!data) {
            throw new ValidationError("Inalid product id " + order_item.product_id, [
               "Inalid product id " + order_item.product_id,
            ]);
         }
         const sum = Number(order_item.quantity) * data.price;

         return {
            product_id: data._id,
            quantity: order_item.quantity,
            product_name: data.product_name,
            price: data.price,
            category_id: data.category_id,
            prepare_time: data.prepare_time,
            sum: sum,
         };
      })
   );

   // total price = el.quantity * product based on id . price
   let total_price = 0;
   let total_prepare_time = 0;
   resolvedOrderItems.forEach(el => {
      total_price = total_price + Number(el.sum);
      total_prepare_time = total_prepare_time + Number(el.prepare_time);
   });

   const newOrder = {
      order_items: resolvedOrderItems,
      total_prepare_time,
      total_price,
      status: "pending",
      user_id: req.user._id,
      address: address,
      insert_date: new Date(),
      note: note,
   };

   await req.db
      .db(process.env.databasename)
      .collection(Order)
      .insertOne(newOrder, { writeConcerm: { w: 1, j: true } });

   res.json({
      status: "success",
      order: newOrder,
   });
});

exports.getOrders = catchAsync(async (req, res, next) => {
   let { limit, page, mode } = req.query;
   limit = limit * 1 || 20;
   const skip = (page * limit - limit) * 1 || 0;

   const filters = JSON.parse(req.headers.filters);
   let matchObject = { $match: { $or: [] } };
   for (const f in filters) {
      if (filters[f]) {
         matchObject = {
            ...matchObject,
            $match: { $or: [...matchObject.$match.$or, { status: f }] },
         };
      }
   }

   let pipeline = [
      { $sort: { insert_date: -1 } },
      { $skip: skip },
      { $limit: limit },
      { $project: { order_items: 0, address: 0 } },
      {
         $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user",
         },
      },
      { $unwind: "$user" },
      { $project: { "user.addresses": 0, "user.bookmarks": 0 } },
   ];
   let countQuery = {};
   if (matchObject.$match.$or.length) {
      pipeline = [matchObject, ...pipeline];
      countQuery = { ...matchObject.$match };
   }

   const ordersCount = await req.db
      .db(process.env.databasename)
      .collection(Order)
      .count(countQuery);

   const orders = await req.db
      .db(process.env.databasename)
      .collection(Order)
      .aggregate(pipeline)
      .toArray();

   res.status(200).json({
      status: "success",
      results: ordersCount,
      orders: orders,
   });
});

exports.getOrder = catchAsync(async (req, res, next) => {
   const mode = req.query;

   if (mode == "mobileasuser") {
      //we will inculde icons
   }
   const pipeline = [
      {
         $match: { _id: new ObjectId(req.params.id) },
      },
      {
         $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user",
         },
      },
      {
         $unwind: {
            path: "$order_items",
         },
      },
      {
         $lookup: {
            from: "products",
            let: {
               product_d: "$order_items.product_id",
            },
            as: "order_items.product",
            pipeline: [
               {
                  $match: {
                     $expr: {
                        $eq: ["$_id", "$$product_d"],
                     },
                  },
               },
            ],
         },
      },
      {
         $lookup: {
            from: "categories",
            let: {
               category_id: "$order_items.category_id",
            },
            as: "order_items.category",
            pipeline: [
               {
                  $match: {
                     $expr: {
                        $eq: ["$_id", "$$category_id"],
                     },
                  },
               },
            ],
         },
      },
      {
         $unwind: {
            path: "$order_items.category",
         },
      },
      {
         $project: {
            "order_items.product.product_image": 0,
            "order_items.product.ingredients": 0,
            "order_items.product.user_id": 0,
            "order_items.product.insert_date": 0,
            "order_items.product.description": 0,
            "order_items.product.category_id": 0,
            "user.addresses": 0,
            "user.password": 0,
            "user.email": 0,
            "user.bookmarks": 0,
            "user.address": 0,
            "user.role": 0,
            "user.is_active": 0,
            "user.insert_date": 0,
            "order_items.category._id": 0,
         },
      },
      {
         $unwind: {
            path: "$user",
         },
      },
      {
         $group: {
            _id: "$_id",
            user: { $first: "$user" },
            status: { $first: "$status" },
            total_prepare_time: { $first: "$total_prepare_time" },
            total_price: { $first: "$total_price" },
            address: { $first: "$address" },
            note: { $first: "$note" },
            insert_date: { $first: "$insert_date" },
            order_items: { $push: "$order_items" },
         },
      },
   ];
   const [order] = await req.db
      .db(process.env.databasename)
      .collection(Order)
      .aggregate(pipeline)
      .toArray();

   // if (!order) {
   //    return next(new AppError("No order with that id", 404));
   // }
   console.log(order.order_items[0].product);
   res.json({
      status: "success",
      order: order,
   });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
   const updatedOrder = await db
      .db(process.env.databasename)
      .collection(Order)
      .updateOne(
         { _id: new ObjectId(req.params.id) },
         {
            $set: { status: req.body.status },
         },
         { writeConcerm: { w: 1, j: true } }
      );
   if (!updatedOrder.modifiedCount || !updatedOrder.matchedCount) {
      return next(new AppError("No order with that Id", 404));
   }

   res.json({
      status: "success",
      order: updatedOrder,
   });
});

exports.deleteOrder = catchAsync(async (req, res, next) => {
   Order.findByIdAndRemove(req.params.id)
      .then(async order => {
         if (order) {
            await order.orderItems.map(async orderitem => {
               await OrderItem.findByIdAndRemove(orderitem);
            });
            return res.json({
               status: true,
               message: "order deleted successfully",
            });
         } else {
            return res.json({
               status: false,
               message: "order not found",
            });
         }
      })
      .catch(err => {
         res.json({
            status: false,
            error: err,
         });
      });
});

exports.getTotalSales = catchAsync(async (req, res, next) => {
   const totalSales = await req.db
      .db(process.env.databasename)
      .collection(Order)
      .aggregate([{ $group: { _id: "total sales", total_sales: { $sum: "$total_price" } } }])
      .toArray();

   if (!totalSales || totalSales.length == 0) {
      return res.json({
         message: "something went wrong",
      });
   }

   res.json({ status: "success", total_sales: totalSales });
});

exports.updateMyOrder = catchAsync(async (req, res, next) => {
   if (!ObjectId.isValid(req.params.id)) {
      console.log("1");
   }
   const order = await req.db
      .db(process.env.databasename)
      .collection(Order)
      .findOne({ _id: ObjectId(req.params.id) });
   if (!order) {
      console.log("2");
   }

   if (String(order.user_id) !== String(req.user._id)) {
      console.log("3");
   }
   const time = new Date().getTime() - new Date(order.insert_date).getTime();
   if (time > 600000) {
      return next(new AppError("لا يمكن تعديل الطلبية بعد أكثر من خمس دقائق من ارسالها.", 403));
   }
   const { order_items, address, phone } = req.body;

   const total_prices = await Promise.all(
      order_items.map(async order_item => {
         const data = await req.db
            .db(process.env.databasename)
            .collection(Product)
            .findOne({ _id: ObjectId(order_item.product_id) });
         if (!data) {
            throw new ValidationError("Inalid product id " + order_item.product_id, [
               "Inalid product id " + order_item.product_id,
            ]);
         }
         const price = Number(order_item.quantity) * data.price;
         return price;
      })
   );

   // total price = el.quantity * product based on id . price
   const total_price = total_prices.reduce((a, b) => a + b, 0);

   const updatedOrder = await req.db
      .db(process.env.databasename)
      .collection(Order)
      .updateOne({ _id: ObjectId(req.params.id) }, { order_items: order_items, total_price });
   res.json({
      status: "success",
      order: updatedOrder,
   });
});

exports.getMyOrders = catchAsync(async (req, res, next) => {
   const id = req.user._id;

   const orders = await req.db
      .db(process.env.databasename)
      .collection(Order)
      .find({ user_id: id })
      .toArray();
   return res.status(200).json({
      status: "success",
      orders,
   });
});
