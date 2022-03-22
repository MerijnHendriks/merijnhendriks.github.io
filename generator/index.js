const fs = require("fs");
const prism = require("prismjs");
const showdown = require("showdown");
const footnotes = require("showdown-ghost-footnotes");
const { JSDOM } = require("jsdom");

class DOMHelper
{
    static getDocument(html)
    {
        const dom = new JSDOM(html);
        return dom.window.document;
    }

    static getHtml(document)
    {
        return document.documentElement.outerHTML;
    }
}

class MdConvert
{
    constructor()
    {
        const options = {
            "extensions": [footnotes],
            "strikethrough": true,
            "tables": true,
            "tasklists": true
        };

        this.converter = new showdown.Converter(options);
    }

    run(md)
    {
        return this.converter.makeHtml(md);
    }
}

class CodeHighlighter
{
    highlight(html)
    {
        const document = DOMHelper.getDocument(html);
        const codes = document.querySelectorAll("code");
        
        for (const element of codes)
        {
            // language-* is the first element
            const lang = element.className.split(" ")[0];

            if (!lang)
            {
                // no language defined
                continue;
            }

            // remove language name from class
            element.classList.remove(lang);

            // install language if it doesnt exist
            if (!prism.languages[lang])
            {
                require(`prismjs/components/prism-${lang}.js`);
            }

            // highlight element
            prism.highlightElement(element);
        }

        return DOMHelper.getHtml(document);
    }

    addBackground(html)
    {
        const document = DOMHelper.getDocument(html);
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

        return DOMHelper.getHtml(document);
    }

    run(html)
    {
        html = this.highlight(html);
        html = this.addBackground(html);
        return html;
    }
}

class HtmlInjector
{
    addBlockquoteStyling(html)
    {
        const document = DOMHelper.getDocument(html);
        const blockquotes = document.querySelectorAll("blockquote");

        for (const element of blockquotes)
        {
            element.classList.add("blockquote", "px-3");
        }

        return DOMHelper.getHtml(document);
    }

    addTableStyling(html)
    {
        const document = DOMHelper.getDocument(html);
        const tables = document.querySelectorAll("table");

        for (const element of tables)
        {
            element.classList.add("table", "table-bordered");
        }

        return DOMHelper.getHtml(document);
    }

    removeFootnoteBackrefs(html)
    {
        const document = DOMHelper.getDocument(html);
        const backrefs = document.getElementsByClassName("footnote-backref");
        
        while (backrefs.length > 0)
        {
            backrefs[0].parentNode.removeChild(backrefs[0]);
        }

        return DOMHelper.getHtml(document);
    }
}

class BlogInjector
{
    constructor()
    {
        this.url = "https://merijnhendriks.github.io";
        this.mdConverter = new MdConvert();
    }

    addBlogArticle(html, pages, index)
    {
        const md = fs.readFileSync(`./pages/${pages[index].file}`).toString();
        const article = this.mdConverter.run(md);
        return html.replace("<!-- __REPLACEME-BLOG-ARTICLE__ -->", article);
    }

    addBlogArchive(html, pages)
    {
        let items = "";

        for (let i = 0; i < pages; i++)
        {
            const page = pages[i];
            const path = (i !== 0) ? page.path : "index.html";

            if (page.visible)
            {
                items += `<li><a href="${this.url}/${path}">${page.name}</a></li>`;
            }
        }

        return html.replace("<!-- __REPLACEME-BLOG-ARCHIVE__ -->", items);
    }
}

class HtmlGenerator
{
    constructor()
    {
        const json = fs.readFileSync("./pages/index.json");

        this.pages = JSON.parse(json);
        this.blogInjector = new BlogInjector();
        this.htmlInjector = new HtmlInjector();
        this.codeHighlighter = new CodeHighlighter();
    }

    run()
    {
        for (let i = 0; i < this.pages.length; i++)
        {
            const name = (i !== 0) ? this.pages[i].path : "index.html";
            let html = fs.readFileSync("./templates/base.html").toString();
            
            // inject blog components
            html = this.blogInjector.addBlogArticle(html, this.pages, i);
            html = this.blogInjector.addBlogArchive(html, this.pages);
            
            // inject code highlighting
            html = this.codeHighlighter.run(html);

            // inject element classes
            html = this.htmlInjector.addBlockquoteStyling(html);
            html = this.htmlInjector.addTableStyling(html);
            html = this.htmlInjector.removeFootnoteBackrefs(html);

            fs.writeFileSync(`../${name}`, html);
        }
    }
}

// run the code
new HtmlGenerator().run();
