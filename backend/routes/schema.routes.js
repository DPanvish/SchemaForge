import express from "express";
import { getNodesByProject, createNode, updateNode, nodeSchemaValidation, nodeUpdateSchemaValidation, deleteNode } from "../controllers/schema.controller.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.get("/:projectId", getNodesByProject);
router.post("/", validate(nodeSchemaValidation), createNode);
router.put("/:id", validate(nodeUpdateSchemaValidation), updateNode);
router.delete('/:id', deleteNode);

export default router;
