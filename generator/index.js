var fs = require("fs");
var path = require("path");
const { JSDOM } = require("jsdom");
var MarkdownIt = require("markdown-it");
var mediaPlugin = require("markdown-it-html5-media");
var prism = require("markdown-it-prism");
var CleanCSS = require("clean-css");
var htmlMinifier = require("html-minifier");

var md = new MarkdownIt({ "html": true })
  .use(mediaPlugin.html5Media)
  .use(prism, { "defaultLanguage": "txt" });
var cssMinifier = new CleanCSS();
var htmlMinifyOptions = {
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

async function writeFile(filepath, data) {
  if (!fs.existsSync(filepath)) {
    // create missing directories recursively
    var target = filepath.substr(0, filepath.lastIndexOf("/"));
    await fs.mkdirSync(target, { "recursive": true });
  }

  await fs.writeFileSync(filepath, data);
}

function readFile(filepath) {
  return fs.readFileSync(filepath).toString();
}

function getFiles(filepath) {
  var files = fs.readdirSync(filepath);
  var i = files.length;

  while (i--) {
    var item = path.join(filepath, files[i]);
    if (!fs.statSync(item).isFile()) {
      files.splice(i, 1);
    }
  }

  return files;
}

function getFilename(filepath) {
  return filepath.split('.').slice(0, -1).join('.');
}

function generatePage(filename) {
  var html = readFile("./html/template.html");
  var dom = new JSDOM(html);
  var document = dom.window.document;

  // generate markdown
  var markdown = readFile("./md/" + filename + ".md");
  var element = document.getElementsByClassName("blog-content")[0];
  element.innerHTML = md.render(markdown);

  // add doctype to prevent quicks mode warning
  var result = "<!DOCTYPE html>" + document.documentElement.outerHTML;
  return htmlMinifier.minify(result, htmlMinifyOptions);
}

async function generateAllPages() {
  var filepath = "./md";
  var files = getFiles(filepath);

  for (var i = 0; i < files.length; i++) {
    var filename = getFilename(files[i]);
    console.log("Generating page: " + filename);
    var html = generatePage(filename);
    await writeFile("../" + filename + ".html", html);
  }
}

async function generateCssBundle() {
  var files = getFiles("./css");

  // set correct path
  for (var i = 0; i < files.length; i++) {
    files[i] = "./css/" + files[i];
  }

  console.log("Generating file: css bundle");
  console.log(files);
  var minified = cssMinifier.minify(files);
  await writeFile("../assets/css/bundle.css", minified.styles);
}

async function main() {
  await generateAllPages();
  await generateCssBundle();
}

main();
