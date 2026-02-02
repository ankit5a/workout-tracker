const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Exercise = require("../models/Exercise");
const connectDB = require("../config/database");

dotenv.config();

const exercises = [
  // Chest exercises
  {
    name: "Bench Press",
    description: "Lie on a bench and press a barbell or dumbbells upward",
    category: "strength",
    muscleGroup: "chest",
  },
  {
    name: "Push-ups",
    description:
      "Classic bodyweight exercise for chest, shoulders, and triceps",
    category: "strength",
    muscleGroup: "chest",
  },
  {
    name: "Dumbbell Flyes",
    description: "Lie on bench with dumbbells, lower arms out to sides",
    category: "strength",
    muscleGroup: "chest",
  },

  // Back exercises
  {
    name: "Pull-ups",
    description: "Hang from bar and pull body up until chin is over bar",
    category: "strength",
    muscleGroup: "back",
  },
  {
    name: "Deadlift",
    description: "Lift barbell from ground to hip level",
    category: "strength",
    muscleGroup: "back",
  },
  {
    name: "Barbell Rows",
    description: "Bent over row with barbell",
    category: "strength",
    muscleGroup: "back",
  },
  {
    name: "Lat Pulldown",
    description: "Pull down bar to chest while seated",
    category: "strength",
    muscleGroup: "back",
  },

  // Leg exercises
  {
    name: "Squats",
    description: "Lower body by bending knees and hips",
    category: "strength",
    muscleGroup: "legs",
  },
  {
    name: "Lunges",
    description:
      "Step forward and lower body until both knees bent at 90 degrees",
    category: "strength",
    muscleGroup: "legs",
  },
  {
    name: "Leg Press",
    description: "Push weight away using legs while seated",
    category: "strength",
    muscleGroup: "legs",
  },
  {
    name: "Leg Curls",
    description: "Curl legs to work hamstrings",
    category: "strength",
    muscleGroup: "legs",
  },
  {
    name: "Calf Raises",
    description: "Raise heels off ground to work calf muscles",
    category: "strength",
    muscleGroup: "legs",
  },

  // Shoulder exercises
  {
    name: "Overhead Press",
    description: "Press weight overhead from shoulder height",
    category: "strength",
    muscleGroup: "shoulders",
  },
  {
    name: "Lateral Raises",
    description: "Raise dumbbells to sides until arms parallel to floor",
    category: "strength",
    muscleGroup: "shoulders",
  },
  {
    name: "Front Raises",
    description: "Raise dumbbells in front until arms parallel to floor",
    category: "strength",
    muscleGroup: "shoulders",
  },

  // Arm exercises
  {
    name: "Bicep Curls",
    description: "Curl weight up toward shoulders",
    category: "strength",
    muscleGroup: "arms",
  },
  {
    name: "Tricep Dips",
    description: "Lower and raise body using triceps",
    category: "strength",
    muscleGroup: "arms",
  },
  {
    name: "Hammer Curls",
    description: "Curl dumbbells with neutral grip",
    category: "strength",
    muscleGroup: "arms",
  },
  {
    name: "Tricep Pushdown",
    description: "Push cable down to extend arms",
    category: "strength",
    muscleGroup: "arms",
  },

  // Core exercises
  {
    name: "Planks",
    description: "Hold body in straight line on forearms and toes",
    category: "strength",
    muscleGroup: "core",
  },
  {
    name: "Crunches",
    description: "Lie on back and curl upper body toward knees",
    category: "strength",
    muscleGroup: "core",
  },
  {
    name: "Russian Twists",
    description: "Sit on floor and rotate torso side to side",
    category: "strength",
    muscleGroup: "core",
  },
  {
    name: "Mountain Climbers",
    description: "In plank position, alternate bringing knees to chest",
    category: "strength",
    muscleGroup: "core",
  },

  // Cardio exercises
  {
    name: "Running",
    description: "Outdoor or treadmill running",
    category: "cardio",
    muscleGroup: "cardio",
  },
  {
    name: "Cycling",
    description: "Stationary or outdoor cycling",
    category: "cardio",
    muscleGroup: "cardio",
  },
  {
    name: "Jump Rope",
    description: "Jump over rope continuously",
    category: "cardio",
    muscleGroup: "cardio",
  },
  {
    name: "Burpees",
    description: "Combination of squat, plank, push-up, and jump",
    category: "cardio",
    muscleGroup: "full-body",
  },
  {
    name: "Rowing",
    description: "Rowing machine or water rowing",
    category: "cardio",
    muscleGroup: "full-body",
  },

  // Flexibility exercises
  {
    name: "Yoga Flow",
    description: "Series of yoga poses flowing together",
    category: "flexibility",
    muscleGroup: "full-body",
  },
  {
    name: "Static Stretching",
    description: "Hold stretches for extended periods",
    category: "flexibility",
    muscleGroup: "full-body",
  },
  {
    name: "Dynamic Stretching",
    description: "Active movements that stretch muscles",
    category: "flexibility",
    muscleGroup: "full-body",
  },
];

const seedExercises = async () => {
  try {
    await connectDB();

    // Clear existing exercises
    await Exercise.deleteMany();
    console.log("Cleared existing exercises");

    // Insert new exercises
    await Exercise.insertMany(exercises);
    console.log(`${exercises.length} exercises seeded successfully`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding exercises:", error);
    process.exit(1);
  }
};

seedExercises();
