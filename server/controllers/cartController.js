import User from "../models/User.js";

// CẬP NHẬT TRẠNG THÁI MỚI CỦA GIỎ HÀNG : /api/cart/update
export const updateCart = async (req, res) => {
  try {
    // NHẬN: Lấy mảng dữ liệu Giỏ hàng mới nhất từ trình duyệt gửi lên
    const { cartItems } = req.body;
    
    // Lấy ID người dùng (middleware authUser tự gài vào)
    const userId = req.userId;
    
    // XỬ LÝ: Tìm user bằng ID của nó, và dán đè thuộc tính cartItems cũ bằng list mới
    await User.findByIdAndUpdate(userId, { cartItems });
    
    // TRẢ VỀ: Báo cáo đã đồng bộ thành công
    res.json({ success: true, message: "Cart Updated" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
