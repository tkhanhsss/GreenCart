import express from "express";
import {
  register,
  login,
  isAuth,
  logout,
  adminGetUsers,
  adminToggleDeleteUser
} from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";
import authSeller from "../middlewares/authSeller.js";

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/is-auth", authUser, isAuth);
userRouter.get("/logout", logout);

// Admin / Seller Routes
userRouter.get("/admin/users", authSeller, adminGetUsers);
userRouter.post("/admin/toggle-delete/:id", authSeller, adminToggleDeleteUser);

export default userRouter;
