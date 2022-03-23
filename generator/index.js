const fs = require("fs");
const prism = require("prismjs");
const showdown = require("showdown");
const footnotes = require("showdown-ghost-footnotes");
const { JSDOM } = require("jsdom");

const url = "https://merijnhendriks.github.io";

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
    const md = fs.readFileSync(`./pages/${page.file}`).toString();
    element.innerHTML = mdToHtml(md);
}

/** Generate page */
function generatePage(filename, callback, pages, page = null)
{
    const html = fs.readFileSync("./templates/base.html").toString();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    callback(document, pages, page);

    // add doctype to prevent quicks mode warning
    fs.writeFileSync(filename, `<!DOCTYPE html>${document.documentElement.outerHTML}`);
}

/** Generate index.html */
function generateBlogIndex(document, pages, page)
{
    const element = document.getElementById("blog-content");
    let list = "";

    for (const page of pages)
    {
        if (page.visible)
        {
            list += `<li><a href="${url}/${page.path}">${page.name}</a></li>`;
        }
    }

    element.innerHTML = `<h1>Articles</h1><ul>${list}</ul>`;   
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

/** Application logic */
function main()
{
    const json = fs.readFileSync("./pages/index.json");
    const pages = JSON.parse(json);

    generatePage("../index.html", generateBlogIndex, pages);

    for (const page of pages)
    {
        generatePage(`../${page.path}`, generateBlogArticle, pages, page);
    }
}

// run the code
main();
