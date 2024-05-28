const Router = require("koa-router");
const auth = require("./authController");
const cards = require("./cardsController");
const themes = require('./themesController');
const folders = require('./foldersController');

const router = new Router().prefix("/api");

router.use(auth, cards, themes, folders);

module.exports = router;
