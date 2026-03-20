import express from "express";
import { createReceipt, listReceipts } from "../controllers/warehouseController.js";
import authSeller from "../middlewares/authSeller.js";

const warehouseRouter = express.Router();

warehouseRouter.post("/receipt", authSeller, createReceipt);
warehouseRouter.get("/receipts", authSeller, listReceipts);

export default warehouseRouter;
