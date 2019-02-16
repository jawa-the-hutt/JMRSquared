import mongoose, { Mongoose } from "mongoose";
var uniqueValidator = require("mongoose-beautiful-unique-validation");
var Schema = mongoose.Schema;

const AdminSchema = new mongoose.Schema({
  userName: {
    type: String,
    uniqueCaseInsensitive: true,
    unique: "Username is already taken."
  },
  fullName: String,
  pass: {
    type: String,
    required: true
  },
  email: {
    type: String,
    index: true,
    unique: "Email is already taken.",
    uniqueCaseInsensitive: true
  },
  role: {
    type: String,
    enum: ["ALL", "WORKER", "CLIENT", "ADMIN"],
    default: "WORKER"
  },
  numbers: {
    type: String,
    index: true,
    unique: "Contact number already exists"
  },
  profilePic: String,
  date: {
    type: Date,
    default: Date.now()
  },
  removed: {
    type: Boolean,
    default: false
  },
  //Relationships
  transactions: [
    {
      type: Schema.Types.ObjectId,
      ref: "Transaction"
    }
  ],
  notifications: [
    {
      type: Schema.Types.ObjectId,
      ref: "Notification"
    }
  ],
  documents: [
    {
      type: Schema.Types.ObjectId,
      ref: "Document"
    }
  ],
  deviceTokens: [
    {
      date: {
        type: Date
      },
      lastActiveDate: {
        type: Date,
        default: new Date()
      },
      token: {
        type: String
      },
      deviceInfo: {
        deviceType: {
          type: String,
          default: null
        },
        screen: {
          width: String,
          height: String,
          scale: String,
          widthPixels: String,
          heightPixels: String
        },
        model: {
          type: String,
          default: null
        },
        manufacturer: {
          type: String,
          default: null
        },
        manufacturer: {
          type: String,
          default: null
        },
        os: {
          type: String,
          default: null
        },
        osVersion: {
          type: String,
          default: null
        },
        sdkVersion: {
          type: String,
          default: null
        },
        language: {
          type: String,
          default: null
        }
      },
      dateRemoved: {
        type: Date,
        default: null
      },
      removed: {
        type: Boolean,
        default: false
      }
    }
  ]
});

AdminSchema.plugin(uniqueValidator);

const Admin = mongoose.model("Admin", AdminSchema);
module.exports = Admin;
