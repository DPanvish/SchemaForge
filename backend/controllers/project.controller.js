import Project from "../models/Project.js";
import SchemaNode from "../models/SchemaNode.js";
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
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error("Get Projects Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

// @desc    Create a new project
// @route   POST /api/projects
export const createProject = async(req, res) => {
  try{
    const {name, description, themeColor} = req.body;
    const newProject = await Project.create({name, description, themeColor, owner: req.user._id, edges: []});
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

// @desc    Delete a project and all associated tables/endpoints
// @route   DELETE /api/projects/:id
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    await SchemaNode.deleteMany({ project: req.params.id });
    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: "Project and all associated data permanently deleted." });
  } catch (err) {
    console.error("Delete Project Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
};