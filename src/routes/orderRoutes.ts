import { Router } from "express";

import {
  createOrder,
  getAllOrders,
  getOrderById,
} from "../controllers/orderController";

const router = Router();

router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.post("/", createOrder);

export default router;