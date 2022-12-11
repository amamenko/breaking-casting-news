require("dotenv").config();
const axios = require("axios");

const deployToRender = async () => {
  await axios.get(process.env.RENDER_DEPLOY_HOOK).catch((e) => {
    if (e.response) {
      console.log(e.response.data);
    }
  });
};

module.exports = { deployToRender };
