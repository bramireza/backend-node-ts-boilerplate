import { Router } from "express";
import { authController } from "../controllers/";

const authRouter: Router = Router();

authRouter.get("/google", authController.redirectAuthGoogle);
authRouter.get("/google/callback", authController.callbackAuthGoogle);
authRouter.post("/signin", authController.signIn);
authRouter.post("/signup", authController.signUp);
authRouter.post("/refreshtoken", authController.refreshToken);
authRouter.post("revoketokens", authController.revokeRefreshTokens);

export default authRouter;
