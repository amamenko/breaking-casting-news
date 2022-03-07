// This fork temporarily patches issue with sending args to puppeteer instance
const nodeHtmlToImage = require("node-html-to-image");
const fs = require("fs");
const { checkFileExists } = require("./utils/checkFileExists");
const { delayExecution } = require("./utils/delayExecution");
const randomColor = require("randomcolor");
require("dotenv").config();

const generateRemakeImage = async (
  movieTitle,
  movieYear,
  character,
  originalActor,
  originalImage,
  newActor,
  newImage,
  index
) => {
  return new Promise(async (resolve, reject) => {
    await delayExecution(index * 15000);

    const remakeImageDirExists = await checkFileExists("./remake_images");

    if (!remakeImageDirExists) {
      fs.mkdirSync("./remake_images");
    }

    const puppeteerArgs = { args: ["--no-sandbox"] };

    const imageOrig = fs.readFileSync(originalImage);
    const base64ImageOrig = new Buffer.from(imageOrig).toString("base64");
    const imageOrigDataURI = "data:image/jpeg;base64," + base64ImageOrig;

    const imageNew = fs.readFileSync(newImage);
    const base64ImageNew = new Buffer.from(imageNew).toString("base64");
    const imageNewDataURI = "data:image/jpeg;base64," + base64ImageNew;

    const backgroundColor = randomColor({ luminosity: "light" });

    await nodeHtmlToImage({
      output: `./remake_images/image_${index}.png`,
      html: `<html>
      <head>
        <style>
        @font-face {
          font-family: Gonzi;
          font-weight: 300;
          src: url("fonts/GonziExpanded-Thin.otf");
        }
        
        @font-face {
          font-family: Gonzi;
          font-weight: 500;
          src: url("fonts/GonziExpanded-Light.otf");
        }
        
        @font-face {
          font-family: Gonzi;
          font-weight: 600;
          src: url("fonts/GonziExpanded-Regular.otf");
        }
        
        @font-face {
          font-family: Gonzi;
          font-weight: 800;
          src: url("fonts/GonziExpanded-Bold.otf");
        }
        
        @font-face {
          font-family: Gonzi;
          font-weight: 900;
          src: url("fonts/GonziExpanded-Black.otf");
        }
        
        body,
        html {
          font-family: Gonzi, sans-serif;
        }
        
        body {
          width: 700px;
          height: 675px;
        }
        
        .main_container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .main_container img {
          min-height: 525px;
          max-height: 525px;
          width: auto;
        }
        
        .movie_title {
          display: flex;
          width: 100%;
          text-align: center;
          align-items: center;
          justify-content: center;
          margin: 1rem 0;
        }
        
        .character_title {
          display: flex;
          background: #000;
          color: #fff;
          width: 100%;
          text-align: center;
          align-items: center;
          justify-content: center;
        }
        
        .images_container {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 1rem;
        }
        
        .original_container,
        .new_container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .original_container h2,
        .new_container h2 {
          margin: 0;
          padding: 0;
          position: absolute;
          top: 18px;
          background: #fff;
          width: 100%;
          text-align: center;
          font-size: 1.3rem;
        }

        .original_container h2:first-child,
        .new_container h2:first-child {
          background: #fff;
          width: 100%;
          top: -5px;
          font-weight: 500;
        }
        </style>
      </head>
      <body>
        <div class="main_container">
            <div>
                <h1 class="movie_title">"${movieTitle}" (${movieYear}) Remake</h1>
            </div>
            <div class="character_title" style="background: ${backgroundColor}; color: #000;">
                <h2>"${character.toUpperCase()}"</h2>
            </div>
            <div class="images_container">
                <div class="original_container">
                    <h2>Originally Played By:</h2>
                    <h2>${originalActor}</h2>
                    <img src=${imageOrigDataURI} alt="Original actor" />
                </div>
                <div class="new_container">
                    <h2>Remake Casting:</h2>
                    <h2>${newActor}</h2>
                    <img src=${imageNewDataURI} alt="New actor" />
                </div>
            </div>
        </div>
      </body>
    </html>`,
      puppeteerArgs,
    })
      .then(() => resolve())
      .catch((e) => reject(e));
  });
};

module.exports = { generateRemakeImage };
