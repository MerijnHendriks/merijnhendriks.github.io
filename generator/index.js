const fs = require("fs");
const path = require("path");

/** code highlighting  */
const prism = require("prismjs");

/** md to html */
const showdown = require("showdown");
const footnotes = require("showdown-ghost-footnotes");
const { JSDOM } = require("jsdom");

/** optimizers */
const htmlMinify = require("html-minifier").minify;
const CleanCSS = require("clean-css");

/** configs */
const articles = require("./configs/articles.json");



/** Create a directory recursively */
function createDir(filepath)
{
    fs.mkdirSync(filepath.substr(0, filepath.lastIndexOf("/")), { "recursive": true });
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
    return htmlMinify(html, {
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
function mdToHtml(md)
{
    const converter = new showdown.Converter({
        "extensions": [footnotes],
        "strikethrough": true,
        "tables": true,
        "tasklists": true
    });

    return converter.makeHtml(md);
}

/** Highlight codeblocks */
function highlightCode(document)
{
    const codes = document.querySelectorAll("code");

    for (const element of codes)
    {
        // language name is the first element
        const lang = element.className.split(" ")[0];

        if (!lang)
        {
            // no language defined
            continue;
        }

        if (!prism.languages[lang])
        {
            // install language if it wasnt loaded before
            require(`prismjs/components/prism-${lang}.js`);
        }

        element.classList.remove(lang);
        prism.highlightElement(element);
    }
}

/** Add background to (unformatted) codeblocks */
function addCodeBackground(document)
{
    const codes = document.querySelectorAll("code");

    for (const element of codes)
    {
        // language-* is the first element
        const lang = element.className.split(" ")[0] || "language-txt";

        if (element.parentElement.tagName === "PRE")
        {
            // move language class
            element.parentElement.classList.add(lang);
            element.classList.remove(lang);
        }
    }
}

/** Add bootstrap styling to blockquotes */
function addBlockquoteStyling(document)
{
    const blockquotes = document.querySelectorAll("blockquote");

    for (const element of blockquotes)
    {
        element.classList.add("blockquote", "px-3");
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

/** Remove the emoji from the footnote refernces */
function removeFootnoteBackrefs(document)
{
    const backrefs = document.getElementsByClassName("footnote-backref");
    
    while (backrefs.length > 0)
    {
        backrefs[0].parentNode.removeChild(backrefs[0]);
    }
}

/** Insert the article into the template */
function addBlogArticle(document, page)
{
    const element = document.getElementById("blog-content");
    const md = readFile(`./md/${page}.md`);
    element.innerHTML = mdToHtml(md);
}

/** Generate article */
function generateBlogArticle(document, pages, page) {
    addBlogArticle(document, page);
    highlightCode(document);
    addCodeBackground(document);
    addBlockquoteStyling(document);
    addTableStyling(document);
    removeFootnoteBackrefs(document);
}

/** If the page should be excluded from the article list */
function isExcluded(page)
{
    for (const file of articles.excluded)
    {
        if (page === file)
        {
            return true;
        }
    }

    return false;
}

/** Get date from filename */
function getDate(page)
{
    const year = page.substring(0, 4);
    const month = page.substring(4, 6);
    const day = page.substring(6, 8);
    return `${year}-${month}-${day}`;
}

/** Get title from markdown file */
function getTitle(page)
{
    const md = readFile(`./md/${page}.md`);
    const line = (md.match(/(^.*)/) || [])[1] || "";
    return line.substring(2);
}

/** Generate index.html */
function generateBlogIndex(document, pages)
{
    const element = document.getElementById("blog-content");
    let list = "";

    for (const page of pages)
    {
        if (!isExcluded(page))
        {
            const title = `${getDate(page)}: ${getTitle(page)}`;
            list += `<li><a href="./${page}.html">${title}</a></li>`;
        }
    }

    element.innerHTML = `<h1>Articles</h1><ul>${list}</ul>`;   
}

/** Generate page */
function generatePage(file, callback, pages, page = "")
{
    const html = readFile("./html/template.html");
    const dom = new JSDOM(html);
    const document = dom.window.document;
7
    callback(document, pages, page);

    // add doctype to prevent quicks mode warning
    const result = document.documentElement.outerHTML;
    const minified = `<!DOCTYPE html>${minifyHtml(result)}`;
    writeFile(file, minified);
}

/** Generate all static pages */
function generateAllPages()
{
    const filepath = "./md";
    const pages = getFiles(filepath)

    // sort pages
    pages.sort().reverse();
    pages.sort((a, b) => {
        const fileA = fs.statSync(`${filepath}/${a}`);
        const fileB = fs.statSync(`${filepath}/${b}`);        
        return new Date(fileB.birthtime).getTime() - new Date(fileA.birthtime).getTime();
    });

    // remove file extension
    for (let i = 0; i < pages.length; i++)
    {
        pages[i] = getFilename(pages[i]);
    }

    // generate pages
    for (const page of pages)
    {
        generatePage(`../${page}.html`, generateBlogArticle, pages, page);
    }

    generatePage("../index.html", generateBlogIndex, pages);
}

/** Generate all css files */
function generateCSS()
{
    let files = getFiles("./css");

    // set path
    for (let i = 0; i < files.length; i++)
    {
        files[i] = `./css/${files[i]}`;   
    }

    // minify all into one stylesheet
    const minified = new CleanCSS().minify(files).styles;
    writeFile(`../assets/css/bundle.css`, minified);
}

/** Generate all asset files */
function generateAllAssets()
{
    generateCSS();
}

/** Application logic */
function main()
{
    generateAllPages();
    generateAllAssets();
}

// run the code
main();
