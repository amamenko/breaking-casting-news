const express = require("express");
const app = express();
const { createPost } = require("./functions/createPost");
const { getDoppelganger } = require("./functions/getDoppelganger");
const { downloadImage } = require("./functions/downloadImage");
require("dotenv").config();

const port = process.env.PORT || 4000;

createPost();

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
