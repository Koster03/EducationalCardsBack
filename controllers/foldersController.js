// import { DEFAULT_THEME_ID } from "./defualtIds";

const Router = require("koa-router");
const passport = require("koa-passport");

const Theme = require("../models/Theme");
const cacheMiddleware = require("../lib/redis-middleware");

const router = new Router().prefix("/folders");

// export async function addDefaultFolder(user) {
//   let defualtTheme = await Theme.findOne({ _id: DEFAULT_THEME_ID, user: user });

//   const newFolder = {
//     name: "DEFUALT",
//     cards: [],
//   };

//   defualtTheme.folders.push(newFolder);
//   await defualtTheme.save();
// }

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (ctx) => {
    const user = ctx.state.user._id;
    const theme = await Theme.findOne({ user: user });

    if (!theme) {
      ctx.status = 200;
      ctx.set("x-total-count", String(0));
      ctx.body = [];
      return;
    }

    const folders = theme.folders;
    ctx.set("x-total-count", String(folders.length));
    ctx.body = folders;
  }
);

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (ctx) => {
    console.log(ctx.request.body);
    const { name, themeId } = ctx.request.body;
    const user = ctx.state.user._id;

    let theme = await Theme.findOne({ user: user });

    if (!theme) {
      theme = await new Theme({ name, user: user._id }).save();
      // ctx.status = 404;
      // ctx.body = { error: "Theme not found" };
      // return;
    }

    const newFolder = {
      name: name,
      cards: [],
    };

    if (theme.folders.some((folder) => folder.name === name)) {
      ctx.status = 400;
      ctx.body = { error: "Folder with this name already exists" };
      return;
    }

    theme.folders.push(newFolder);
    const newTheme = await theme.save();

    const folder = newTheme.folders.find((x) => x.name === name);

    ctx.status = 201;
    ctx.body = folder;
  }
);

router.get(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  // cacheMiddleware,
  async (ctx) => {
    const user = ctx.state.user._id;
    const folderId = ctx.params._id;

    const theme = await Theme.findOne({ user: user });

    if (!theme) {
      ctx.status = 404;
      ctx.body = { error: "Theme not found" };
      return;
    }

    const folder = theme.folders.find((f) => f._id == folderId);

    if (!folder) {
      ctx.status = 404;
      ctx.body = { error: "Folder not found" };
      return;
    }

    ctx.status = 200;
    ctx.body = folder;
  }
);

router.put(
  "/:_id/updateResult",
  passport.authenticate("jwt", { session: false }),
  async (ctx) => {
    const { newScore } = ctx.request.body;
    const user = ctx.state.user._id;
    const folderId = ctx.params._id;

    console.log(newScore);

    const theme = await Theme.findOne({ user: user });

    if (!theme) {
      ctx.status = 404;
      ctx.body = { error: "Theme not found" };
      return;
    }

    const folder = theme.folders.find((f) => f._id == folderId);

    if (!folder) {
      ctx.status = 404;
      ctx.body = { error: "Folder not found" };
      return;
    }

    folder.lastResult = `${newScore} / ${folder.cards.length}`;
    await theme.save();

    ctx.body = folder;
  }
);

router.put(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  async (ctx) => {
    const { name, themeId } = ctx.request.body;
    const user = ctx.state.user._id;

    const theme = await Theme.findOne({ _id: themeId, user: user });

    if (!theme) {
      ctx.status = 404;
      ctx.body = { error: "Theme not found" };
      return;
    }

    const folderIndex = theme.folders.findIndex((f) => f._id == ctx.params._id);

    if (folderIndex === -1) {
      ctx.status = 404;
      ctx.body = { error: "Folder not found" };
      return;
    }

    theme.folders[folderIndex].name = name;
    await theme.save();

    ctx.body = theme.folders[folderIndex];
  }
);

router.delete(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  async (ctx) => {
    // const { themeId } = ctx.request.body;
    const user = ctx.state.user._id;

    const theme = await Theme.findOne({ user: user });

    if (!theme) {
      ctx.status = 404;
      ctx.body = { error: "Theme not found" };
      return;
    }

    if (!theme.folders.some((f) => f._id == ctx.params._id)) {
      ctx.status = 404;
      ctx.body = { error: "Folder not found" };
      return;
    }

    theme.folders = theme.folders.filter((f) => f._id != ctx.params._id);
    await theme.save();

    ctx.body = { message: `Folder ${ctx.params._id} has been deleted` };
  }
);

module.exports = router.routes();
