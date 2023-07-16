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
    const authorization = req.headers["authorization"];

    if (!authorization) {
      return failureResponse({
        res,
        status: 401,
        message: "TOKEN_MISING_OR_INVALID",
      });
    }
    const token = authorization.split(" ")[1];
    const decodedToken = await verifyToken(token);

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
