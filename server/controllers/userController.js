import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ĐĂNG KÝ NGƯỜI DÙNG : /api/user/register
export const register = async (req, res) => {
  try {
    // BƯỚC 1: NHẬN - Lấy dữ liệu được gửi lên từ client
    const { name, email, password } = req.body;
    
    // Kiểm tra tính hợp lệ
    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing Details" });
    }

    // BƯỚC 2: XỬ LÝ - Tương tác với Cơ sở dữ liệu
    // 2.1: Gọi Model User để kiểm tra xem email này đã đăng ký chưa
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.json({ success: false, message: "User Already Exists" });
      
    // 2.2: Băm mật khẩu (Hash) để bảo mật
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 2.3: Tạo và lưu thông tin User mới vào MongoDB
    const user = await User.create({ name, email, password: hashedPassword });

    // 2.4: Tạo Token bằng JWT để người dùng có thể dùng cho các chức năng sau này
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d", // Token có hạn sử dụng 7 ngày
    });

    // BƯỚC 3: TRẢ VỀ KẾT QUẢ - Gửi cấu hình báo cáo
    // Cất Token vào Cookies của trình duyệt
    res.cookie("userToken", token, {
      httpOnly: true, // Bảo mật: Không cho phép code Javascript trên web (Front-end) truy cập cookie này (Chống lỗi XSS)
      secure: process.env.NODE_ENV === "production", // Nếu đưa lên mạng thật (production) thì mới cần https
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Fix lỗi cookie với các tên miền chéo nhau
      maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie sẽ tự hủy sau 7 ngày
      path: "/", // Áp dụng cookie này cho mọi đường dẫn trang web
    });
    
    return res.json({
      success: true,
      user: { email: user.email, name: user.name },
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ĐĂNG NHẬP NGƯỜI DÙNG : /api/user/login
export const login = async (req, res) => {
  try {
    // Bước 1: NHẬN email và mật khẩu
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({
        success: false,
        message: "Email and Password are required",
      });
    }
    
    // Bước 2: XỬ LÝ
    // 2.1 Tìm user trong Database theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Invalid Email or Password" });
    }
    
    // 2.2 So sánh mật khẩu khách gửi với mật khẩu băm trong database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.json({ success: false, message: "Invalid Email or Password" });

    // 2.3 Tạo token mới cho phiên đăng nhập này
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    
    // Bước 3: TRẢ KẾT QUẢ - Lưu token vào cookies và báo thành công
    res.cookie("userToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });
    return res.json({
      success: true,
      user: { email: user.email, name: user.name },
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// KIỂM TRA QUYỀN (Auth) : /api/user/is-auth
export const isAuth = async (req, res) => {
  try {
    // req.userId được cấp bởi Middleware
    // Dùng ID này để tìm đúng User trong Database.
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    
    // Trả về thông tin user
    res.json({ success: true, user });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ĐĂNG XUẤT (Logout) : /api/user/logout
export const logout = async (req, res) => {
  try {
    // Xóa Token ở trong Cookies
    res.clearCookie("userToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });
    return res.json({ success: true, message: "Logged Out!" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
