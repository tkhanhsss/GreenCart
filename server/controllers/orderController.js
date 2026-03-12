import Product from "../models/Product.js";
import Order from "../models/Order.js";

// ĐẶT HÀNG (Thanh toán khi nhận hàng - COD) : /api/order/cod
export const placeOrderCOD = async (req, res) => {
  try {
    // NHẬN: thông tin đơn hàng từ người dùng
    const { userId, address, items } = req.body;
    
    // Kiểm tra xem giỏ hàng có rỗng hoặc thiếu địa chỉ không
    if (!address || items.length === 0) {
      return res.json({ success: false, message: "Invalid data" });
    }

    // XỬ LÝ: (Tính tổng tiền)
    // Reduce: Chạy vòng lặp qua từng món hàng trong giỏ để cộng dồn tiền
    let amount = await items.reduce(async (acc, item) => {
      // Tìm giá cả mới nhất của sản phẩm từ Database
      const product = await Product.findById(item.product);
      // Tiền = (Tiền tích luỹ cũ) + (Giá sản phẩm * Số lượng mua)
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    // Cộng thêm Thuế (Tax) 2% vào giá trị đơn hàng
    amount += Math.floor(amount * 0.02); 

    // Tạo Đơn hàng mới và lưu xuống Database
    await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "COD", 
      isPaid: false, 
    });

    // TRỪ KHO: Cập nhật lại số lượng sản phẩm trong kho sau khi đặt hàng thành công
    await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product);
        const newQuantity = product.quantity - item.quantity;
        // Cập nhật số lượng mới. Nếu số lượng <= 0 thì tự động chuyển inStock thành false (Hết hàng)
        await Product.findByIdAndUpdate(item.product, {
          quantity: newQuantity,
          inStock: newQuantity > 0
        });
      })
    );

    // TRẢ: KẾT QUẢ thành công 
    return res.json({ success: true, message: "Order placed successfully!" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// LẤY DANH SÁCH ĐƠN HÀNG CỦA MỘT USER (Lịch sử mua) : /api/order/user
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId; // Được middleware gán vào sau khi xuất vé (token) thành công
    
    const orders = await Order.find({ userId })
      .populate("items.product address")
      .sort({ createdAt: -1 });
      
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// LẤY TẤT CẢ ĐƠN HÀNG (Dành cho Quản trị viên/Người bán) : /api/order/seller
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("items.product address")
      .sort({ createdAt: -1 });
      
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
