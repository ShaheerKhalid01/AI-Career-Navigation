import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPost extends Document {
  authorName: string;
  message: string;
  targetRole: string;
  readinessScore?: number;
  createdAt: Date;
}

const postSchema: Schema<IPost> = new Schema({
  authorName: { type: String, required: true, maxlength: 50 },
  message: { type: String, required: true, maxlength: 1000 },
  targetRole: { type: String, required: true },
  readinessScore: { type: Number, min: 0, max: 100 },
  createdAt: { type: Date, default: Date.now }
});

const Post: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>('Post', postSchema);

export default Post;