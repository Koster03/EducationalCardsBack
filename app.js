require("dotenv").config();

const Koa = require("koa");

const cors = require("@koa/cors");
const config = require("./lib/config");
const handlers = require("./handlers");
const controllers = require("./controllers");
const mongooseConfig = require("./lib/mongoose-config");
const redisClient = require("./lib/redis-client");

const app = new Koa();

app.use(
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

handlers.forEach((h) => app.use(h));

app.use(controllers.routes());
app.use(controllers.allowedMethods());

// redisClient.connect().then((data) => {
//   if (redisClient.isReady) {
//     console.log(`Redis cloud connect success`);
//   }
// });

mongooseConfig();

app.listen(config.port, () =>
  console.log(`Server has been started on port ${config.port}`)
);
