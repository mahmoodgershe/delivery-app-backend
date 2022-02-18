const express = require("express");
const { protect, restrictTo, refresh } = require("../controllers/authCon");
const router = express.Router();
const {
  register,
  getUsers,
  getUser,
  login,
  getMe,
  updateMe,
  deleteMe,
  updateUser,
  deleteUser,
} = require("../controllers/userCon");
const {
  registerValidator,
  loginValidator,
} = require("../validation/validator");

//authnentication actions
router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);
//user actions
router.get("/me", protect, getMe);
// router.put("/me/update", protect, updateMe);
router.delete("/me/delete", protect, deleteMe);
router.get("/refresh", protect, refresh);
//
//
// admin actions
router.get("/", protect, restrictTo("admin"), getUsers);
router.get("/:id", protect, restrictTo("admin"), getUser);
router.put("/:id", protect, restrictTo("admin"), updateUser);
router.delete("/:id", protect, restrictTo("admin"), deleteUser);

///
module.exports = router;
