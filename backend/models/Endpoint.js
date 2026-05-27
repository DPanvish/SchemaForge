import mongoose from "mongoose";

const endpointSchema = new mongoose.Schema({
  project: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  method: { 
    type: String, 
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], 
    required: true 
  },
  path: { 
    type: String, 
    required: true 
  }, 
  description: { 
    type: String,
    default: '' 
  },
  requestBody: { 
    type: Object, 
    default: {} 
  },
  responseSchema: { 
    type: Object, 
    default: {} 
  }
}, { timestamps: true });

const Endpoint = mongoose.model('Endpoint', endpointSchema);

export default Endpoint;