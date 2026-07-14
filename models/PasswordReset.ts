import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPasswordReset extends Document {
  email: string;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

const passwordResetSchema: Schema<IPasswordReset> = new Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const PasswordReset: Model<IPasswordReset> = mongoose.models.PasswordReset || mongoose.model<IPasswordReset>('PasswordReset', passwordResetSchema);
export default PasswordReset;
