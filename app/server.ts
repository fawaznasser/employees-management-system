import express from "express";
import path from "path";

const app = express();

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
