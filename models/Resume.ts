import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IResume extends Document {
  fileName: string;
  rawText: string;
  extractedSkills: string[];
  targetRole: string;
  analysis: {
    matchedSkills: string[];
    missingSkills: string[];
    readinessScore: number;
  };
  atsCheck: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
  createdAt: Date;
}

const VALID_ROLES = [
  'software-development', 'ai-ml', 'devops', 'data-science', 'frontend', 'backend',
  'digital-marketing', 'sales', 'human-resources', 'finance-accounting',
  'graphic-design', 'content-writing', 'customer-support', 'project-management',
  'teaching-education'
];

const resumeSchema: Schema<IResume> = new Schema({
  fileName: { type: String, required: true },
  rawText: { type: String, required: true },
  extractedSkills: [{ type: String }],
  targetRole: {
    type: String,
    enum: VALID_ROLES,
    required: true
  },
  analysis: {
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    readinessScore: { type: Number, min: 0, max: 100, default: 0 }
  },
  atsCheck: {
    score: { type: Number, min: 0, max: 100, default: 0 },
    issues: [{ type: String }],
    suggestions: [{ type: String }]
  },
  createdAt: { type: Date, default: Date.now }
});

const Resume: Model<IResume> = mongoose.models.Resume || mongoose.model<IResume>('Resume', resumeSchema);

export default Resume;