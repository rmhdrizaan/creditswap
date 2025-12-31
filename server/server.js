import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import connectDB from "./src/config/db.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log("🔍 Checking environment variables...");
    console.log("PORT:", process.env.PORT);
    console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
    console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
    
    await connectDB();
    
    const server = app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║         🚀 Server Running                             ║
╠═══════════════════════════════════════════════════════╣
║  📍 Port: ${PORT}                                    ║
║  🌐 URL: http://localhost:${PORT}                   ║
║  🔗 Frontend: http://localhost:5173                  ║
║  🗄️  Database: Connected                            ║
║  🔐 JWT: ${process.env.JWT_SECRET ? 'Configured' : 'NOT CONFIGURED!'} ║
╚═══════════════════════════════════════════════════════╝
      `);
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err) => {
      console.error("❌ Unhandled Promise Rejection:", err);
      server.close(() => process.exit(1));
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();