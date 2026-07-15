import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJob extends Document {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  role: string;
  url: string;
  postedBy?: string;
  postedAt: Date;
  createdAt: Date;
}

const jobSchema: Schema<IJob> = new Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, default: 'Remote' },
  description: { type: String, required: true },
  requirements: [{ type: String }],
  role: { type: String, index: true },
  url: { type: String },
  postedBy: { type: String },
  postedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>('Job', jobSchema);
export default Job;
