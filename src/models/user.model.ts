import {
  DocumentType,
  getModelForClass,
  pre,
  prop,
} from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import bcrypt from "bcrypt";

@pre<User>("save", async function (next) {
  this.fullName = this.firstName + " " + this.lastName;
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
})
export class User extends TimeStamps {
  @prop({ type: String })
  public fullName?: string;

  @prop({ require: true, type: String })
  public firstName!: string;

  @prop({ require: true, type: String })
  public lastName!: string;

  @prop({ require: true, type: String })
  public email!: string;

  @prop({ type: String })
  public password!: string;

  @prop({ type: Date })
  public birthDay?: Date;

  @prop({ type: String })
  public nationality?: string;

  @prop({ type: String })
  public gender?: string;

  @prop({ type: String })
  public googleId?: string;

  @prop({ type: String })
  public pictureUrl?: string;

  public async isMatchPassword(
    this: DocumentType<User>,
    password: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }
}
export const UserModel = getModelForClass(User);
