import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookieOptions } from "../configs/cookieOptions.js";

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

const isProduction = process.env.NODE_ENV === "production";

// POST /api/user/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.json({ success: false, message: "Missing Details" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.json({ success: false, message: "User Already Exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    const token = signToken({ id: user._id });
    res.cookie("userToken", token, cookieOptions(isProduction));

    return res.json({ success: true, user: { email: user.email, name: user.name } });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// POST /api/user/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.json({ success: false, message: "Email and Password are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.json({ success: false, message: "Invalid Email or Password" });

    if (user.isDeleted)
      return res.json({ success: false, message: "Your account has been locked. Please contact support." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.json({ success: false, message: "Invalid Email or Password" });

    const token = signToken({ id: user._id });
    res.cookie("userToken", token, cookieOptions(isProduction));

    return res.json({ success: true, user: { email: user.email, name: user.name } });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// GET /api/user/is-auth
export const isAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user)
      return res.json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// GET /api/user/logout
export const logout = async (req, res) => {
  try {
    res.clearCookie("userToken", cookieOptions(isProduction));
    return res.json({ success: true, message: "Logged Out!" });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// GET /api/user/admin/users  — paginated
export const adminGetUsers = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({}).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments({}),
    ]);

    res.json({ success: true, users, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// POST /api/user/admin/toggle-delete/:id
export const adminToggleDeleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.json({ success: false, message: "User not found" });

    user.isDeleted = !user.isDeleted;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isDeleted ? "locked" : "unlocked"} successfully`,
      isDeleted: user.isDeleted,
    });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};
