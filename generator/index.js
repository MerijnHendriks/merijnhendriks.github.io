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

class HtmlInjector
{
    /** Highlight codeblocks */
    highlightCode(document)
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
    addCodeBackground(document)
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
    addBlockquoteStyling(document)
    {
        const blockquotes = document.querySelectorAll("blockquote");

        for (const element of blockquotes)
        {
            element.classList.add("blockquote", "px-3");
        }
    }

    /** Add bootstrap styling to tables */
    addTableStyling(document)
    {
        const tables = document.querySelectorAll("table");

        for (const element of tables)
        {
            element.classList.add("table", "table-bordered");
        }
    }

    /** Remove the emoji from the footnote refernces */
    removeFootnoteBackrefs(document)
    {
        const backrefs = document.getElementsByClassName("footnote-backref");
        
        while (backrefs.length > 0)
        {
            backrefs[0].parentNode.removeChild(backrefs[0]);
        }
    }
}

class BlogInjector
{
    constructor()
    {
        this.url = "https://merijnhendriks.github.io";
        this.mdConverter = new MdConvert();
    }

    /** Insert the article into the template */
    addBlogArticle(html, page)
    {
        const md = fs.readFileSync(`./pages/${page.file}`).toString();
        const article = this.mdConverter.run(md);
        return html.replace("<!-- __REPLACEME-BLOG-ARTICLE__ -->", article);
    }

    /** Insert the sidebar archive into the template */
    addBlogArchive(html, pages)
    {
        let items = "";

        for (const page of pages)
        {
            const path = (pages[0].name !== page.name) ? page.path : "index.html";

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
    }

    run()
    {
        for (const page of this.pages)
        {
            let html = fs.readFileSync("./templates/base.html").toString();
            html = this.blogInjector.addBlogArticle(html, page);
            html = this.blogInjector.addBlogArchive(html, this.pages);

            const document = DOMHelper.getDocument(html);
            this.htmlInjector.highlightCode(document);
            this.htmlInjector.addCodeBackground(document);
            this.htmlInjector.addBlockquoteStyling(document);
            this.htmlInjector.addTableStyling(document);
            this.htmlInjector.removeFootnoteBackrefs(document);

            const name = (this.pages[0].name !== page.name) ? page.path : "index.html";
            const result = DOMHelper.getHtml(document);
            fs.writeFileSync(`../${name}`, result);
        }
    }
}

// run the code
new HtmlGenerator().run();
