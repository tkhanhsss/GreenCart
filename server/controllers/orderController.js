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

    // 2. XỬ LÝ (Tính tổng tiền và kiểm tra tồn kho)
    // Dùng for...of thay vì map/reduce để chờ await và có thể return sớm nếu hết hàng
    let amount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
         return res.json({ success: false, message: "Product not found" });
      }
      if (product.quantity < item.quantity) {
         return res.json({ success: false, message: `Sản phẩm ${product.name} không đủ số lượng trong kho!` });
      }
      amount += product.offerPrice * item.quantity;
    }

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

    // Trừ tồn kho đồng loạt sau khi đã tạo Đơn thành công
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: -item.quantity }
      });
    }

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

// ==========================================
// CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG (Dành cho Quản trị viên/Người bán) : /api/order/status
// ==========================================
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    // Nếu chuyển sang Cancelled thì hoàn trả tồn kho (chỉ hoàn khi trạng thái trước đó KHÁC Cancelled)
    if (status === "Cancelled" && order.status !== "Cancelled") {
       for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
             $inc: { quantity: item.quantity }
          });
       }
    } 
    // Nếu từ Cancelled quay về trạng thái khác (tuỳ logic có cho phép hay không, ở đây tạm thời trừ lại tồn kho)
    else if (order.status === "Cancelled" && status !== "Cancelled") {
       for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
             $inc: { quantity: -item.quantity }
          });
       }
    }

    order.status = status;
    await order.save();

    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
