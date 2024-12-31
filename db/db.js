import mongoose from "mongoose";

let isConnected = false; // Global variable to track the connection

const connectToDatabase = async () => {
    if (isConnected) {
        console.log("Using existing database connection");
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        isConnected = db.connections[0].readyState;
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Database connection error:", error.message);
        throw new Error("Database connection failed");
    }
};

export default connectToDatabase;
