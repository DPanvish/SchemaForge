import express from "express";
import { getEndpointByProject, createEndpoint, endpointValidationSchema, deleteEndpoint } from "../controllers/endpoint.controller.js"
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.get("/:projectId", getEndpointByProject);
router.post("/", validate(endpointValidationSchema), createEndpoint);
router.delete('/:id', deleteEndpoint);

export default router;  