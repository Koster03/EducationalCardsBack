const { createClient } = require("redis");

const redisClient = createClient({
  username: "default",
  password: "yYkKNFjsX57j8fSIAh88Dhy2LCz0nW2T",
  socket: {
    host: "34.22.131.48",
    port: 14340,
  },
});

module.exports = redisClient;
