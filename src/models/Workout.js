const mongoose = require("mongoose");

const workoutExerciseSchema = new mongoose.Schema({
  exercise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exercise",
    required: true,
  },
  sets: {
    type: Number,
    required: [true, "Please add number of sets"],
    min: 1,
  },
  repetitions: {
    type: Number,
    required: [true, "Please add number of repetitions"],
    min: 1,
  },
  weight: {
    type: Number,
    default: 0,
    min: 0,
  },
  duration: {
    type: Number,
    default: 0,
    min: 0,
  },
  notes: {
    type: String,
    default: "",
  },
});

const workoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Please add a workout name"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    exercises: [workoutExerciseSchema],
    scheduledDate: {
      type: Date,
      required: [true, "Please add a scheduled date"],
    },
    status: {
      type: String,
      enum: ["pending", "completed", "skipped"],
      default: "pending",
    },
    completedDate: {
      type: Date,
    },
    comments: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient querying
workoutSchema.index({ user: 1, scheduledDate: 1 });
workoutSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model("Workout", workoutSchema);
