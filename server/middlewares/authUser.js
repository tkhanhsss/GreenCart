import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authUser = async (req, res, next) => {
  const { userToken } = req.cookies;
  if (!userToken)
    return res.json({ success: false, message: "Not Authorized" });
  try {
    const tokenDecode = jwt.verify(userToken, process.env.JWT_SECRET);
    if (tokenDecode.id) {
      // Check if user is locked (Soft-delete Option A)
      const user = await User.findById(tokenDecode.id);
      if (!user || user.isDeleted) {
         res.clearCookie("userToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/",
         });
         return res.json({ success: false, message: "Your account has been locked. Please contact support." });
      }

      req.userId = tokenDecode.id;
    } else {
      return res.json({ success: false, message: "Not Authorized" });
    }
    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export default authUser;
