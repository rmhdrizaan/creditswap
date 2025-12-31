import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    credits: {
      type: Number,
      default: 100,
      min: [0, "Credits cannot be negative"],
    },
    bio: { 
      type: String, 
      default: "",
      maxlength: [500, "Bio cannot exceed 500 characters"]
    },
    skills: [{ 
      type: String,
      trim: true 
    }],
    avatar: { 
      type: String, 
      default: "" 
    },
  },
  { 
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        delete ret.password;
        return ret;
      }
    }
  }
);

// Create indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 });

export default mongoose.model("User", userSchema);