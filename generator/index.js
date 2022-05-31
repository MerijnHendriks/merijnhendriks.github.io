/** imports */
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const MarkdownIt = require("markdown-it");
const prism = require("markdown-it-prism");
const htmlMinifier = require("html-minifier");
const CleanCSS = require("clean-css");

/** globals */
const md = new MarkdownIt();
md.use(prism, { "defaultLanguage": "txt" });

/** Create a directory recursively */
function createDir(filepath)
{
    const target = filepath.substr(0, filepath.lastIndexOf("/"));
    fs.mkdirSync(target, { "recursive": true });
}

/** Write file to disk */
function writeFile(filepath, data)
{
    if (!fs.existsSync(filepath))
    {
        createDir(filepath);
    }

    fs.writeFileSync(filepath, data);
}

/** Read file from disk */
function readFile(filepath)
{
    return fs.readFileSync(filepath).toString();
}

/** Get all files in a directory */
function getFiles(filepath)
{
    return fs.readdirSync(filepath).filter((item) => {
        return fs.statSync(path.join(filepath, item)).isFile();
    });
}

/** Get filename without extension */
function getFilename(filepath)
{
    return filepath.split('.').slice(0, -1).join('.');
}

/** Minify html page */
function minifyHtml(html)
{
    return htmlMinifier.minify(html, {
        "collapseInlineTagWhitespace": true,
        "collapseWhitespace": true,
        "conservativeCollapse": true,
        "includeAutoGeneratedTags": false,
        "minifyCSS": true,
        "removeComments": true,
        "removeEmptyAttributes": true,
        "removeEmptyElements": true,
        "removeRedundantAttributes": true
    });
}

/** convert markdown to html */
function mdToHtml(markdown)
{
    return md.render(markdown);
}

/** Add bootstrap styling to blockquotes */
function addBlockquoteStyling(document)
{
    const blockquotes = document.querySelectorAll("blockquote");

    for (const element of blockquotes)
    {
        element.classList.add("blockquote", "blog-blockquote", "px-3");
    }
}

/** Add bootstrap styling to tables */
function addTableStyling(document)
{
    const tables = document.querySelectorAll("table");

    for (const element of tables)
    {
        element.classList.add("table", "table-bordered");
    }
}

/** Insert the article into the template */
function addBlogArticle(document, filename)
{
    const element = document.getElementById("blog-content");
    const md = readFile(`./md/${filename}.md`);
    element.innerHTML = mdToHtml(md);
}

/** Generate page */
function generatePage(filename)
{
    const html = readFile("./html/template.html");
    const dom = new JSDOM(html);
    const document = dom.window.document;

    addBlogArticle(document, filename);
    addBlockquoteStyling(document);
    addTableStyling(document);

    // add doctype to prevent quicks mode warning
    const result = `<!DOCTYPE html>${document.documentElement.outerHTML}`;
    return minifyHtml(result);
}

/** Generate all static pages */
function generateAllPages()
{
    const filepath = "./md";
    const files = getFiles(filepath);

    for (const file of files)
    {
        const filename = getFilename(file);
        console.log(`Generating page: ${filename}`);
        const html = generatePage(filename);
        writeFile(`../${filename}.html`, html);
    }
}

/** Generate css bundle */
function generateCssBundle()
{
    console.log("Generating file: css bundle");

    let files = getFiles("./css");

    // set correct path
    for (let i = 0; i < files.length; i++)
    {
        files[i] = `./css/${files[i]}`;   
    }

    // minify all stylesheets into one bundle
    const minified = new CleanCSS().minify(files);
    writeFile(`../assets/css/bundle.css`, minified.styles);
}

/** Application logic */
function main()
{
    generateAllPages();
    generateCssBundle();
}

// run the code
main();
