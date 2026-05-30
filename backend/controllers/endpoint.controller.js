import Endpoint from "../models/Endpoint.js";
import { z } from "zod";

// Zod Validation Schema (Used by your validate middleware)
export const endpointValidationSchema = z.object({
  body: z.object({
    projectId: z.string().min(1, "Project ID is required"),
    method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
    path: z.string().min(1, "Route path is required").startsWith("/", "Path must start with a '/'"),
    middleware: z.string().optional(),
    description: z.string().optional(),
    requestBody: z.any().optional(), 
    responseSchema: z.any().optional(),
  })
});

// @desc    Get all endpoints for a specific project
// @route   GET /api/endpoints/:projectId
export const getEndpointByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const endpoints = await Endpoint.find({ project: projectId }).sort({ path: 1 });

    res.status(200).json(endpoints);
  } catch (error) {
    if (error?.name === "CastError") {
      return res.status(400).json({ error: "Invalid projectId" });
    }
    res.status(500).json({ error: "Server Error" });
  }
};

// @desc    Register a new API route mapping
// @route   POST /api/endpoints
export const createEndpoint = async (req, res) => {
  try {
    const { projectId, method, path, description, requestBody, responseSchema } = req.body;

    const parsedRequest = typeof requestBody === 'string' ? JSON.parse(requestBody || '{}') : requestBody;
    const parsedResponse = typeof responseSchema === 'string' ? JSON.parse(responseSchema || '{}') : responseSchema;

    const newEndpoint = await Endpoint.create({
      project: projectId,
      method,
      path,
      middleware: req.body.middleware || '',
      description,
      requestBody: parsedRequest || {},
      responseSchema: parsedResponse || {},
    });

    res.status(201).json(newEndpoint);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return res.status(400).json({ error: "Invalid JSON format in payload body" });
    }
    if (error?.name === "CastError") {
      return res.status(400).json({ error: "Invalid projectId" });
    }
    res.status(500).json({ error: "Server Error" });
  }
};

// @desc    Update an endpoint
// @route   PUT /api/endpoints/:id
export const updateEndpoint = async (req, res) => {
  try {
    const { method, path, description, requestBody, responseSchema, middleware } = req.body;
    
    const parsedRequest = typeof requestBody === 'string' ? JSON.parse(requestBody || '{}') : requestBody;
    const parsedResponse = typeof responseSchema === 'string' ? JSON.parse(responseSchema || '{}') : responseSchema;

    const updated = await Endpoint.findByIdAndUpdate(
      req.params.id, 
      { method, path, description, requestBody: parsedRequest, responseSchema: parsedResponse, middleware },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};

// @desc    Delete an endpoint
// @route   DELETE /api/endpoints/:id
export const deleteEndpoint = async (req, res) => {
  try {
    const deleted = await Endpoint.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Endpoint not found" });
    
    res.json({ message: "Endpoint removed" });
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};