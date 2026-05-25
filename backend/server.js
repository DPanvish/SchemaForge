import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import { protect } from "./middleware/auth.middleware.js";
import projectRoutes from "./routes/project.routes.js";
import schemaRoutes from "./routes/schema.routes.js";
import endpointRoutes from "./routes/endpoint.routes.js";


dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet()); // Set Security HTTP Headers

app.use((req, res, next) => {
  Object.defineProperty(req, 'query', {
    value: req.query,
    writable: true,
    configurable: true,
    enumerable: true,
  });
  next();
});

app.use(mongoSanitize()); // Prevent NoSQL Injection (sanitizes data containing $ or .)

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
});
app.use("/api", limiter);

// Basic check
app.get("/", (req, res) => {
    res.status(200).json({status: "Healthy"})
})

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", protect, projectRoutes);
app.use("/api/schemas", protect, schemaRoutes);
app.use("/api/endpoints", protect, endpointRoutes)

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`SchemaForge API running on port ${PORT}`);
})
