const catchAsync = require("../helpers/catchAsync");
//
const ValidationError = require("../validation/ValidationsError");
//
const User = "users";
//
const { ObjectId } = require("mongodb");
const writeResultHandler = require("../helpers/writeResultHandler");

exports.addAddress = catchAsync(async (req, res, next) => {
   const { longitude, latitude, address, note } = req.body;

   const newAddress = {
      _id: new ObjectId(),
      address,
      location: {
         type: "point",
         coordinates: [longitude * 1, latitude * 1],
      },
      note,
   };

   const { matchedCount, modifiedCount } = await req.db
      .db(process.env.databasename)
      .collection(User)
      .updateOne(
         { _id: req.user._id },
         { $addToSet: { addresses: newAddress } },
         { writeConcerm: { w: 1, j: true } }
      );
   const errorMessage = "لم تتم الاضافة بنجاح";
   if (!matchedCount || !modifiedCount) {
      return next(new ValidationError("error in add address", [errorMessage]));
   }

   res.status(201).json({
      status: "success",
      newAddress,
   });
});

exports.deleteAddress = catchAsync(async (req, res, next) => {
   const id = req.params.id;
   const deletedAddress = await req.db
      .db(process.env.databasename)
      .collection(User)
      .updateOne(
         { _id: req.user._id },
         { $pull: { addresses: { _id: ObjectId(id) } } },
         { writeConcerm: { w: 1, j: true } }
      );
   writeResultHandler(deletedAddress, "العنوان غير موجود", "لم يتم الحذف بنجاح");
   res.status(201).json({
      status: "success",
      deletedAddress,
   });
});

exports.getAddresses = catchAsync(async (req, res, next) => {
   const { addresses } = await req.db
      .db(process.env.databasename)
      .collection("users")
      .findOne({ _id: req.user._id });

   res.status(200).json({
      status: "success",
      addresses,
   });
});
