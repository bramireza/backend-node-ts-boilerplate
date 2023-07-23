import { Request, Response } from "express";
import { google, Auth } from "googleapis";
import { config } from "../configs";
import {
  RefreshTokenModel,
  User,
  UserModel,
  BlackListTokenModel,
} from "../models";
import { validatePassword } from "../helpers";
import {
  setTokensAuthGoogle,
  getUserByAuthGoogle,
  createTokens,
  failureResponse,
  successResponse,
  verifyToken,
} from "../utils";

const authClient: Auth.OAuth2Client = new google.auth.OAuth2(
  config.GOOGLE.CLIENT_ID,
  config.GOOGLE.CLIENT_SECRET,
  config.GOOGLE.REDIRECT_URI
);

export const redirectAuthGoogle = (_req: Request, res: Response): Response => {
  try {
    const authUrl = authClient.generateAuthUrl({
      access_type: "offline",
      scope: ["profile", "email"],
    });
    return successResponse({ res, data: { authUrl } });
  } catch (error) {
    return failureResponse({ res });
  }
};

export const callbackAuthGoogle = async (
  req: Request,
  res: Response
): Promise<Response> => {
  // const code = req.query.code as string;
  const { credential } = req.body;
  try {
    await setTokensAuthGoogle(authClient, credential);
    const dataClient = await getUserByAuthGoogle(authClient);

    if (!dataClient.verified_email) {
      return failureResponse({ res, status: 403, message: "EMAIL_NOT_VERIFY" });
    }

    const dataUser = {
      email: dataClient.email,
      fullName: dataClient.name,
      firstName: dataClient.given_name,
      lastName: dataClient.family_name,
      gender: dataClient.gender,
      googleId: dataClient.id,
      pictureUrl: dataClient.picture,
    };

    const isFoundUser = await UserModel.findOne({ email: dataClient.email });
    if (isFoundUser) {
      const userUpdate = await UserModel.findByIdAndUpdate(
        isFoundUser._id,
        dataUser
      );

      if (userUpdate) {
        const { accessToken, refreshToken } = createTokens(userUpdate);
        await RefreshTokenModel.create({
          token: refreshToken,
          user: userUpdate._id,
        });
        return successResponse({
          res,
          data: { user: userUpdate, accessToken, refreshToken },
        });
      }
    }

    const user = new UserModel(dataUser);
    const userSaved = await user.save();

    const { accessToken, refreshToken } = createTokens(userSaved);
    await RefreshTokenModel.create({
      token: refreshToken,
      user: userSaved._id,
    });
    return successResponse({
      res,
      data: { user: userSaved, accessToken, refreshToken },
    });
  } catch (error) {
    return failureResponse({ res });
  }
};
export const signIn = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { email, password }: User = req.body;

  try {
    if (!email || !password) {
      return failureResponse({
        res,
        status: 400,
        message: "DATA_NOT_PROVIDER",
      });
    }
    const user = await UserModel.findOne({ email });

    if (!user) {
      return failureResponse({
        res,
        status: 403,
        message: "INVALID_CREDENTIALS",
      });
    }
    if (user.googleId && !user.password) {
      return failureResponse({
        res,
        status: 403,
        message: "INVALID_CREDENTIALS",
      });
    }
    const isMatch = await user.isMatchPassword(password);
    if (!isMatch) {
      return failureResponse({
        res,
        status: 403,
        message: "INVALID_CREDENTIALS",
      });
    }
    const { accessToken, refreshToken } = createTokens(user);
    await RefreshTokenModel.create({ token: refreshToken, user: user._id });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 1 * 60 * 60 * 1000, // 1hr in ms
    });

    return successResponse({ res, data: { user, accessToken, refreshToken } });
  } catch (error) {
    return failureResponse({ res });
  }
};
export const signUp = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { firstName, lastName, email, password }: User = req.body;
  try {
    if (!firstName || !lastName || !email || !password) {
      return failureResponse({
        res,
        status: 400,
        message: "DATA_NOT_PROVIDER",
      });
    }
    if (!validatePassword(password)) {
      return failureResponse({
        res,
        status: 400,
        message: "PASSWORD_NOT_FORMAT_VALID",
      });
    }
    const isFoundUser = await UserModel.findOne({ email });
    console.log(isFoundUser);
    if (isFoundUser) {
      return failureResponse({
        res,
        status: 400,
        message: "EMAIL_ALREADY_EXIST",
      });
    }
    const newUser = new UserModel(req.body);
    const savedNewUser = await newUser.save();

    return successResponse({ res, data: { user: savedNewUser } });
  } catch (error) {
    return failureResponse({ res });
  }
};

export const refreshToken = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return failureResponse({
        res,
        status: 400,
        message: "MISSING_REFRESH_TOKEN",
      });
    }

    const savedRefreshToken = await RefreshTokenModel.findRefreshTokenByToken(
      refreshToken
    );
    if (!savedRefreshToken || savedRefreshToken.revoked === true) {
      return failureResponse({ res, status: 401, message: "UNAUTHORIZED" });
    }

    const user = await UserModel.findOne({ _id: savedRefreshToken.user._id });
    if (!user) {
      return failureResponse({ res, status: 401, message: "UNAUTHORIZED" });
    }

    await RefreshTokenModel.revokeTokenById(savedRefreshToken.id);
    const { accessToken, refreshToken: newRefreshToken } = createTokens(user);
    await RefreshTokenModel.create({ user: user._id, token: newRefreshToken });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 1 * 60 * 60 * 1000, // 1hr in ms
    });

    return successResponse({
      res,
      data: { user, accessToken, refreshToken: newRefreshToken },
    });
  } catch (error) {
    return failureResponse({ res });
  }
};

export const revokeRefreshTokens = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return failureResponse({
        res,
        status: 400,
        message: "MISSING_USER_ID",
      });
    }
    await RefreshTokenModel.revokeAllTokensByUserId(userId);

    return successResponse({
      res,
      message: `Tokens revoked for user with id #${userId}`,
    });
  } catch (error) {
    return failureResponse({ res });
  }
};

export const me = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { accessToken } = req.cookies;
    const decodedToken = await verifyToken(accessToken, false);
    const user = await UserModel.findById(decodedToken._id);

    return successResponse({ res, data: { user } });
  } catch (error) {
    return failureResponse({ res });
  }
};

export const logout = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { accessToken } = req.cookies;
    if (accessToken) {
      await BlackListTokenModel.create({ token: accessToken });
    }
    res.clearCookie("accessToken");

    return successResponse({ res, message: "Logout Successfully" });
  } catch (error) {
    return failureResponse({ res });
  }
};
