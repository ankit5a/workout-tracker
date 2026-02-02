const express = require("express");
const {
  getExercises,
  getExercise,
} = require("../controllers/exerciseController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, getExercises);
router.get("/:id", protect, getExercise);

module.exports = router;
