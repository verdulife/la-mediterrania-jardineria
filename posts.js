import puppeteer from "puppeteer";
import { writeFileSync } from "node:fs";

const URL = "https://www.instagram.com/jardinerialamediterrania";
const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();

await page.goto(URL);
await page.waitForSelector("div[role='tablist']");

const posts = await page.evaluate(() => {
  const maxPosts = 9;
  const images = document.querySelectorAll('main[role="main"] > div > div:last-of-type img[src]');
  return [].slice
    .call(images, 0, maxPosts)
    .map((img) => ({ url: img.src, alt: img.alt }));
});

const viewportSize = 400;

for (let i = 0; i < posts.length; i++) {
  const { alt } = posts[i];
  const filename = `post-${i + 1}.jpg`;

  await page.setViewport({ width: viewportSize, height: viewportSize });

  await page.goto(posts[i].url);
  await page.screenshot({ path: `./public/posts/${filename}`, type: "jpeg" });

  posts[i] = { alt, src: `./posts/${filename}` };

  console.log(`${i + 1}/${posts.length}`);
}

const json = JSON.stringify(posts, null, 2);
writeFileSync("./src/lib/posts.json", json, "utf-8");

await browser.close();