import { v2 as cloudinary } from "cloudinary";
import Category from "../models/Category.js";

// ==========================================
// THÊM DANH MỤC MỚI : /api/category/add
// ==========================================
export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const imageFile = req.file;

    if (!name || !imageFile) {
      return res.json({ success: false, message: "Missing Name or Image" });
    }

    // Tải ảnh lên Cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });
    const imageUrl = imageUpload.secure_url;

    // Lưu vào database
    const category = new Category({
      name,
      image: imageUrl,
    });
    await category.save();

    res.json({ success: true, message: "Category Added", category });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ==========================================
// LẤY DANH SÁCH DANH MỤC : /api/category/list
// ==========================================
export const listCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json({ success: true, categories });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ==========================================
// XÓA 1 DANH MỤC : /api/category/remove
// ==========================================
export const removeCategory = async (req, res) => {
  try {
    const { id } = req.body;
    await Category.findByIdAndDelete(id);
    res.json({ success: true, message: "Category Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
