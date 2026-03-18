import express from "express";
import {
  addCategory,
  listCategories,
  removeCategory,
} from "../controllers/categoryController.js";
import { upload } from "../configs/multer.js";
import authSeller from "../middlewares/authSeller.js";

const categoryRoute = express.Router();

categoryRoute.post("/add", upload.single("image"), authSeller, addCategory);
categoryRoute.get("/list", listCategories);
categoryRoute.post("/remove", authSeller, removeCategory);

export default categoryRoute;
