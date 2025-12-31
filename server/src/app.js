import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import listingRoutes from "./routes/listing.routes.js";
import offerRoutes from "./routes/offer.routes.js"; // <--- Import
import userRoutes from "./routes/user.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/offers", offerRoutes); // <--- Use
app.use("/api/users", userRoutes);
export default app;