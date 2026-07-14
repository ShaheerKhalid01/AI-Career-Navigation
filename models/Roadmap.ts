import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRoadmap extends Document {
  userId: mongoose.Types.ObjectId;
  resumeId: mongoose.Types.ObjectId;
  weeks: {
    weekNumber: number;
    topics: string[];
    resources: { title: string; url: string }[];
    miniProjects: string[];
  }[];
  generatedAt: Date;
}

const roadmapSchema: Schema<IRoadmap> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  resumeId: { type: Schema.Types.ObjectId, ref: 'Resume', required: true },
  weeks: [{
    weekNumber: Number,
    topics: [String],
    resources: [{ title: String, url: String }],
    miniProjects: [String]
  }],
  generatedAt: { type: Date, default: Date.now }
});

const Roadmap: Model<IRoadmap> =
  mongoose.models.Roadmap || mongoose.model<IRoadmap>('Roadmap', roadmapSchema);

export default Roadmap;