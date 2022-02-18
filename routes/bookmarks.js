const express = require("express");
const { protect } = require("../controllers/authCon");
const {
  fetchBookmarks,
  addBookmark,
  deleteBookmark,
} = require("../controllers/bookmarkCon");

const router = express.Router();

router.get("/", protect, fetchBookmarks);
router.post("/", protect, addBookmark);
router.delete("/:id", protect, deleteBookmark);

module.exports = router;
