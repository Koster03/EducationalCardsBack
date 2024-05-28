module.exports = {
  port: process.env.PORT || 8080,
  mongoUri: process.env.MONGO_URI,
  secret: process.env.SECRET || '43b0f87d-00cb-4f6b-b74f-db09fac76dec'
};
