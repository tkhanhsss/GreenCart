import { v2 as cloudinary } from "cloudinary";
import Product from "../models/Product.js";

// THÊM SẢN PHẨM MỚI : /api/product/add
export const addProduct = async (req, res) => {
  try {
    // BƯỚC 1: NHẬN DỮ LIỆU
    let productData = JSON.parse(req.body.productData);

    const images = req.files;

    // BƯỚC 2: XỬ LÝ
    // 2.1 Upload từng cái ảnh lên đám mây Cloudinary
    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        // Tải từng ảnh lên thư mục hình ảnh của Cloudinary
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return result.secure_url; 
      }),
    );

    // 2.2 Tạo sản phẩm mới trong Database. Gom thông tin productData và các link ảnh vào 1.
    await Product.create({ ...productData, images: imagesUrl });

    // BƯỚC 3: TRẢ KẾT QUẢ về cho quản trị viên
    res.json({ success: true, message: "Product Added" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// LẤY DANH SÁCH SẢN PHẨM : /api/product/list
export const productList = async (req, res) => {
  try {
    // Tìm và xuất ra TOÀN BỘ sản phẩm có trong DB
    const products = await Product.find({});

    res.json({ success: true, products });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// LẤY CHI TIẾT 1 SẢN PHẨM THEO ID : /api/product/id
export const productById = async (req, res) => {
  try {
    // NHẬN ID sản phẩm cần tìm từ client gửi qua req.body (hoặc req.params)
    const { id } = req.body;

    // XỬ LÝ: Gọi DB tìm đúng cái ID đó
    const product = await Product.findById(id);

    // TRẢ VỀ: Cho người dùng thông tin sản phẩm
    res.json({ success: true, product });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// THAY ĐỔI TÌNH TRẠNG KHO HÀNG (Stock) : /api/product/stock
export const changeStock = async (req, res) => {
  try {
    // Lấy ID sản phẩm và số lượng kho hàng mới
    const { id, quantity } = req.body;

    if (quantity < 0) {
      return res.json({
        success: false,
        message: "Quantity cannot be negative", 
      });
    }

    // Cập nhật CÙNG LÚC 2 giá trị trong Database:
    // 1. Số lượng (quantity)
    // 2. inStock: Tự động đổi thành true nếu có qty > 0, và false nếu 0
    // { new: true }: Trả về dữ liệu MỚI cập nhật, đừng trả cái cũ.
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { quantity, inStock: quantity > 0 },
      { new: true },
    );

    res.json({
      success: true,
      message: "Stock Updated",
      product: updatedProduct,
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
