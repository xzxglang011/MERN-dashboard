import express from "express"
import {
  getAllUsers,
  createUser,
  getUserInfoByID
} from "../controller/user.controller.js"

const userRouter = express.Router();

userRouter.route("/").get(getAllUsers);
userRouter.route("/:id").get(getUserInfoByID);
userRouter.route("/").post(createUser);

export default userRouter