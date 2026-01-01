import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env file");
    }

    // CONNECT
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected (LOCAL)");
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Optional listeners
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB runtime error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB disconnected");
    });

  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
