import NoticeModal from "../schema/notice.modal.js";

// Create a new notice
const createNotice = async (req, res) => {
  try {
    // Process attachments from uploaded files
    const attachments = req.files
      ? req.files.map((file) => ({
          filename: file.filename,
          originalName: file.originalname,
          path: `/uploads/${file.filename}`,
          size: file.size,
          mimeType: file.mimetype,
        }))
      : [];

    // Extract form fields
    const {
      noticeTitle,
      noticeType,
      targetDepartments,
      publishDate,
      noticeBody,
      status = "Draft",
    } = req.body;

    // Validate required fields
    if (
      !noticeTitle ||
      !noticeType ||
      !targetDepartments ||
      !publishDate ||
      !noticeBody
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
        required: [
          "noticeTitle",
          "noticeType",
          "targetDepartments",
          "publishDate",
          "noticeBody",
        ],
      });
    }

    // Create new notice
    const newNotice = new NoticeModal({
      noticeTitle,
      noticeType,
      targetDepartments,
      publishDate: new Date(publishDate),
      noticeBody,
      attachments,
      status,
    });

    // Save to database
    const savedNotice = await newNotice.save();

    res.status(201).json({
      success: true,
      message: "Notice created successfully",
      data: savedNotice,
    });
  } catch (error) {
    console.error("Error creating notice:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all notices with pagination and filtering
const getAllNotices = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      noticeType,
      targetDepartments,
      search,
    } = req.query;

    // Build query
    const query = {};

    if (status) query.status = status;
    if (noticeType) query.noticeType = noticeType;
    if (targetDepartments) query.targetDepartments = targetDepartments;
    if (search) {
      query.$or = [
        { noticeTitle: { $regex: search, $options: "i" } },
        { noticeBody: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const notices = await NoticeModal.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await NoticeModal.countDocuments(query);

    res.status(200).json({
      success: true,
      data: notices,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalNotices: total,
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching notices:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get single notice by ID
const getNoticeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Notice ID is required",
      });
    }

    const notice = await NoticeModal.findById(id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    res.status(200).json({
      success: true,
      data: notice,
    });
  } catch (error) {
    console.error("Error fetching notice:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update notice by ID
const updateNotice = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Notice ID is required",
      });
    }

    // Process attachments from uploaded files
    const newAttachments = req.files
      ? req.files.map((file) => ({
          filename: file.filename,
          originalName: file.originalname,
          path: `/uploads/${file.filename}`,
          size: file.size,
          mimeType: file.mimetype,
        }))
      : [];

    // Get existing notice to merge attachments
    const existingNotice = await NoticeModal.findById(id);
    if (!existingNotice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    // Merge existing attachments with new ones
    const updateData = {
      ...req.body,
      attachments: [...(existingNotice.attachments || []), ...newAttachments],
      updatedAt: new Date(),
    };

    // Find and update notice
    const updatedNotice = await NoticeModal.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedNotice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notice updated successfully",
      data: updatedNotice,
    });
  } catch (error) {
    console.error("Error updating notice:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete notice by ID
const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Notice ID is required",
      });
    }

    const deletedNotice = await NoticeModal.findByIdAndDelete(id);

    if (!deletedNotice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notice deleted successfully",
      data: deletedNotice,
    });
  } catch (error) {
    console.error("Error deleting notice:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update notice status (Draft/Published/Unpublished)
const updateNoticeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Notice ID is required",
      });
    }

    if (!["Draft", "Published", "Unpublished"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be Draft, Published, or Unpublished",
      });
    }

    const updatedNotice = await NoticeModal.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedNotice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Notice status updated to ${status}`,
      data: updatedNotice,
    });
  } catch (error) {
    console.error("Error updating notice status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export {
  createNotice,
  updateNotice,
  deleteNotice,
  updateNoticeStatus,
  getAllNotices,
  getNoticeById,
};
