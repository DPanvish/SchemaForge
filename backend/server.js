import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic check
app.get("/", (req, res) => {
    res.status(200).json({status: "Healthy"})
})

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`SchemaForge API running on port ${PORT}`);
})
