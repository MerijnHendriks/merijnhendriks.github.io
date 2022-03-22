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
function addBlogArticle(html, page)
{
    const md = fs.readFileSync(`./pages/${page.file}`).toString();
    const article = mdToHtml(md);
    return html.replace("<!-- __REPLACEME-BLOG-ARTICLE__ -->", article);
}

function getPagePath(pages, page)
{
    return (pages[0].name !== page.name) ? page.path : "index.html";
}

/** Insert the sidebar archive into the template */
function addBlogArchive(html, pages)
{
    let items = "";

    for (const page of pages)
    {
        const path = getPagePath(pages, page);

        if (page.visible)
        {
            items += `<li><a href="${url}/${path}">${page.name}</a></li>`;
        }
    }

    return html.replace("<!-- __REPLACEME-BLOG-ARCHIVE__ -->", items);
}

function main()
{
    const json = fs.readFileSync("./pages/index.json");
    const pages = JSON.parse(json);

    for (const page of pages)
    {
        let html = fs.readFileSync("./templates/base.html").toString();
        html = addBlogArchive(html, pages);
        html = addBlogArticle(html, page);

        const dom = new JSDOM(html);
        const document = dom.window.document;
        highlightCode(document);
        addCodeBackground(document);
        addBlockquoteStyling(document);
        addTableStyling(document);
        removeFootnoteBackrefs(document);

        const path = getPagePath(pages, page);
        const result = document.documentElement.outerHTML;
        fs.writeFileSync(`../${path}`, result);
    }
}

// run the code
main();
