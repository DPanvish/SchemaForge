import express from "express";
import { getProjects, createProject, createProjectSchema, getProjectById, updateProjectEdges, deleteProject } from "../controllers/project.controller.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.get("/", getProjects);
router.post("/", validate(createProjectSchema), createProject);
router.get("/:id", getProjectById);
router.put("/:id/edges", updateProjectEdges);
router.delete("/:id", deleteProject);

export default router;