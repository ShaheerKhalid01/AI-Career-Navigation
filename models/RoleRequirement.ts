import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRoleRequirement extends Document {
  role: string;
  requiredSkills: {
    skill: string;
    priority: 'must-have' | 'good-to-have';
  }[];
}

const roleRequirementSchema: Schema<IRoleRequirement> = new Schema({
  role: { type: String, required: true, unique: true },
  requiredSkills: [{
    skill: { type: String, required: true },
    priority: { type: String, enum: ['must-have', 'good-to-have'], default: 'must-have' }
  }]
});

const RoleRequirement: Model<IRoleRequirement> =
  mongoose.models.RoleRequirement || mongoose.model<IRoleRequirement>('RoleRequirement', roleRequirementSchema);

export default RoleRequirement;