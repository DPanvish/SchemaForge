import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String, 
    default: '' 
  },
  themeColor: { 
    type: String, 
    default: '#0A0A0A' 
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  edges: {
    type: Array,
    default: []
  },
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);

export default Project;