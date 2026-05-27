import mongoose from "mongoose";

const schemaNodeSchema = new mongoose.Schema({
  project: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  tableName: { 
    type: String, 
    required: true 
  },
  fields: [{
    name: { 
      type: String, 
      required: true 
    },
    dataType: { 
      type: String, 
      required: true 
    }, 
    isRequired: { 
      type: Boolean, 
      default: false 
    },
    isUnique: { 
      type: Boolean, 
      default: false 
    }
  }],
  uiPosition: {
    x: { 
      type: Number, 
      default: 0 
    },
    y: { 
      type: Number, 
      default: 0 
    }
  },
  color: {
    type: String,
    default: "#00E5FF"
  }
}, { timestamps: true });

const SchemaNode = mongoose.model('SchemaNode', schemaNodeSchema);

export default SchemaNode;