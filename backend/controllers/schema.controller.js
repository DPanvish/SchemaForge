import SchemaNode from "../models/SchemaNode.js";
import { z } from "zod";

export const nodeSchemaValidation = z.object({
  body: z.object({
    projectId: z.string().min(1, "Project ID is required"),
    tableName: z.string().min(1, "Table name is required"),
    fields: z.array(z.object({
      name: z.string(),
      dataType: z.string(),
      isRequired: z.boolean().optional(),
      isUnique: z.boolean().optional(),
    })).optional(),
    uiPosition: z.object({
      x: z.number(),
      y: z.number(),
    }).optional(),
    color: z.string().optional(),
  })
});

export const nodeUpdateSchemaValidation = z.object({
  body: z.object({
    tableName: z.string().min(1, "Table name is required").optional(),
    fields: z.array(z.object({
      name: z.string(),
      dataType: z.string(),
      isRequired: z.boolean().optional(),
      isUnique: z.boolean().optional(),
    })).optional(),
    uiPosition: z.object({
      x: z.number(),
      y: z.number(),
    }).optional(),
    color: z.string().optional(),
  })
});

// @desc    Get all schema nodes for a specific project
// @route   GET /api/schemas/:projectId
export const getNodesByProject = async(req, res) => {
  try{
    const {projectId} = req.params;
    const nodes = await SchemaNode.find({project:projectId});
    res.status(200).json(nodes);
  }catch(error){
    if (error?.name === "CastError") {
      return res.status(400).json({ error: "Invalid projectId" });
    }
    res.status(500).json({error: "Server Error"});
  }
};

// @desc    Create a new schema node (table)
// @route   POST /api/schemas
export const createNode = async(req, res) => {
  try{
    const {projectId, tableName, fields, uiPosition, color} = req.body;
    const newNode = await SchemaNode.create({
      project: projectId,
      tableName,
      fields: fields || [],
      uiPosition: uiPosition || {x: 0, y: 0},
      color,
    });
    res.status(201).json(newNode);
  }catch(error){
    if (error?.name === "CastError") {
      return res.status(400).json({ error: "Invalid projectId" });
    }
    res.status(500).json({error: "Server Error"});
  }
};

// @desc    Update a node (e.g., after dragging it on the canvas or adding fields)
// @route   PUT /api/schemas/:id
export const updateNode = async(req, res) => {
  try{
    const { tableName, fields, uiPosition, color } = req.body;

    const updateNode = await SchemaNode.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          tableName, 
          fields, 
          uiPosition, 
          color,
        } 
      },
      {new: true}
    );
    if (!updateNode) {
      return res.status(404).json({ error: "Schema node not found" });
    }
    res.status(200).json(updateNode);
  }catch(error){
    res.status(500).json({error: "Server Error"});
  }
};

// @desc    Delete a node
// @route   DELETE /api/schemas/:id
export const deleteNode = async (req, res) => {
  try {
    await SchemaNode.findByIdAndDelete(req.params.id);
    res.json({ message: "Node deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};
