const fs = require("fs");
const path = require("path");
const prism = require("prismjs");
const showdown = require("showdown");
const footnotes = require("showdown-ghost-footnotes");
const { JSDOM } = require("jsdom");
const articles = require("./configs/articles.json");

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
    const md = fs.readFileSync(`./pages/${page}.md`).toString();
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
    const md = fs.readFileSync(`./pages/${page}.md`).toString();
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
    const html = fs.readFileSync("./templates/base.html").toString();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    callback(document, pages, page);

    // add doctype to prevent quicks mode warning
    fs.writeFileSync(file, `<!DOCTYPE html>${document.documentElement.outerHTML}`);
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

/** Application logic */
function main()
{
    // get all files of directory in decending order
    const pages = getFiles("./pages").sort().reverse();

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

// run the code
main();
