import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
      minlength: [6, "Password must be at least 6 characters"],
    },

    // Employee Info
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"],
    },

    // Professional Info
    role: {
      type: String,
      enum: ["admin", "hr", "manager", "team_lead", "employee", "student"],
      default: "employee",
    },
    department: {
      type: String,
      default: "Engineering",
    },
    position: {
      type: String,
      default: "Associate",
    },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Employment Details
    joinDate: { type: Date, default: Date.now },
    salary: { type: Number, min: 0 },
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "intern"],
      default: "full-time",
    },
    workLocation: {
      type: String,
      enum: ["office", "remote", "hybrid"],
      default: "office",
    },

    // Status
    status: {
      type: String,
      enum: ["active", "inactive", "terminated", "on-leave"],
      default: "active",
    },

    // Permissions
    permissions: [String],

    // Profile Info
    avatar: { type: String, default: null },
    bio: { type: String, maxlength: 500 },
    skills: [String],

    // Leave Balance
    leaveBalance: {
      annual: { type: Number, default: 21 },
      sick: { type: Number, default: 12 },
      personal: { type: Number, default: 5 },
    },

    // Security
    lastLogin: Date,
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtuals
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Indexes
userSchema.index({ role: 1, department: 1, status: 1 });

//  Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

//  Generate Employee ID
userSchema.pre("save", async function (next) {
  if (!this.employeeId && this.isNew && this.role !== "student") {
    try {
      const count = await this.constructor.countDocuments({
        role: { $ne: "student" },
      });
      this.employeeId = `EMP${String(count + 1).padStart(4, "0")}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

//  Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

//  Permissions
userSchema.methods.getPermissions = function () {
  const rolePermissions = {
    admin: ["manage_system", "view_reports", "manage_employees"],
    hr: ["manage_employees", "view_reports"],
    manager: ["manage_tasks", "view_reports"],
    team_lead: ["manage_tasks"],
    employee: [],
  };
  return [...(rolePermissions[this.role] || []), ...(this.permissions || [])];
};

userSchema.methods.hasPermission = function (perm) {
  return this.getPermissions().includes(perm);
};

// Statics
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

const User = mongoose.model("User", userSchema);

export default User;
