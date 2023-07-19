import { prop, getModelForClass, index } from "@typegoose/typegoose";

@index({ createdAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 })
class BlackListToken {
  @prop({ required: true, index: true, unique: true, type: String })
  public token!: string;

  @prop({ required: true, default: Date.now, type: Date })
  public createdAt!: Date;
}

export const BlackListTokenModel = getModelForClass(BlackListToken);
