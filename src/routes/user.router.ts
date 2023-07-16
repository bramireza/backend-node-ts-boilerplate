import { Router } from "express";
import { userController } from "../controllers/";
import { isAuthenticated } from "../middlewares";

const userRouter: Router = Router();

userRouter.get("/", isAuthenticated, userController.getAllUsers);
userRouter.get("/:id", isAuthenticated, userController.getOneUser);

export default userRouter;
