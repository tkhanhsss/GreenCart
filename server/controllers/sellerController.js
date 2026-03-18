import jwt from "jsonwebtoken";
import { cookieOptions } from "../configs/cookieOptions.js";

const isProduction = process.env.NODE_ENV === "production";

// POST /api/seller/login
export const sellerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const validCredentials =
      email === process.env.SELLER_EMAIL &&
      password === process.env.SELLER_PASSWORD;

    if (!validCredentials)
      return res.json({ success: false, message: "Invalid Credentials!" });

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("sellerToken", token, cookieOptions(isProduction));

    return res.json({ success: true, message: "Logged In!" });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// GET /api/seller/is-auth
export const isSellerAuth = (req, res) => {
  res.json({ success: true });
};

// GET /api/seller/logout
export const sellerLogout = (req, res) => {
  try {
    res.clearCookie("sellerToken", cookieOptions(isProduction));
    return res.json({ success: true, message: "Admin Logged Out!" });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};
