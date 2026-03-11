import Address from "../models/Address.js";

// ==========================================
// THÊM ĐỊA CHỈ GIAO HÀNG MỚI : /api/address/add
// ==========================================
export const addAddress = async (req, res) => {
  try {
    // BƯỚC 1: NHẬN - Lấy ID người dùng và thông tin địa chỉ từ request
    const { userId, address } = req.body;

    // BƯỚC 2: XỬ LÝ - Tạo mới một cuốn sổ địa chỉ trong Database
    // Trải rộng (spread operator `...address`) mọi thông tin địa chỉ (tỉnh/thành/đường)
    // và nhét thêm cái ID của người dùng vào để đánh dấu "Địa chỉ này là của ông mang ID này"
    await Address.create({ ...address, userId });

    // BƯỚC 3: TRẢ VỀ - Báo cáo thành công
    res.json({ success: true, message: "Address added successfully" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ==========================================
// LẤY DANH SÁCH ĐỊA CHỈ CỦA USER : /api/address/get
// ==========================================
export const getAddress = async (req, res) => {
  try {
    // NHẬN: Lấy ID người dùng do Middleware (Bảo vệ) cấp cho
    const userId = req.userId;

    // XỬ LÝ: Lục trong bảng Address tìm tất cả các "cuốn sổ" ghi tên ID ông khách này
    const addresses = await Address.find({ userId });

    // TRẢ VỀ: Ném danh sách địa chỉ tìm được về cho client
    res.json({ success: true, addresses });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
