const express = require("express");
const { protect, restrictTo } = require("../controllers/authCon");

const {
   getOrders,
   createOrder,
   getOrder,
   updateOrderStatus,
   deleteOrder,
   getTotalSales,
   updateMyOrder,
   getMyOrders,
} = require("../controllers/orderCon");
const { createOrderValidator } = require("../validation/validator");

const router = express.Router();

//admin routes
router.get("/", protect, restrictTo("admin", "manager", "delivery"), getOrders);
router.put("/:id", protect, restrictTo("admin", "manager", "delivery"), updateOrderStatus);
router.delete("/:id", protect, deleteOrder);

//shared routes

//user routes
router.post("/", protect, createOrderValidator, createOrder);
router.get("/myorders", protect, getMyOrders);
router.get("/:id", protect, getOrder);

router.get("/get/totalsales", protect, restrictTo("admin"), getTotalSales);
router.put("/updatemyorder/:id", protect, updateMyOrder);
module.exports = router;
