const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add an exercise name"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    category: {
      type: String,
      required: [true, "Please add a category"],
      enum: ["cardio", "strength", "flexibility", "balance", "sports"],
    },
    muscleGroup: {
      type: String,
      required: [true, "Please add a muscle group"],
      enum: [
        "chest",
        "back",
        "legs",
        "shoulders",
        "arms",
        "core",
        "full-body",
        "cardio",
      ],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Exercise", exerciseSchema);
