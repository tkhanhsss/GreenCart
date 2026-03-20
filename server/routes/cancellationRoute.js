import express from "express";
import { createVoucher, listVouchers } from "../controllers/cancellationController.js";
import authSeller from "../middlewares/authSeller.js";

const cancellationRouter = express.Router();

cancellationRouter.post("/voucher", authSeller, createVoucher);
cancellationRouter.get("/vouchers", authSeller, listVouchers);

export default cancellationRouter;
