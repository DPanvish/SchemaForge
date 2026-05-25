import Project from "../models/Project.js";
import { z } from "zod";

// Validation Schema for creating a project
export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Project name is required").max(50),
    description: z.string().optional(),
  })
});

// @desc    Get all workspace projects
// @route   GET /api/projects
export const getProjects = async(req, res) => {
  try{
    const projects = await Project.find().sort({updatedAt: -1});
    res.status(200).json(projects);
  }catch(error){
    res.status(500).json({error: "Server Error"});
  }
};

// @desc    Create a new project
// @route   POST /api/projects
export const createProject = async(req, res) => {
  try{
    const {name, description} = req.body;
    const newProject = await Project.create({name, description});
    res.status(201).json(newProject);
  }catch(error){
    res.status(500).json({error: "Server Error"});
  }
};

// @desc    Update a project's visual edges
// @route   PUT /api/projects/:id/edges
export const updateProjectEdges = async (req, res) => {
  try {
    const { edges } = req.body;

    if (!Array.isArray(edges)) {
      return res.status(400).json({ error: "edges must be an array" });
    }
    
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: { edges: edges } },
      { new: true, runValidators: true}
    );

    if (!updatedProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(updatedProject);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};

// @desc    get project by id
// @route   PUT /api/projects/:id
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};