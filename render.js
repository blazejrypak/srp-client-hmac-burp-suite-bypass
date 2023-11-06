require('dotenv').config();
const puppeteer = require("puppeteer");
const {
  RequestInterceptionManager,
} = require("puppeteer-intercept-and-modify-requests");

async function main() {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 150,
    defaultViewport: null,
    ignoreHTTPSErrors: true,
    args: ["--disable-web-security", `--proxy-server=${process.env.PROXY_SERVER}`],
  });
  const page = await browser.newPage();

  // assuming 'page' is your Puppeteer page object
  const client = await page.target().createCDPSession();
  // note: if you want to intercept requests on ALL tabs, instead use:
  // const client = await browser.target().createCDPSession()

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
  await page.type('input[aria-label="Číslo klienta"]', "58166446");
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

  await page.waitForTimeout(3000);

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
  } catch (e) {
    console.log(e)
  }
}

main();
