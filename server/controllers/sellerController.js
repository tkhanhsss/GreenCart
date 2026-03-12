import jwt from "jsonwebtoken";

// ĐĂNG NHẬP NGƯỜI BÁN (Admin/Seller) : /api/seller/login
export const sellerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      password === process.env.SELLER_PASSWORD &&
      email === process.env.SELLER_EMAIL
    ) {
      // Nếu đúng mật khẩu Quản trị viên, phát Token
      const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      
      // Nhét Token vào cookie riêng mang tên sellerToken
      res.cookie("sellerToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      
      return res.json({ success: true, message: "Logged In!" });
    } else {
      // Sai pass
      return res.json({ success: false, message: "Invalid Credentials!" });
    }
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// KIỂM TRA QUYỀN QUẢN TRỊ : /api/seller/is-auth
export const isSellerAuth = async (req, res) => {
  try {
    return res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ĐĂNG XUẤT NGƯỜI BÁN (Logout) : /api/seller/logout
export const sellerLogout = async (req, res) => {
  try {
    // (Xóa Cookie)
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
