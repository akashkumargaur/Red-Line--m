import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    "name": {
      type: String,
      minlength: [2, "team name should be greater than two letter"],
      maxlength: [12, "team name should be less than 30 character"],
      trim: true,
      required: [true, "Please enter your team name"],
    },
    "warcry": {
      type: String,
      minlength: [2, "warcry should be greater than two letter"],
      trim: true,
      required: [true, "Please enter your warcry "],
    },
    "members": [
          {
            user_id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
              required: true,
            },
            role: {
              type: String,
              enum: ["leader","substitute","Member"],
              default:"Member",
            },
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
      },
    "createdAt": {
      type: Date,
      default: Date.now,
    },
    "match": [
      {
        match: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Match",
        } 
      },
    ],
    "createdBy": {
      type: String,
    },
    "Leader":{
      name:String,
    },
    teamShareToken:String,
  });

  Schema.methods.getTeamShareToken = function(){
    const resetToken= crypto.randomBytes(20).toString('hex');
    this.teamShareToken=crypto.createHash('sha256').update(resetToken).digest("hex");
    return resetToken
  }

export const Team= new mongoose.model("Teams", Schema);