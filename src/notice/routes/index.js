import express from "express";

import notice from "./notice.routes.js";

const router = express.Router();

// localhost:3000/api/v1/notice/
router.use("/notice", notice);

export default router;
