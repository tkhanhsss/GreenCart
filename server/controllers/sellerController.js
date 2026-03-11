import jwt from "jsonwebtoken";

// ==========================================
// ĐĂNG NHẬP NGƯỜI BÁN (Admin/Seller) : /api/seller/login
// ==========================================
export const sellerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Khác với User phải tìm trong Database, tài khoản Quản trị thường được giấu kín 
    // trong file môi trường (.env) để không ai lấy được Database mà cướp quyền
    if (
      password === process.env.SELLER_PASSWORD &&
      email === process.env.SELLER_EMAIL
    ) {
      // Nếu đúng mật khẩu Quản trị viên, phát cho họ cái Vé (Token) "Thẻ Bài Miễn Tử"
      const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      
      // Nhét thẻ bài đó vào cookie riêng mang tên sellerToken (để không bị lộn với túi userToken)
      res.cookie("sellerToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      
      return res.json({ success: true, message: "Logged In!" });
    } else {
      // Sai pass thì đuổi ra
      return res.json({ success: false, message: "Invalid Credentials!" });
    }
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ==========================================
// KIỂM TRA QUYỀN QUẢN TRỊ : /api/seller/is-auth
// ==========================================
export const isSellerAuth = async (req, res) => {
  try {
    // Khi lọt được vào hàm này nghĩa là đã vượt qua được vòng gác của anh Bảo Vệ "authSeller.js" rồi. 
    // Quá an toàn rồi, Nên chỉ việc mỉm cười và trả về true thôi!
    return res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ==========================================
// ĐĂNG XUẤT NGƯỜI BÁN (Logout) : /api/seller/logout
// ==========================================
export const sellerLogout = async (req, res) => {
  try {
    // Hủy bỏ thẻ bài (Xóa Cookie)
    res.clearCookie("sellerToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    return res.json({ success: true, message: "Admin Logged Out!" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
