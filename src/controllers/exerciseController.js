const Exercise = require("../models/Exercise");

// @desc    Get all exercises
// @route   GET /api/exercises
// @access  Private
const getExercises = async (req, res) => {
  try {
    const { category, muscleGroup } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (muscleGroup) filter.muscleGroup = muscleGroup;

    const exercises = await Exercise.find(filter).sort({ name: 1 });

    res.json({
      success: true,
      count: exercises.length,
      data: exercises,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single exercise
// @route   GET /api/exercises/:id
// @access  Private
const getExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: "Exercise not found",
      });
    }

    res.json({
      success: true,
      data: exercise,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getExercises,
  getExercise,
};
