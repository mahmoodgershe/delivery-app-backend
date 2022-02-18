const express = require("express");
const { protect } = require("../controllers/authCon");
const { addAddress, deleteAddress, getAddresses } = require("../controllers/AddressCon");
const { createAddressValidartor } = require("../validation/validator");

const router = express.Router();

router.get("/", protect, getAddresses);
router.post("/", protect, createAddressValidartor, addAddress);
router.delete("/:id", protect, deleteAddress);

module.exports = router;
