import mongoose from "mongoose";
import validator from "validator";

const Schema = new mongoose.Schema({
    "name": {
      type: String,
      minlength: [2, "title should be greater than two letter"],
      maxlength: [12, "title should be less than 30 character"],
      trim: true,
      required: [true, "Please enter your team name"],
    },
    "warcry": {
      type: String,
      minlength: [2, "warcry should be greater than two letter"],
      trim: true,
      required: [true, "Please enter your Description "],
    },
    "lecture": [
      {
        "title": {
          type: String,
          required:true,
        },
        "description": {
          type: String,
          required:true,
        },
        "video": [
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
      },
    ],
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
    "noOfMember": {
      type: Number,
      default:0,
    },
    "game": {
        type: String,
        required:true,
      },
    "createdAt": {
      type: Date,
      default: Date.now,
    },
  });

export const Team= new mongoose.model("Course", Schema);    