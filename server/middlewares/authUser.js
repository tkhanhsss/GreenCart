import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { cookieOptions } from "../configs/cookieOptions.js";

const isProduction = process.env.NODE_ENV === "production";

const authUser = async (req, res, next) => {
  const { userToken } = req.cookies;
  if (!userToken)
    return res.json({ success: false, message: "Not Authorized" });

  try {
    const tokenDecode = jwt.verify(userToken, process.env.JWT_SECRET);
    if (!tokenDecode.id)
      return res.json({ success: false, message: "Not Authorized" });

    // Check if user is locked (soft-delete)
    const user = await User.findById(tokenDecode.id);
    if (!user || user.isDeleted) {
      res.clearCookie("userToken", cookieOptions(isProduction));
      return res.json({
        success: false,
        message: "Your account has been locked. Please contact support.",
      });
    }

    req.userId = tokenDecode.id;
    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export default authUser;
