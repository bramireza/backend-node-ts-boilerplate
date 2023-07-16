import { Request, Response } from "express";
import { UserModel } from "../models";
import { failureResponse, successResponse } from "../utils";

export const getAllUsers = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  try {
    const users = await UserModel.find();
    return successResponse({
      res,
      data: {
        message: "SUCCESSFUL_SIGNIN",
        users,
      },
    });
  } catch (error) {
    return failureResponse({ res });
  }
};

export const getOneUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const _id = req.params.id;
    const user = await UserModel.findById(_id);
    if (!user) {
      return failureResponse({ res, status: 400, message: "USER_NOT_FOUND" });
    }

    return successResponse({ res, data: { user } });
  } catch (error) {
    return failureResponse({ res });
  }
};
