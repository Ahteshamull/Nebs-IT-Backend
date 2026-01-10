import express from "express";
import {
  createNotice,
  getAllNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
  updateNoticeStatus,
} from "../controller/notice.controller.js";
import {
  upload,
  errorCheck,
} from "../../helper/middlewares/imageControlMiddleware.js";

const router = express.Router();

// Create a new notice
// POST: localhost:3000/api/v1/notice/create
router.post(
  "/create",
  upload.array("attachments", 5),
  errorCheck,
  createNotice
);

// Get all notices with filtering and pagination
// GET: localhost:3000/api/v1/notice/all?status=Published&noticeType=General&page=1&limit=10&search=keyword
router.get("/all", getAllNotices);

// Get single notice by ID
// GET: localhost:3000/api/v1/notice/:id
router.get("/:id", getNoticeById);

// Update notice by ID
// PATCH: localhost:3000/api/v1/notice/update/:id
router.patch(
  "/update/:id",
  upload.array("attachments", 5),
  errorCheck,
  updateNotice
);

// Update notice status (publish/unpublish)
// PATCH: localhost:3000/api/v1/notice/status/:id
router.patch("/status/:id", updateNoticeStatus);

// Delete notice by ID
// DELETE: localhost:3000/api/v1/notice/delete/:id
router.delete("/delete/:id", deleteNotice);

export default router;
