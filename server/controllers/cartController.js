import User from "../models/User.js";

// ==========================================
// CẬP NHẬT TRẠNG THÁI MỚI CỦA GIỎ HÀNG : /api/cart/update
// ==========================================
export const updateCart = async (req, res) => {
  try {
    // 1. NHẬN: Lấy mảng dữ liệu Giỏ hàng mới nhất từ trình duyệt gửi lên
    // (tức là sau khi người dùng bấm dấu Cộng, Trừ, hay Xóa sản phẩm trên màn hình)
    const { cartItems } = req.body;
    
    // Lấy ID người dùng (middleware authUser tự gài vào)
    const userId = req.userId;
    
    // 2. XỬ LÝ: Tìm thằng user bằng ID của nó, và dán đè thuộc tính cartItems cũ bằng cái list mới này!
    await User.findByIdAndUpdate(userId, { cartItems });
    
    // 3. TRẢ VỀ: Báo cáo đã đồng bộ lên mây thành công
    res.json({ success: true, message: "Cart Updated" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
