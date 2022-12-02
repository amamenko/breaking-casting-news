const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const sample = require("lodash.sample");
require("dotenv").config();

puppeteer.use(StealthPlugin());

const backupGetDoppelganger = async (fileName, fullName) => {
  try {
    const browser = await puppeteer.launch({
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : undefined,
      args: [
        "--disable-setuid-sandbox",
        "--single-process",
        "--no-sandbox",
        "--no-zygote",
      ],
    });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);

    await page.goto("http://www.pictriev.com/", {
      waitUntil: "networkidle2",
    });

    await page.waitForTimeout(5000);

    await page.click("button[id=upload-file]");

    const uploadEl = await page.$("input[type=file]");
    await uploadEl.uploadFile(fileName);

    await page.waitForTimeout(35000);

    const resultsList = await page.$$("ul[class=simfaces] > li");

    let fullArr = [];

    for (const result of resultsList) {
      const img = await result.$eval("img", (i) => i.getAttribute("src"));
      const name = await result.$eval("a", (a) => a.textContent);

      fullArr.push({
        name,
        image: `http://www.pictriev.com/${img}`,
      });
    }

    fullArr = fullArr.filter((item) => item.name !== fullName);
    // Choose from top 3 closest matches
    fullArr = fullArr.slice(0, 3);
    const randomDoppelganger = sample(fullArr);

    await browser.close();

    return randomDoppelganger;
  } catch (e) {
    console.log(e);
    console.log("No doppelganger found using www.pictriev.com!");
    return;
  }
};

module.exports = { backupGetDoppelganger };
