import { v2 as cloudinary } from "cloudinary";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

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

// GET /api/product/best-sellers
export const getBestSellers = async (req, res) => {
  try {
    const limit = Math.min(20, parseInt(req.query.limit) || 5);

    const soldAgg = await Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit * 3 },
    ]);

    if (soldAgg.length === 0) {
      const fallback = await Product.find({ quantity: { $gt: 0 } })
        .populate("category")
        .sort({ offerPrice: 1 })
        .limit(limit);
      return res.json({ success: true, products: fallback, source: "fallback" });
    }

    const ids = soldAgg.map((r) => r._id);
    const products = await Product.find({
      _id: { $in: ids },
      quantity: { $gt: 0 },
    }).populate("category");

    const soldMap = new Map(soldAgg.map((r) => [r._id.toString(), r.totalSold]));
    const sorted = products
      .map((p) => ({ ...p.toObject(), totalSold: soldMap.get(p._id.toString()) || 0 }))
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, limit);

    res.json({ success: true, products: sorted, source: "sold" });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};
