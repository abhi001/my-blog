const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  upvotes: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) throw new Error("Negative upvotes aren't real.");
    },
  },
  comments: {
    type: Array,
    default: 0,
    validate(value) {
      if (value.length < 0) throw new Error("Negative length aren't real.");
    },
  },
});

const Article = mongoose.model("Food", ArticleSchema);

module.exports = Article;
