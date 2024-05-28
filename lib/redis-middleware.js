const redisClient = require("./redis-client");

async function cacheMiddleware(ctx, next) {
  const key = `${ctx.state.user._id}:${ctx.request.method}:${ctx.request.url}`;
  const cachedData = await redisClient.get(key);

  if (cachedData) {
    ctx.body = JSON.parse(cachedData);
  } else {
    await next();
    if (ctx.status === 200) {
      await redisClient.setEx(key, 3600, JSON.stringify(ctx.body));
    }
  }
}

module.exports = cacheMiddleware;
