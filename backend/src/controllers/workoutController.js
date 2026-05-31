const Workout = require("../models/Workout");
const Exercise = require("../models/Exercise");

// @desc    Create a new workout
// @route   POST /api/workouts
// @access  Private
const createWorkout = async (req, res) => {
  try {
    const { name, description, exercises, scheduledDate } = req.body;

    // Verify all exercises exist
    const exerciseIds = exercises.map((e) => e.exercise);
    const foundExercises = await Exercise.find({ _id: { $in: exerciseIds } });

    if (foundExercises.length !== exerciseIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more exercises not found",
      });
    }

    const workout = await Workout.create({
      user: req.user.id,
      name,
      description,
      exercises,
      scheduledDate,
    });

    const populatedWorkout = await Workout.findById(workout._id).populate(
      "exercises.exercise",
    );

    res.status(201).json({
      success: true,
      data: populatedWorkout,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all workouts for logged-in user
// @route   GET /api/workouts
// @access  Private
const getWorkouts = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;

    const filter = { user: req.user.id };

    if (status) {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.scheduledDate = {};
      if (startDate) filter.scheduledDate.$gte = new Date(startDate);
      if (endDate) filter.scheduledDate.$lte = new Date(endDate);
    }

    const workouts = await Workout.find(filter)
      .populate("exercises.exercise")
      .sort({ scheduledDate: 1 });

    res.json({
      success: true,
      count: workouts.length,
      data: workouts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single workout
// @route   GET /api/workouts/:id
// @access  Private
const getWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id).populate(
      "exercises.exercise",
    );

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: "Workout not found",
      });
    }

    // Check if workout belongs to user
    if (workout.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this workout",
      });
    }

    res.json({
      success: true,
      data: workout,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update workout
// @route   PUT /api/workouts/:id
// @access  Private
const updateWorkout = async (req, res) => {
  try {
    let workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: "Workout not found",
      });
    }

    // Check if workout belongs to user
    if (workout.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this workout",
      });
    }

    // If exercises are being updated, verify they exist
    if (req.body.exercises) {
      const exerciseIds = req.body.exercises.map((e) => e.exercise);
      const foundExercises = await Exercise.find({ _id: { $in: exerciseIds } });

      if (foundExercises.length !== exerciseIds.length) {
        return res.status(400).json({
          success: false,
          message: "One or more exercises not found",
        });
      }
    }

    // If status is being set to completed, set completedDate
    if (req.body.status === "completed" && workout.status !== "completed") {
      req.body.completedDate = new Date();
    }

    workout = await Workout.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("exercises.exercise");

    res.json({
      success: true,
      data: workout,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
// @access  Private
const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: "Workout not found",
      });
    }

    // Check if workout belongs to user
    if (workout.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this workout",
      });
    }

    await workout.deleteOne();

    res.json({
      success: true,
      message: "Workout deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Generate workout report
// @route   GET /api/workouts/reports/progress
// @access  Private
const generateReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {
      user: req.user.id,
      status: "completed",
    };

    if (startDate || endDate) {
      filter.completedDate = {};
      if (startDate) filter.completedDate.$gte = new Date(startDate);
      if (endDate) filter.completedDate.$lte = new Date(endDate);
    }

    const workouts = await Workout.find(filter)
      .populate("exercises.exercise")
      .sort({ completedDate: -1 });

    // Calculate statistics
    const totalWorkouts = workouts.length;
    const totalExercises = workouts.reduce(
      (sum, w) => sum + w.exercises.length,
      0,
    );

    // Group by muscle group
    const muscleGroupStats = {};
    const exerciseFrequency = {};

    workouts.forEach((workout) => {
      workout.exercises.forEach((ex) => {
        const muscleGroup = ex.exercise.muscleGroup;
        const exerciseName = ex.exercise.name;

        if (!muscleGroupStats[muscleGroup]) {
          muscleGroupStats[muscleGroup] = 0;
        }
        muscleGroupStats[muscleGroup]++;

        if (!exerciseFrequency[exerciseName]) {
          exerciseFrequency[exerciseName] = 0;
        }
        exerciseFrequency[exerciseName]++;
      });
    });

    // Calculate workout streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sortedWorkouts = workouts.sort(
      (a, b) => b.completedDate - a.completedDate,
    );
    let lastDate = null;

    for (const workout of sortedWorkouts) {
      const workoutDate = new Date(workout.completedDate);
      workoutDate.setHours(0, 0, 0, 0);

      if (!lastDate) {
        const daysDiff = Math.floor(
          (today - workoutDate) / (1000 * 60 * 60 * 24),
        );
        if (daysDiff === 0 || daysDiff === 1) {
          currentStreak = 1;
          tempStreak = 1;
        }
        lastDate = workoutDate;
      } else {
        const daysDiff = Math.floor(
          (lastDate - workoutDate) / (1000 * 60 * 60 * 24),
        );
        if (daysDiff === 1) {
          tempStreak++;
          if (currentStreak > 0) currentStreak++;
        } else {
          tempStreak = 1;
        }
        lastDate = workoutDate;
      }

      longestStreak = Math.max(longestStreak, tempStreak);
    }

    res.json({
      success: true,
      data: {
        summary: {
          totalWorkouts,
          totalExercises,
          averageExercisesPerWorkout:
            totalWorkouts > 0 ? (totalExercises / totalWorkouts).toFixed(2) : 0,
          currentStreak,
          longestStreak,
        },
        muscleGroupDistribution: muscleGroupStats,
        topExercises: Object.entries(exerciseFrequency)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([name, count]) => ({ name, count })),
        recentWorkouts: workouts.slice(0, 5).map((w) => ({
          id: w._id,
          name: w.name,
          completedDate: w.completedDate,
          exerciseCount: w.exercises.length,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createWorkout,
  getWorkouts,
  getWorkout,
  updateWorkout,
  deleteWorkout,
  generateReport,
};
