import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    full_name: { type: String, trim: true }, 

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    login_id: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    // Password
    password: { type: String, select: true },
    password_hash: { type: String, select: true },

    // Employee Info
    employeeId: { type: String, unique: true, sparse: true, trim: true },
    phone: { type: String, trim: true },

    // Professional Info
    role: {
      type: String,
      enum: [
        "admin",
        "super_admin",
        "course_manager",
        "student",
        "hr",
        "employee",
      ],
      default: "employee",
    },
    department: { type: String, default: "Engineering" },
    position: { type: String, default: "Associate" },

    // Employment Details
    joinDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["active", "inactive", "terminated", "on-leave", "pending"],
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
    // assingned courses
    assignedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NG_Courses",
      }
    ],

  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ---------------- Virtuals ---------------- */
userSchema.virtual("fullName").get(function () {
  return this.full_name || `${this.firstName || ""} ${this.lastName || ""}`.trim();
});

userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

/* ---------------- Indexes ---------------- */
userSchema.index({ role: 1, department: 1, status: 1 });

/* ---------------- Pre-save Hooks ---------------- */
userSchema.pre("save", async function (next) {
  try {
    // Only hash if plain text password provided
    if (this.isModified("password") && this.password && !this.password.startsWith("$2b$")) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    // Only hash password_hash if it's plain text (not already a hash)
    if (this.isModified("password_hash") && this.password_hash && !this.password_hash.startsWith("$2b$")) {
      const salt = await bcrypt.genSalt(10);
      this.password_hash = await bcrypt.hash(this.password_hash, salt);
    }

    // Auto-generate employeeId if not present
    if (!this.employeeId && this.isNew && this.role !== "student") {
      const count = await this.constructor.countDocuments({ role: { $ne: "student" } });
      this.employeeId = `EMP${String(count + 1).padStart(4, "0")}`;
    }

    next();
  } catch (err) {
    next(err);
  }
});

/* ---------------- Password Compare ---------------- */
userSchema.methods.comparePassword = async function (candidatePassword) {
  // Check both possible password fields
  const hashedPassword = this.password_hash || this.password;
  if (!hashedPassword) return false;
  return await bcrypt.compare(candidatePassword, hashedPassword);
};

/* ---------------- Permissions ---------------- */
userSchema.methods.getPermissions = function () {
  const rolePermissions = {
    admin: ["manage_system", "view_reports", "manage_employees"],
    super_admin: ["manage_everything"],
    hr: ["manage_employees", "view_reports"],
    manager: ["manage_tasks", "view_reports"],
    course_manager: ["manage_courses", "approve_students"],
    team_lead: ["manage_tasks"],
    employee: [],
    student: [],
  };
  return [...(rolePermissions[this.role] || []), ...(this.permissions || [])];
};

userSchema.methods.hasPermission = function (perm) {
  return this.getPermissions().includes(perm);
};

/* ---------------- Statics ---------------- */
userSchema.statics.findByIdentifier = function (identifier) {
  return this.findOne({
    $or: [{ email: identifier }, { login_id: identifier }],
  });
};

const User = mongoose.models.NG_User || mongoose.model("NG_User", userSchema);

export default User;
