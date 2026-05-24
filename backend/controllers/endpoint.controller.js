import Endpoint from "../models/Endpoint.js";
import { z }  from "zod";

// Zod Validation for Endpoint Inputs
export const endpointValidationSchema = z.object({
  body: z.object({
    projectId: z.string().min(1, "Project ID is required"),
    method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
    path: z.string().min(1, "Route path is required").startsWith("/", "Path must start with a '/'"),
    description: z.string().optional(),
    requestBody: z.record(z.any()).optional(),
    responseSchema: z.record(z.any()).optional(),
  })
});

// @desc    Get all endpoints for a specific project
// @route   GET /api/endpoints/:projectId
export const getEndpointByProject = async(req, res) => {
  try{
    const {projectId} = req.params;
    const endpoints = await Endpoint.find({project: projectId}).sort({path: 1});

    res.status(200).json(endpoints);
  }catch(error){
    if (error?.name === "CastError") {
      return res.status(400).json({ error: "Invalid projectId" });
    }

    res.status(500).json({error: "Server Error"});
  }
};

// @desc    Register a new API route mapping
// @route   POST /api/endpoints
export const createEndpoint = async(req, res) => {
  try{
    const {projectId, method, path, description, requestBody, responseSchema} = req.body;
    const newEndpoint = await Endpoint.create({
      project: projectId,
      method,
      path,
      description,
      requestBody: requestBody || {},
      responseSchema: responseSchema || {},
    });

    res.status(201).json(newEndpoint);
  }catch(error){
    if (error?.name === "CastError") {
      return res.status(400).json({ error: "Invalid projectId" });
    }

    res.status(500).json({error: "Server Error"});
  }
};