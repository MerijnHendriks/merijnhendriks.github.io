// -- imports

const fs = require("fs");
const path = require("path");
const { DOMParser } = require("linkedom");
const MarkdownIt = require("markdown-it");
const prism = require("markdown-it-prism");
const frontmatter = require("markdown-it-title");
const { html5Media } = require("markdown-it-html5-media");
const htmlMinifier = require("html-minifier");
const CleanCSS = require("clean-css");

// -- globals

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

// -- functions

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

function mdToHtml(markdown, meta) {
  // must be created in the function, otherwise excerpts are empty
  const md = new MarkdownIt()
    .use(prism, { "defaultLanguage": "txt" })
    .use(frontmatter, { "excerpt": 1 })
    .use(html5Media);
  return md.render(markdown, meta);
}

function addBlogArticle(document, filename, meta) {
  const element = document.getElementById("blog-content");
  const markdown = readFile(`./md/${filename}.md`);
  element.innerHTML = mdToHtml(markdown, meta);
}

function addMetadata(document, meta) {
  const description = `${meta.excerpt[0].substr(0, 80)}...`;
  document.title = meta.title;
  document.querySelector('meta[name="description"]')
    .setAttribute("content", description);
}

function addBlockquoteStyling(document) {
  const blockquotes = document.querySelectorAll("blockquote");
  for (const element of blockquotes) {
    element.classList.add("blockquote", "blog-blockquote", "px-3");
  }
}

function addTableStyling(document) {
  const tables = document.querySelectorAll("table");
  for (const element of tables) {
    element.classList.add("table", "table-bordered");
  }
}

function minifyHtml(html) {
  return htmlMinifier.minify(html, htmlMinifyOptions);
}

function generatePage(filename) {
  const html = readFile("./html/template.html");
  const document = new DOMParser().parseFromString(html);
  let meta = {
    title: "",
    excerpt: []
  };

  addBlogArticle(document, filename, meta);
  addMetadata(document, meta)
  addBlockquoteStyling(document);
  addTableStyling(document);

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
  console.log("Generating file: css bundle");

  let files = getFiles("./css");

  // set correct path
  for (let i = 0; i < files.length; i++) {
    files[i] = `./css/${files[i]}`;
  }

  const minified = new CleanCSS().minify(files);
  writeFile(`../assets/css/bundle.css`, minified.styles);
}

function main() {
  generateAllPages();
  generateCssBundle();
}

// -- execute code

main();
