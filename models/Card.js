const auditSchema = require('./Audit');

const cardSchema = auditSchema.clone();

cardSchema.add({
  frontSide: {
    type: String,
    required: true,
  },
  backSide: {
    type: String,
    required: true,
  },
});

module.exports = cardSchema;
