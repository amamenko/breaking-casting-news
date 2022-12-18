const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { executablePath } = require("puppeteer");
const sample = require("lodash.sample");
require("dotenv").config();

puppeteer.use(StealthPlugin());

const backupGetDoppelganger = async (fileName, fullName) => {
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--single-process",
      "--no-sandbox",
      "--no-zygote",
    ],
    executablePath: executablePath(),
  });
  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);

    await page.goto("http://www.pictriev.com/", {
      timeout: 0,
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

    return randomDoppelganger;
  } catch (e) {
    console.log(e);
    console.log("No doppelganger found using www.pictriev.com!");
    return;
  } finally {
    await browser.close();
  }
};

module.exports = { backupGetDoppelganger };
