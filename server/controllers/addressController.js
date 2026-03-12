import Address from "../models/Address.js";

// THÊM ĐỊA CHỈ GIAO HÀNG MỚI : /api/address/add
export const addAddress = async (req, res) => {
  try {
    // NHẬN - Lấy ID người dùng và thông tin địa chỉ từ request
    const { userId, address } = req.body;

    // XỬ LÝ - Tạo mới một cuốn sổ địa chỉ trong Database"
    await Address.create({ ...address, userId });

    // TRẢ VỀ - Báo cáo thành công
    res.json({ success: true, message: "Address added successfully" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// LẤY DANH SÁCH ĐỊA CHỈ CỦA USER : /api/address/get
export const getAddress = async (req, res) => {
  try {
    // NHẬN: Lấy ID người dùng do Middleware cấp cho
    const userId = req.userId;

    // XỬ LÝ: Tìm trong bảng Address tất cả các địa chỉ ghi tên ID khách hàng
    const addresses = await Address.find({ userId });

    // TRẢ VỀ: Trả danh sách địa chỉ tìm được về cho client
    res.json({ success: true, addresses });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
