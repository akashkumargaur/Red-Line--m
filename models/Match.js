import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    "title": {
      type: String,
      minlength: [2, "title should be greater than two letter"],
      maxlength: [15, "title should be less than 30 character"],
      trim: true,
      required: [true, "Please enter your match title"],
    },
    "description": {
      type: String,
      minlength: [2, "Description should be greater than two letter"],
      trim: true,
      required: [true, "Please enter your match Description "],
    },
    "poster": [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    "noOfTeams": {
      type: Number,
      default:0,
    },
    "views": {
      type: Number,
      default:0,
    },
    "category": {
      type: String,
      enum: ["practice","tournaments","singles"],
      require:true
      },
    "matchTime": {
      type: Date,
      default: null,
    },
    "createdAt": {
      type: Date,
      default: Date.now,
    },
    "createdBy": {
      type: String,
      require:true,
    },
    "teams": [
      {
        team_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Team",
          required: true,
        },
        role: {
          type: String,
          enum: ["leader","substitute","Member"],
          default:"Member",
        },
      },
    ],
  });

export const Match= new mongoose.model("Match", Schema);