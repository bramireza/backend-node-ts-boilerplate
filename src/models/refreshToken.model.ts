import {
  Ref,
  DocumentType,
  getModelForClass,
  prop,
} from "@typegoose/typegoose";
import { User } from "./user.model";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";

export class RefreshToken extends TimeStamps {
  @prop({ required: true, ref: () => User })
  public user!: Ref<User>;

  @prop({ required: true, type: String })
  public token!: string;

  @prop({ type: Boolean, default: false })
  public revoked!: boolean;

  static async revokeAllTokensByUserId(userId: string): Promise<void> {
    await RefreshTokenModel.updateMany({ user: userId }, { revoked: true });
  }
  static async revokeTokenById(id: string): Promise<void> {
    await RefreshTokenModel.findByIdAndUpdate(id, { revoked: true });
  }

  static async findRefreshTokenByToken(
    token: string
  ): Promise<DocumentType<RefreshToken> | null> {
    return await RefreshTokenModel.findOne({ token });
  }
}

export const RefreshTokenModel = getModelForClass(RefreshToken);
