import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true,
  },
  issue: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["open", "in progress", "closed"],
    default: "open",
  },
  userMessage: {
    type: String,
    default: "",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

ticketSchema.pre("validate", async function (next) {
  if (this.user) {
    try {
      const profile = await mongoose.model("Profile").findById(this.user);
      if (profile) {
        this.userName = profile.fullName || profile.name;
        this.mobileNumber = profile.mobileNumber;
      }
    } catch (err) {
      return next(err);
    }
  }
  next();
});

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;
