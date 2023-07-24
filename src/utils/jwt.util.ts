import jwt from "jsonwebtoken";
import { config } from "../configs";
import { User } from "../models";
import { DocumentType, mongoose } from "@typegoose/typegoose";
import { Request } from "express";

const { JWT } = config;
interface IToken {
  _id: mongoose.Types.ObjectId;
  name: string;
}

export const verifyToken = async (
  token: string,
  isRefreshToken: boolean
): Promise<IToken> => {
  const secret = isRefreshToken
    ? JWT.REFRESH_TOKEN.SECRET
    : JWT.ACCESS_TOKEN.SECRET;
  const decoded = <IToken>jwt.verify(token, secret);
  return decoded;
};

const generateToken = (data: IToken, isRefreshToken: boolean): string => {
  const secret = isRefreshToken
    ? JWT.REFRESH_TOKEN.SECRET
    : JWT.ACCESS_TOKEN.SECRET;

  const expiration = isRefreshToken
    ? JWT.REFRESH_TOKEN.EXP
    : JWT.ACCESS_TOKEN.EXP;

  return jwt.sign(data, secret, {
    expiresIn: expiration,
  });
};

export const createTokens = (
  user: DocumentType<User>
): {
  accessToken: string;
  refreshToken: string;
} => {
  const dataToken: IToken = {
    _id: user._id,
    name: user.firstName,
  };
  const accessToken = generateToken(dataToken, false);
  const refreshToken = generateToken(dataToken, true);

  return {
    accessToken,
    refreshToken,
  };
};

export const getTokenInHeaders = (req: Request): string | null => {
  const { authorization } = req.headers;
  if (!authorization) {
    return null;
  }
  const accessToken = authorization.split(" ")[1];
  if (!accessToken) {
    return null;
  }
  return accessToken;
};
