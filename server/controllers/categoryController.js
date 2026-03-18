import { v2 as cloudinary } from "cloudinary";
import Category from "../models/Category.js";

// POST /api/category/add
export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !req.file)
      return res.json({ success: false, message: "Missing Details" });

    const upload = await cloudinary.uploader.upload(req.file.path, { resource_type: "image" });
    await Category.create({ name, image: upload.secure_url });

    res.json({ success: true, message: "Category Added" });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// GET /api/category/list
export const listCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json({ success: true, categories });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// POST /api/category/remove
export const removeCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Category Removed" });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};
