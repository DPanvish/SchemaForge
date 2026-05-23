import Project from "../models/Project.js";
import { z } from "zod";

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