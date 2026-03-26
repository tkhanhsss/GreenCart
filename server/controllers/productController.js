import { v2 as cloudinary } from "cloudinary";
import Product from "../models/Product.js";

// POST /api/product/add
export const addProduct = async (req, res) => {
  try {
    const productData = JSON.parse(req.body.productData);

    if (
      !productData.name ||
      !productData.description ||
      !productData.category ||
      !productData.price ||
      !productData.offerPrice
    ) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    const price = Number(productData.price);
    const offerPrice = Number(productData.offerPrice);

    if (price <= 0 || offerPrice <= 0) {
      return res.json({ success: false, message: "Prices must be positive" });
    }

    if (offerPrice > price) {
      return res.json({
        success: false,
        message: "Sale price cannot be higher than original price",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.json({
        success: false,
        message: "At least one product image is required",
      });
    }

    const imageUrls = await Promise.all(
      req.files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "image",
        });
        return result.secure_url;
      }),
    );

    await Product.create({ ...productData, images: imageUrls });
    res.json({ success: true, message: "Product Added" });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// GET /api/product/list
export const productList = async (req, res) => {
  try {
    const products = await Product.find({}).populate("category");
    res.json({ success: true, products });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// POST /api/product/id
export const productById = async (req, res) => {
  try {
    const product = await Product.findById(req.body.id).populate("category");
    res.json({ success: true, product });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// POST /api/product/stock
export const changeStock = async (req, res) => {
  try {
    const { id, quantity } = req.body;

    if (quantity < 0)
      return res.json({
        success: false,
        message: "Quantity cannot be negative",
      });

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { quantity },
      { new: true },
    );

    res.json({
      success: true,
      message: "Stock Updated",
      product: updatedProduct,
    });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// POST /api/product/price
export const updatePrice = async (req, res) => {
  try {
    const { id, price, offerPrice } = req.body;

    if (!id || price == null || offerPrice == null)
      return res.json({ success: false, message: "Missing fields" });

    if (offerPrice > price)
      return res.json({
        success: false,
        message: "Sale price cannot be higher than original price",
      });

    if (price <= 0 || offerPrice <= 0)
      return res.json({ success: false, message: "Prices must be positive" });

    const updated = await Product.findByIdAndUpdate(
      id,
      { price, offerPrice },
      { new: true },
    );

    res.json({ success: true, message: "Price updated", product: updated });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// POST /api/product/delete
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.body;
    await Product.findByIdAndDelete(id);
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};
