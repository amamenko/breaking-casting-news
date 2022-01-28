const express = require("express");
const app = express();
const { createPost } = require("./functions/createPost");
require("dotenv").config();

const port = process.env.PORT || 4000;

createPost();

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
