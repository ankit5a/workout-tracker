const express = require("express");
const { body } = require("express-validator");
const {
  createWorkout,
  getWorkouts,
  getWorkout,
  updateWorkout,
  deleteWorkout,
  generateReport,
} = require("../controllers/workoutController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

// Report route must be before /:id route
router.get("/reports/progress", protect, generateReport);

router.post(
  "/",
  protect,
  [
    body("name").trim().notEmpty().withMessage("Workout name is required"),
    body("scheduledDate")
      .isISO8601()
      .withMessage("Valid scheduled date is required"),
    body("exercises")
      .isArray({ min: 1 })
      .withMessage("At least one exercise is required"),
    body("exercises.*.exercise")
      .notEmpty()
      .withMessage("Exercise ID is required"),
    body("exercises.*.sets")
      .isInt({ min: 1 })
      .withMessage("Sets must be at least 1"),
    body("exercises.*.repetitions")
      .isInt({ min: 1 })
      .withMessage("Repetitions must be at least 1"),
    validate,
  ],
  createWorkout,
);

router.get("/", protect, getWorkouts);
router.get("/:id", protect, getWorkout);

router.put("/:id", protect, updateWorkout);
router.delete("/:id", protect, deleteWorkout);

module.exports = router;
