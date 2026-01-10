import mongoose from "mongoose";

const noticeModalSchema = new mongoose.Schema(
  {
    // Notice Title field
    noticeTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    // Notice Type dropdown
    noticeType: {
      type: String,
      required: true,
      enum: [
        "General / Company-Wide",
        "Holiday & Event",
        "HR & Policy Update",
        "Finance & Payroll",
        "Warning / Disciplinary",
        "Emergency / Urgent",
        "IT / System Maintenance",
        "Department / Team",
      ],
    },

    // Target Department/Individual dropdown
    targetDepartments: {
      type: String,
      required: true,
      enum: [
        "All Department",
        "Finance",
        "Sales Team",
        "HR",
        "Web Team",
        "Database Team",
        "Marketing",
        "Operations",
        "Individual",
      ],
    },

    // Publish Date
    publishDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    // Notice Body
    noticeBody: {
      type: String,
      required: true,
      trim: true,
    },

    // Attachments (array of file paths or objects)
    attachments: [
      {
        filename: {
          type: String,
          required: true,
        },
        originalName: {
          type: String,
          required: true,
        },
        path: {
          type: String,
          required: true,
        },
        size: {
          type: Number,
          required: true,
        },
        mimeType: {
          type: String,
          required: true,
        },
      },
    ],

    // Metadata fields
    status: {
      type: String,
      enum: ["Draft", "Published", "Unpublished"],
      default: "Draft",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better performance
noticeModalSchema.index({ noticeTitle: 1 });
noticeModalSchema.index({ noticeType: 1 });
noticeModalSchema.index({ targetDepartments: 1 });
noticeModalSchema.index({ publishDate: -1 });
noticeModalSchema.index({ status: 1 });

export default mongoose.model("NoticeModal", noticeModalSchema);
