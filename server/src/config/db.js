import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Check for MongoDB URI
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env file");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.error('Please check:');
    console.error('1. MongoDB is running');
    console.error('2. MONGO_URI in .env file is correct');
    console.error('3. Network connectivity');
    process.exit(1);
  }
};

export default connectDB;