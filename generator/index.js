const fs = require("fs");
const path = require("path");
const MarkdownIt = require("markdown-it");
const mdmedia = require("markdown-it-html5-media");
const mdprism = require("markdown-it-prism");
const mdtitle = require("markdown-it-title");
const CleanCSS = require("clean-css");
const htmlMinifier = require("html-minifier");

// package globals
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

// program globals
let config = {};

const writeFile = (filepath, data) => {
  if (!fs.existsSync(filepath)) {
    // create missing directories recursively
    const target = filepath.substr(0, filepath.lastIndexOf("/"));
    fs.mkdirSync(target, { "recursive": true });
  }

  fs.writeFileSync(filepath, data);
}

const readFile = (filepath) => {
  return fs.readFileSync(filepath).toString();
}

const getFiles = (filepath) => {
  return fs.readdirSync(filepath).filter(
    x => fs.statSync(path.join(filepath, x)).isFile());
}

const getFilename = (filepath) => {
  return filepath.split('.').slice(0, -1).join('.');
}

const mdToHtml = (markdown) => {
  const md = new MarkdownIt({ "html": true })
    .use(mdmedia.html5Media)
    .use(mdprism, { "defaultLanguage": "txt" });
  return md.render(markdown);
}

const getMdTitle = (markdown) => {
  let result = {};
  const md = new MarkdownIt({ "html": true })
    .use(mdtitle, { "level": 1, "excerpt": 1});

  md.render(markdown, result);
  return result;
}

const getLinks = () => {
  let html = "";
  const links = config.page.links;

  for (let key in links) {
    html += '<li><a href="' + links[key] + '">' + key + '</a></li>';
  }

  return html;
}

const generatePage = (filename) => {
  console.log("Generating page: " + filename);
  let html = readFile(config.input.templates + "page.html");

  // generate markdown
  const markdown = readFile(config.input.md + filename + ".md");

  // replace template strings
  html = html.replaceAll("<!-- $author -->", config.general.author);
  html = html.replaceAll("<!-- $description -->", config.general.description);
  html = html.replaceAll("<!-- $banner -->", config.page.banner);
  html = html.replaceAll("<!-- $about -->", config.page.about);
  html = html.replaceAll("<!-- $links -->", getLinks());
  html = html.replaceAll("<!-- $article -->", mdToHtml(markdown));

  // save result minified
  const result = htmlMinifier.minify(html, htmlMinifyOptions);
  writeFile(config.output.html + filename + ".html", result);
}

const generateAllPages = () => {
  const files = getFiles(config.input.md);

  // generate pages
  for (const file of files) {
    const filename = getFilename(file);
    generatePage(filename);
  }
}

const getFeedItem = (file, title, description) => {
  return "<item><link>https://" + config.rss.host + "/" + file + "</link>"
    + "<title>" + title + "</title>"
    + "<description>" + description + "</description></item>";
}

const shouldSkipFeed = (filename) => {
  for (const file of config.rss.skip) {
    if (filename == file) {
      return true;
    }
  }

  return false;
}

const generateFeed = () => {
  console.log("Generating file: rss feed");

  const files = getFiles(config.input.md);
  let feed = readFile(config.input.templates + "feed.rss");
  let items = "";

  // generate feed
  feed = feed.replaceAll("<!-- $host -->", config.rss.host);
  feed = feed.replaceAll("<!-- $description -->", config.general.description);

  for (const file of files) {
    const filename = getFilename(file);

    if (shouldSkipFeed(filename)) {
      continue;
    }

    const markdown = readFile(config.input.md + filename + ".md");
    const info = getMdTitle(markdown);
    const description = info.excerpt[0]
      .slice(0, config.rss.introsize)
      .trim()
      + "...";
    items += getFeedItem(filename + ".html", info.title, description);
  }

  feed = feed.replaceAll("<!-- $items -->", items);
  writeFile(config.output.rss, feed);
}

const generateCssBundle = () => {
  let files = getFiles(config.input.css);

  // set correct path
  for (let i = 0; i < files.length; i++) {
    files[i] = config.input.css + files[i];
  }

  // generate css bundle
  console.log(`Generating file: css bundle\n${files}`);
  writeFile(config.output.css, cssMinifier.minify(files).styles);
}

const main = () => {
  // load globals
  config = JSON.parse(readFile("./assets/config.json"));

  // generate files
  generateFeed();
  generateAllPages();
  generateCssBundle();
}

main();
