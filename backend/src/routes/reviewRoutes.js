const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const authMiddleware = require("../middlewares/authMiddleware");

// DELETE /api/reviews/:id — delete own review (or admin)
router.delete("/:id", authMiddleware, reviewController.deleteReview);

// POST /api/reviews/:id/helpful — toggle like
router.post("/:id/helpful", authMiddleware, reviewController.toggleHelpful);

module.exports = router;
