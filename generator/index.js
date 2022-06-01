const fs = require("fs");
const path = require("path");
const { DOMParser } = require("linkedom");
const MarkdownIt = require("markdown-it");
const { html5Media } = require("markdown-it-html5-media");
const prism = require("markdown-it-prism");
const CleanCSS = require("clean-css");
const htmlMinifier = require("html-minifier");

const domParser = new DOMParser();
const md = new MarkdownIt()
  .use(html5Media)
  .use(prism, { "defaultLanguage": "txt" });
const cssMinifier = new CleanCSS();
const htmlMinifyOptions = {
  "collapseInlineTagWhitespace": true,
  "collapseWhitespace": true,
  "conservativeCollapse": true,
  "includeAutoGeneratedTags": false,
  "minifyCSS": true,
  "removeComments": true,
  "removeEmptyAttributes": true,
  "removeEmptyElements": true,
  "removeRedundantAttributes": true
};

function writeFile(filepath, data) {
  if (!fs.existsSync(filepath)) {
    // create missing directories recursively
    const target = filepath.substr(0, filepath.lastIndexOf("/"));
    fs.mkdirSync(target, { "recursive": true });
  }

  fs.writeFileSync(filepath, data);
}

function readFile(filepath) {
  return fs.readFileSync(filepath).toString();
}

function getFiles(filepath) {
  return fs.readdirSync(filepath).filter((item) => {
    return fs.statSync(path.join(filepath, item)).isFile();
  });
}

function getFilename(filepath) {
  return filepath.split('.').slice(0, -1).join('.');
}

function mdToHtml(markdown) {
  return md.render(markdown);
}

function addBlogArticle(document, filename) {
  const element = document.getElementById("blog-content");
  const markdown = readFile(`./md/${filename}.md`);
  element.innerHTML = mdToHtml(markdown);
}

function addBlockquoteStyling(document) {
  const blockquotes = document.querySelectorAll("blockquote");
  for (const element of blockquotes) {
    element.classList.add("blockquote", "blog-blockquote", "px-3");
  }
}

function minifyHtml(html) {
  return htmlMinifier.minify(html, htmlMinifyOptions);
}

function generatePage(filename) {
  const html = readFile("./html/template.html");
  const document = domParser.parseFromString(html);

  addBlogArticle(document, filename);
  addBlockquoteStyling(document);

  // add doctype to prevent quicks mode warning
  const result = `<!DOCTYPE html>${document.documentElement.outerHTML}`;
  return minifyHtml(result);
}

function generateAllPages() {
  const filepath = "./md";
  const files = getFiles(filepath);

  for (const file of files) {
    const filename = getFilename(file);
    console.log(`Generating page: ${filename}`);
    const html = generatePage(filename);
    writeFile(`../${filename}.html`, html);
  }
}

function generateCssBundle() {
  let files = getFiles("./css");

  for (let i = 0; i < files.length; i++) {
    // set correct path
    files[i] = `./css/${files[i]}`;
  }

  console.log("Generating file: css bundle");
  console.log(files);
  const minified = cssMinifier.minify(files);
  writeFile("../assets/css/bundle.css", minified.styles);
}

function main() {
  generateAllPages();
  generateCssBundle();
}

main();
