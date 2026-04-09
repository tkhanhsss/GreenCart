import express from "express";
import {
  addProduct,
  productList,
  productById,
  updatePrice,
  deleteProduct,
  getBestSellers,
} from "../controllers/productController.js";
import upload from "../middlewares/multer.js";
import authSeller from "../middlewares/authSeller.js";

const productRouter = express.Router();

productRouter.post("/add", upload.array(["images"]), authSeller, addProduct);
productRouter.get("/list", productList);
productRouter.get("/best-sellers", getBestSellers);
productRouter.get("/id", productById);
productRouter.post("/price", authSeller, updatePrice);
productRouter.post("/delete", authSeller, deleteProduct);

export default productRouter;
