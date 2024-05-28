const mongoose = require("mongoose");
const cardSchema = require("./Card");
const auditSchema = require("./Audit");

const folderSchema = auditSchema.clone();

folderSchema.add({
  name: {
    type: String,
    required: true,
  },
  lastResult: {
    type: String,
    required: false,
  },
  cards: [cardSchema],
});

module.exports = folderSchema;
