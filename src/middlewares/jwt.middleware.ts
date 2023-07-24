import { NextFunction, Request, Response } from "express";
import { BlackListTokenModel, UserModel } from "../models";
import { getTokenInHeaders, verifyToken } from "../utils/jwt.util";
import { TokenExpiredError } from "jsonwebtoken";
import { failureResponse } from "../utils/response.util";

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = getTokenInHeaders(req);

    if (!accessToken) {
      return failureResponse({
        res,
        status: 401,
        message: "TOKEN_MISING_OR_INVALID",
      });
    }

    const isTokenBlackList = await BlackListTokenModel.findOne({
      token: accessToken,
    });
    if (isTokenBlackList) {
      return failureResponse({ res, status: 403, message: "UNAUTHORIZED" });
    }

    const decodedToken = await verifyToken(accessToken, false);
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
