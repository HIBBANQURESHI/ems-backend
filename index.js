import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import departmentRouter from "./routes/department.js";
import employeeRouter from "./routes/employee.js";
import connectToDatabase from "./db/db.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Connect to the database
connectToDatabase();

const app = express();

// Enable CORS globally
app.use(
  cors({
    origin: "https://akc-ems.vercel.app", // Frontend origin
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
    credentials: true, // Allow cookies and credentials
  })
);

// Handle preflight requests
app.options("*", cors()); // Allow CORS preflight requests globally

// Parse incoming JSON requests
app.use(express.json());

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/department", departmentRouter);
app.use("/api/employee", employeeRouter);

// Serve static files
app.use('/public/uploads', express.static('public/uploads'));

// Start the server
const PORT = process.env.PORT || 5000; // Default to 5000 if PORT is not set
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
