import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    // Ticket Information
    ticket_id: {
      type: String,
      unique: true,
    },
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NG_Student",
      required: true,
    },

    // Ticket Details
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },

    // Categorization
    category: {
      type: String,
      enum: [
        "technical_issue",
        "account_access",
        "course_content",
        "payment_billing",
        "certificate_issue",
        "exam_related",
        "general_inquiry",
        "complaint",
        "suggestion",
        "other",
      ],
      required: true,
      index: true,
    },

    // Priority and Status
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
      index: true,
    },

    status: {
      type: String,
      enum: [
        "open",
        "in_progress",
        "waiting_for_response",
        "resolved",
        "closed",
        "cancelled",
      ],
      default: "open",
      index: true,
    },

    // Assignment
    assigned_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NG_User",
    },
    assigned_at: Date,

    // Timeline
    first_response_at: Date,
    resolved_at: Date,
    closed_at: Date,

    // Communication
    messages: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "NG_User",
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        is_internal: {
          type: Boolean,
          default: false,
        },
        created_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Resolution
    resolution: {
      summary: String,
      solution: String,
      resolved_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NG_User",
      },
    },

    // Metadata
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NG_User",
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NG_User",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Indexes
ticketSchema.index({ ticket_id: 1 });
ticketSchema.index({ student_id: 1, status: 1 });
ticketSchema.index({ category: 1, status: 1 });
ticketSchema.index({ priority: 1, created_at: -1 });

// Pre-save middleware to generate ticket ID
ticketSchema.pre("save", async function (next) {
  if (!this.ticket_id && this.isNew) {
    try {
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, "0");
      const count = await this.constructor.countDocuments({
        created_at: {
          $gte: new Date(year, new Date().getMonth(), 1),
          $lt: new Date(year, new Date().getMonth() + 1, 1),
        },
      });
      this.ticket_id = `TKT${year}${month}${String(count + 1).padStart(
        4,
        "0"
      )}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Method to add message
ticketSchema.methods.addMessage = function (
  authorId,
  content,
  isInternal = false
) {
  this.messages.push({
    author: authorId,
    content: content,
    is_internal: isInternal,
    created_at: new Date(),
  });

  if (!this.first_response_at && !isInternal) {
    this.first_response_at = new Date();
  }

  return this.save();
};

// Method to update status
ticketSchema.methods.updateStatus = function (newStatus, updatedBy) {
  this.status = newStatus;
  this.updated_by = updatedBy;

  if (newStatus === "resolved") {
    this.resolved_at = new Date();
  }

  if (newStatus === "closed") {
    this.closed_at = new Date();
  }

  return this.save();
};

const Ticket =
  mongoose.models.NG_Ticket || mongoose.model("NG_Ticket", ticketSchema);
export default Ticket;
