const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    review: {
      type: String,
      required: true,
      minlength: 10,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", ReviewSchema);
