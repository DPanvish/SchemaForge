import express from "express";
import { getProjects, createProject, createProjectSchema } from "../controllers/project.controller.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.get("/", getProjects);
router.post("/", validate(createProjectSchema), createProject);

export default router;