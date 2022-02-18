const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const AppError = require("../helpers/appError");
const { ObjectId } = require("mongodb");
const catchAsync = require("./../helpers/catchAsync");

exports.protect = catchAsync(async (req, res, next) => {
   let token;
   if (req.headers && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
   }

   if (!token) {
      return res.status(401).json({
         status: "fail",
         message: "you are not logged in",
      });
   }
   const SECRET = process.env.SECRET;
   const decoded = await promisify(jwt.verify)(token, SECRET);
   const freshUser = await req.db
      .db(process.env.databasename)
      .collection("users")
      .findOne({ _id: ObjectId(decoded.userId) });
   // check for password update ?? later
   if (!freshUser || !freshUser.is_active) {
      return res.json({
         status: "fail",
         message: "User have been removed recently",
      });
   }
   req.user = freshUser;
   next();
});
exports.refresh = catchAsync(async (req, res, next) => {
   const token = jwt.sign({ userId: req.user._id, role: req.user.role }, process.env.SECRET, {
      expiresIn: "7d",
   });
   return res.status(200).json({
      status: "success",
      user: req.user,
      token,
   });
});
exports.restrictTo =
   (...rules) =>
   (req, res, next) => {
      if (!rules.includes(req.user.role)) {
         return next(new AppError("You do not have access to this resoure", 403));
      }
      next();
   };
