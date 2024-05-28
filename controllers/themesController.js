const Router = require("koa-router");
const passport = require("koa-passport");

const Theme = require("../models/Theme");

const router = new Router().prefix("/themes");

// export async function addNewTheme(name, userId) {
//   return await new Theme({ name, user: userId }).save()
// }

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (ctx) => {
    const { name } = ctx.request.body;
    const { user } = ctx.state;

    ctx.body = await new Theme({ name, user: user._id }).save();
    ctx.status = 201;
  }
);

router.put(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  async (ctx) => {
    const { name } = ctx.request.body;
    const user = ctx.state.user._id;
    const _id = ctx.params._id;

    const updatedTheme = await Theme.findOneAndUpdate(
      { _id, user },
      { $set: { name } },
      { new: true }
    );

    if (!updatedTheme) {
      ctx.status = 404;
      ctx.body = { error: "Theme not found" };
      return;
    }

    ctx.status = 200;
    ctx.body = updatedTheme;
  }
);

router.delete(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  async (ctx) => {
    await Theme.findOneAndDelete({
      _id: ctx.params._id,
      user: ctx.state.user._id,
    });
    ctx.body = { message: "Theme has been deleted" };
  }
);

module.exports = router.routes();
