import Product from "../models/Product.js";
import Order from "../models/Order.js";

// ==========================================
// ĐẶT HÀNG (Thanh toán khi nhận hàng - COD) : /api/order/cod
// ==========================================
export const placeOrderCOD = async (req, res) => {
  try {
    // 1. NHẬN thông tin đơn hàng từ người dùng
    const { userId, address, items } = req.body;
    
    // Kiểm tra xem giỏ hàng có rỗng hoặc thiếu địa chỉ không
    if (!address || items.length === 0) {
      return res.json({ success: false, message: "Invalid data" });
    }

    // 2. XỬ LÝ (Tính tổng tiền)
    // Reduce: Chạy vòng lặp qua từng món hàng trong giỏ để cộng dồn tiền
    let amount = await items.reduce(async (acc, item) => {
      // Tìm giá cả mới nhất của sản phẩm từ Database để chống gian lận (sửa giá ảo ở front-end)
      const product = await Product.findById(item.product);
      // Tiền = (Tiền tích luỹ cũ) + (Giá sản phẩm * Số lượng mua)
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    // Cộng thêm Thuế (Tax) 2% vào giá trị đơn hàng
    amount += Math.floor(amount * 0.02); 

    // Tạo Đơn hàng mới và lưu ngay xuống Database
    await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "COD", // Hình thức: Trả tiền mặt (Cash On Delivery)
      isPaid: false, // Tất nhiên COD thì chưa thanh toán rồi
    });

    // 3. TRẢ KẾT QUẢ thành công 
    return res.json({ success: true, message: "Order placed successfully!" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};


// ==========================================
// LẤY DANH SÁCH ĐƠN HÀNG CỦA MỘT USER (Lịch sử mua) : /api/order/user
// ==========================================
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId; // Được middleware gán vào sau khi xuất vé (token) thành công
    
    // Tìm tất cả đơn hàng của User này.
    // .populate("items.product address"): Lệnh Populate này CỰC KỲ lợi hại: 
    // Thay vì chỉ in ra cái "dòng ID 24 ký tự của sản phẩm", nó sẽ tự động chạy sang bảng Sản Phẩm và bảng Địa chỉ
    // để bế nguyên toàn bộ thông tin chi tiết (tên, hình ảnh, giá...) thay thế vào kết quả.
    // .sort({ createdAt: -1 }): Sắp xếp đơn mới nhất lên đầu danh sách (-1 là giảm dần)
    const orders = await Order.find({ userId })
      .populate("items.product address")
      .sort({ createdAt: -1 });
      
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ==========================================
// LẤY TẤT CẢ ĐƠN HÀNG (Dành cho Quản trị viên/Người bán) : /api/order/seller
// ==========================================
export const getAllOrders = async (req, res) => {
  try {
    // Không cần truyền điều kiện userId ở đây. Tìm {} rỗng nghĩa là bưng TOÀN BỘ mọi đơn hàng của cả công ty ra.
    const orders = await Order.find({})
      .populate("items.product address")
      .sort({ createdAt: -1 });
      
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
