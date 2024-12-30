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

// Enable CORS
app.use(
  cors({
    origin: "https://akc-ems.vercel.app", // Allow requests from your frontend
    credentials: true, // Allow cookies and credentials to be included
  })
);

// Parse incoming JSON requests
app.use(express.json());

// Serve static files
app.use('/public/uploads', express.static('public/uploads'));

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/department", departmentRouter);
app.use("/api/employee", employeeRouter);

// Start the server
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
