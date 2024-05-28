const mongoose = require("mongoose");
const config = require("./config");

module.exports = () => {
  mongoose
    .connect(config.mongoUri, { useNewUrlParser: true })
    .then(() => console.log("MongoDb has been connected"))
    .catch((e) => console.log(e));
};
