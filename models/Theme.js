const mongoose = require("mongoose");
const folderSchema = require("./Folder");
const auditSchema = require("./Audit");

const themeSchema = auditSchema.clone();

themeSchema.add({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  folders: [folderSchema],
});

module.exports = mongoose.model("Theme", themeSchema);
