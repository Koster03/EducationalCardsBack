const mongoose = require('mongoose');
const { Schema } = mongoose;

const auditSchema = new Schema({
  createdDate: {
    type: Date,
    default: Date.now,
  }
}, { discriminatorKey: 'type' }); // discriminatorKey необязателен

module.exports = auditSchema;