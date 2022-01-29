const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const axios = require("axios");
const sample = require("lodash.sample");
const { downloadFile } = require("./utils/downloadFile");
const { delayExecution } = require("./utils/delayExecution");
const { exec } = require("child_process");
require("dotenv").config();

puppeteer.use(StealthPlugin());

const getDoppelganger = async (fileName, fullName, i) => {
  return new Promise(async (resolve, reject) => {
    // Kill all leftover Puppeteer processes
    exec("pkill -9 -f puppeteer");

    await delayExecution(i * 60000);

    const browser = await puppeteer.launch({
      args: [
        "--disable-setuid-sandbox",
        "--single-process",
        "--no-sandbox",
        "--no-zygote",
      ],
    });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);

    page.on("error", (err) => {
      reject();
    });

    await page.goto("https://starbyface.com", {
      waitUntil: "networkidle2",
    });

    await page.waitForTimeout(5000);

    await page.click("button[mode=primary]");

    const uploadEl = await page.$("input[type=file]");
    await uploadEl.uploadFile(fileName);
    await page.waitForTimeout(30000);

    const maleList = await page.$$("div[id=candidates] > div[name]");
    const femaleList = await page.$$("div[id=candidatesFemale] > div[name]");

    const getNameAndImage = async (list) => {
      const fullListArr = [];

      for (const target of list) {
        const innerHTML = await page.evaluate((el) => el.innerHTML, target);
        const name = await page.evaluate(
          (el) => el.getAttribute("name"),
          target
        );

        let splitInnerHTML = innerHTML.split("\n");
        splitInnerHTML = splitInnerHTML.filter((item) =>
          item.includes("<img ")
        );

        const imgTag = splitInnerHTML[0];

        if (imgTag) {
          let imgSplit = imgTag.split(/src="(.*?)"/gim);
          imgSplit = imgSplit.filter((item) => item.includes(".com"));

          if (imgSplit[0]) {
            fullListArr.push({
              name,
              image: imgSplit[0],
            });
          }
        }
      }

      return fullListArr;
    };

    const matchedMales = await getNameAndImage(maleList);
    const matchedFemales = await getNameAndImage(femaleList);

    const firstName = fullName.split(" ")[0];
    const genderOfFirstName = await axios(
      `https://api.genderize.io/?name=${firstName}`
    )
      .then((res) => res.data)
      .then((data) => data.gender);

    let chosenArr = [];

    if (genderOfFirstName === "male") {
      if (matchedMales[0]) {
        chosenArr = matchedMales;
      } else {
        chosenArr = matchedFemales;
      }
    } else if (genderOfFirstName === "female") {
      if (matchedFemales[0]) {
        chosenArr = matchedFemales;
      } else {
        chosenArr = matchedMales;
      }
    } else {
      const genderArr = ["male", "female"];
      const randomGender = sample(genderArr);

      if (randomGender === "male") {
        if (matchedMales[0]) {
          chosenArr = matchedMales;
        } else {
          chosenArr = matchedFemales;
        }
      } else {
        if (matchedFemales[0]) {
          chosenArr = matchedFemales;
        } else {
          chosenArr = matchedMales;
        }
      }
    }

    chosenArr = chosenArr.filter((item) => item.name !== fullName);
    const randomDoppelganger = sample(chosenArr);

    await browser.close();

    if (randomDoppelganger) {
      return await downloadFile(
        randomDoppelganger.image,
        "doppelganger_images",
        randomDoppelganger.name.replace(/\s/g, "_")
      )
        .then(() => resolve())
        .catch((e) => {
          console.error(e);
          reject();
        });
    } else {
      console.log(`No doppelganger found for actor ${fullName}.`);
      reject();
    }
  });
};

module.exports = { getDoppelganger };
