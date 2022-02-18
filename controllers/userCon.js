const jwt = require("jsonwebtoken");
const catchAsync = require("../helpers/catchAsync");
const ObjectId = require("mongodb").ObjectId;
const ValidationError = require("../validation/ValidationsError");
const User = "users";
exports.getUsers = catchAsync(async (req, res, next) => {
  const users = await req.db
    .db(process.env.databasename)
    .collection(User)
    .find()
    .toArray();
  res.status(200).json({
    status: "success",
    results: users.length,
    users: users,
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  if (!ObjectId.isValid(req.params.id)) {
    return next(
      new ValidationError("Validation Error in Get User", ["Invalid user ID"])
    );
  }
  const user = await req.db
    .db(process.env.databasename)
    .collection(User)
    .findOne({ _id: ObjectId(req.params.id) });
  if (!user) {
    return next(
      new ValidationError("Validation Error in Get User", ["Invalid user ID"])
    );
  }
  res.status(200).json({
    status: "success",
    user: user,
  });
});

exports.register = catchAsync(async (req, res, next) => {
  const { first_name, second_name, last_name, email, password, city, phone } =
    req.body;
  const newUser = {
    first_name,
    second_name,
    last_name,
    email,
    password,
    city,
    phone,
    insert_date: Date.now(),
    is_active: true,
    role: "user",
  };
  await req.db.db(process.env.databasename).collection(User).insertOne(newUser);

  newUser.password = undefined;
  res.json({
    status: "success",
    user: newUser,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  let user = await req.db
    .db(process.env.databasename)
    .collection(User)
    .findOne({ email });
  if (!user || password !== user.password) {
    return next(
      new ValidationError("Invalid username or password", [
        "Invalid username or password",
      ])
    );
  }
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.SECRET,
    {
      expiresIn: "7d",
    }
  );
  res.cookie("jwt", token);
  user.password = undefined;
  res.json({
    status: true,
    token: token,
    user: user,
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  if (!ObjectId.isValid(req.params.id)) {
    return next(
      new ValidationError("Validation Error in Delete User", [
        "Invalid user ID",
      ])
    );
  }
  const user = await req.db
    .db(process.env.databasename)
    .collection(User)
    .updateOne(
      { _id: ObjectId(req.params.id) },
      { $set: { is_active: false } },
      { writeConcerm: { w: 1, j: 1 } }
    );
  if (!user.matchedCount) {
    return next(
      new ValidationError("Validation Error in Delete User", [
        "Invalid user ID",
      ])
    );
  }
  res.status(200).json({
    status: "success",
    message: "user deleted successfully",
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const {
    first_name,
    last_name,
    second_name,
    email,
    phone,
    is_active,
    address,
    city,
    role,
    password,
  } = req.body;
  if (!ObjectId.isValid(req.params.id)) {
    return next(
      new ValidationError("Validation Error in Update User", [
        "Invalid user ID",
      ])
    );
  }

  const user = await req.db
    .db(process.env.databasename)
    .collection(User)
    .updateOne(
      { _id: ObjectId(req.params.id) },
      {
        $set: {
          first_name,
          last_name,
          second_name,
          email,
          phone,
          is_active,
          address,
          city,
          role,
          password,
        },
      },
      {
        writeConcerm: { w: 1, j: 1 },
      }
    );
  if (!user.matchedCount) {
    return next(new ValidationError("Invalid user id", ["Invalid user Id"]));
  }
  res.status(200).json({
    status: "success",
    message: "User updated successfully",
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  const user = await req.db
    .db(process.env.databasename)
    .collection(User)
    .findOne({ _id: ObjectId(req.user._id) });

  res.status(200).json({
    status: "success",
    user: user,
  });
});

//$set update the document , if the the key is not exist then it will add it

//////
exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await req.db
    .db(process.env.databasename)
    .collection(User)
    .updateOne({ _id: ObjectId(req.user._id) }, { $set: { is_active: false } });

  if (user.modifiedCount != 1) {
    return next(
      new ValidationError("Something went wrong", [
        "Error occured when tried to delete  user",
      ])
    );
  }
  res.status(200).json({
    status: "success",
    message: "User deleted succeffully",
  });
});

exports.updateMyName = catchAsync(async (req, res, next) => {
  const { first_name, second_name, last_name } = req.body;
  //validation

  //
  await req.db
    .db(process.env.databasename)
    .collection(User)
    .updateOne(
      { _id: req.user._id },
      {
        $set: {
          first_name,
          second_name,
          last_name,
        },
      },
      {
        writeConcerm: { w: 1, j: 1 },
      }
    );
  res.status(200).json({
    status: "success",
    message: "Your name updated successfully",
  });
});
exports.updateMyAddress = catchAsync(async (req, res, next) => {
  const { address } = req.body;
  //validation

  //
  await req.db
    .db(process.env.databasename)
    .collection(User)
    .updateOne(
      { _id: req.user._id },
      {
        $set: {
          address,
        },
      },
      {
        writeConcerm: { w: 1, j: 1 },
      }
    );
  res.status(200).json({
    status: "success",
    message: "Your address updated successfully",
  });
});
exports.updateMyCity = catchAsync(async (req, res, next) => {
  const { city } = req.body;
  //validation

  //
  await req.db
    .db(process.env.databasename)
    .collection(User)
    .updateOne(
      { _id: req.user._id },
      {
        $set: {
          city,
        },
      },
      {
        writeConcerm: { w: 1, j: 1 },
      }
    );
  res.status(200).json({
    status: "success",
    message: "Your city updated successfully",
  });
});
exports.updateMyPassword = catchAsync(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  //validation

  //
  if (oldPassword !== req.user.password) {
    return next(
      new ValidationError("Wrong password", [
        "Your old password in not correct",
      ])
    );
  }
  await req.db
    .db(process.env.databasename)
    .collection(User)
    .updateOne(
      { _id: req.user._id },
      {
        $set: {
          password: newPassword,
        },
      },
      {
        writeConcerm: { w: 1, j: 1 },
      }
    );
  res.status(200).json({
    status: "success",
    message: "Your password updated successfully",
  });
});

//
exports.updateMyPhone = catchAsync(async (req, res, next) => {});

exports.updateMyEmail = catchAsync(async (req, res, next) => {});
