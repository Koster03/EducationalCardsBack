const Router = require("koa-router");
const passport = require("koa-passport");

const Theme = require("../models/Theme");

const router = new Router().prefix("/cards");

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (ctx) => {
    const { frontSide, backSide, folderId } = ctx.request.body;
    const user = ctx.state.user._id;

    // console.log(frontSide, backSide, folderId);
    const theme = await Theme.findOne({ user: user });
    if (!theme) {
      //theme = await addNewTheme("DEFAULT", user);
      ctx.status = 404;
      ctx.body = { error: "Theme not found" };
      return;
    }

    console.log(theme);
    const folder = theme.folders.find((f) => f._id == folderId);

    if (!folder) {
      // await addDefaultFolder(user);
      ctx.status = 404;
      ctx.body = { error: "Folder not found" };
      return;
    }

    const newCard = {
      frontSide,
      backSide,
    };

    folder.cards.push(newCard);

    const newTheme = await theme.save();
    const newFolder = newTheme.folders.find((f) => f._id == folderId);
    ctx.status = 201;
    ctx.body = newFolder.cards.pop();
  }
);

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (ctx) => {
    const { query } = ctx;
    const { skip, limit, folderId, themeId } = query;
    delete query.skip;
    delete query.limit;
    const user = ctx.state.user._id;

    if (!folderId || !themeId) {
      const themes = await Theme.find({ user: user });
      let folders = [];
      themes.forEach((theme) => {
        folders.push(...theme.folders);
      });

      let cards = [];
      folders.forEach((folder) => {
        cards.push(...folder.cards);
      });

      ctx.set("x-total-count", String(cards.length));
      ctx.body = cards;
      return;
    }

    const theme = await Theme.findById(themeId);
    if (!theme) {
      ctx.status = 404;
      ctx.body = { error: "Theme not found" };
      return;
    }

    const folder = theme.folders.id(folderId);
    if (!folder) {
      ctx.status = 404;
      ctx.body = { error: "Folder not found" };
      return;
    }

    folder.cards.sort((a, b) => b.createdDate - a.createdDate);
    const slicedCards = folder.cards.slice(+skip, +skip + +limit);

    ctx.set("x-total-count", String(folder.cards.length));
    ctx.body = slicedCards;
  }
);

router.get(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  async (ctx) => {
    const { folderId, themeId } = ctx.request.body;
    const user = ctx.state.user._id;

    const theme = await Theme.findOne({ _id: themeId, user: user });
    if (!theme) {
      ctx.status = 404;
      ctx.body = { error: "Theme not found" };
      return;
    }

    const folder = theme.folders.id(folderId);
    if (!folder) {
      ctx.status = 404;
      ctx.body = { error: "Folder not found" };
      return;
    }

    const cardIndex = folder.cards.findIndex((f) => f._id == ctx.params._id);

    if (folder.cards[cardIndex]) {
      ctx.body = folder.cards[cardIndex];
    } else {
      ctx.throw(404, "Card has not been found");
    }
  }
);

router.put(
  "/:_folderId/:_cardId/back",
  passport.authenticate("jwt", { session: false }),
  async (ctx) => {
    const { cardBack } = ctx.request.body;
    const user = ctx.state.user._id;

    const theme = await Theme.findOne({ user: user });
    if (!theme) {
      ctx.status = 404;
      ctx.body = { error: "Theme not found" };
      return;
    }

    const folder = theme.folders.find((x) => x._id == ctx.params._folderId);
    if (!folder) {
      ctx.status = 404;
      ctx.body = { error: "Folder not found" };
      return;
    }

    const cardIndex = folder.cards.findIndex(
      (f) => f._id == ctx.params._cardId
    );

    folder.cards[cardIndex]["backSide"] = cardBack;
    await theme.save();

    ctx.status = 200;
    ctx.body = folder.cards[cardIndex];
  }
);

router.put(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  async (ctx) => {
    const { frontSide, backSide, folderId, themeId } = ctx.request.body;
    const user = ctx.state.user._id;
    const _id = ctx.params._id;

    const theme = await Theme.findOne({ _id: themeId, user: user });
    if (!theme) {
      ctx.status = 404;
      ctx.body = { error: "Theme not found" };
      return;
    }

    const folder = theme.folders.id(folderId);
    if (!folder) {
      ctx.status = 404;
      ctx.body = { error: "Folder not found" };
      return;
    }

    const cardIndex = folder.cards.findIndex((f) => f._id == ctx.params._id);
    if (frontSide) {
      folder.cards[cardIndex]["frontSide"] = frontSide;
    }
    if (backSide) {
      folder.cards[cardIndex]["backSide"] = backSide;
    }

    await theme.save();

    ctx.status = 200;
    ctx.body = folder.cards[cardIndex];
  }
);

router.delete(
  "/:_folderId/:_cardId",
  passport.authenticate("jwt", { session: false }),
  async (ctx) => {
    // const { folderId, themeId } = ctx.request.body;
    const user = ctx.state.user._id;

    const theme = await Theme.findOne({ user: user });
    if (!theme) {
      ctx.status = 404;
      ctx.body = { error: "Theme not found" };
      return;
    }

    console.log(theme.folders);

    const folder = theme.folders.find((x) => x._id == ctx.params._folderId);
    if (!folder) {
      ctx.status = 404;
      ctx.body = { error: "Folder not found" };
      return;
    }

    const cardIndex = folder.cards.findIndex(
      (f) => f._id == ctx.params._cardId
    );

    if (cardIndex === -1) {
      ctx.status = 404;
      ctx.body = { error: "Card not found" };
      return;
    }

    folder.cards = folder.cards.filter((f) => f._id != ctx.params._cardId);
    await theme.save();

    ctx.status = 200;
    // ctx.body = folder.cards[cardIndex];
  }
);

module.exports = router.routes();
