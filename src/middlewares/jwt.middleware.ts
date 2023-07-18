import { NextFunction, Request, Response } from "express";
import { UserModel } from "../models";
import { verifyToken } from "../utils/jwt.util";
import { TokenExpiredError } from "jsonwebtoken";
import { failureResponse } from "../utils/response.util";

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { authorization } = req.headers;
    const { accessToken: accessTokenCookie } = req.cookies;

    if (!authorization || !accessTokenCookie) {
      return failureResponse({
        res,
        status: 401,
        message: "TOKEN_MISING_OR_INVALID",
      });
    }

    const accessTokenJWT = authorization.split(" ")[1];
    if (accessTokenJWT !== accessTokenCookie) {
      return failureResponse({ res, status: 403, message: "UNAUTHORIZED" });
    }

    const decodedToken = await verifyToken(accessTokenJWT, false);
    if (!decodedToken) {
      return failureResponse({ res, status: 401, message: "UNAUTHORIZED" });
    }

    const user = await UserModel.findById(decodedToken._id);
    if (!user) {
      return failureResponse({ res, status: 403, message: "UNAUTHORIZED" });
    }

    next();
  } catch (error) {
    if ((error as TokenExpiredError).name === "TokenExpiredError") {
      return failureResponse({ res, status: 401, message: "TOKEN_EXPIRED" });
    }
    return failureResponse({ res, status: 401, message: "UNAUTHORIZED" });
  }
};
