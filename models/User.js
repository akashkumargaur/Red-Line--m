import mongoose from "mongoose";
import validator from "validator";
import Jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

const Schema = new mongoose.Schema({
  name: {
    type: String,
    minlength: [2, "name should be greater than two letter"],
    maxlength: [15, "name should be less than 15 character"],
    trim: true,
    required: [true, "Please enter your name"],
  },
  email: {
    type: String,
    minlength: [7, "email should be greater than two letter"],
    trim: true,
    required: [true, "Please enter your email "],
    unique: true,
    validate: validator.isEmail,
  },
  password: {
    type: String,
    minlength: [6, "password should be greater than six letter"],
    maxlength: [15, "password should be less than 15 character"],
    required: [true, "Please enter your Password "],
    select: false,
  },
  avatar: [
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
  role: {
    type: String,
    enum: ["Admin", "Staff", "Member", "user"],
    default: "user",
  },
  subscription: {
    id: String,
    status: String,
  },
  points: {
    type: Number,
    default: 0,
  },
  wallet: {
    type: Number,
    default: 0,
  },
  teams: [
    {
      team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
      },
      game: {
        gamename: String,
        memberNum: Number,
      },
      poster: String,
    },
  ],
  match: [
    {
      match: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Match",
      },
    },
  ],
  leader: [
    {
      game: String,
    },
  ],
  createAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: String,
  resetPasswordExpire: String,
});
//save incrypt password
Schema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const hashedPassword = await bcrypt.hash(this.password, 10);
  this.password = hashedPassword;
  next();
});

//cookies 15days
Schema.methods.getJWTToken = function () {
  return Jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
};

Schema.methods.getResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

//campare password
Schema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export const User = new mongoose.model("User", Schema);
