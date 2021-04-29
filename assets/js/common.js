"use strict";

class MarkedRenderer
{
    static blockquote(quote)
    {
        return `<blockquote class="blockquote">${quote}</blockquote>`;
    }

    static table(header, body)
    {
        return `<table class="table"><thead">${header}</thead><tbody>${body}</tbody></table>`;
    }
}

class MarkedOptions
{
    breaks = true;
    xhtml = true;
}

class PurifyOptions
{
    USE_PROFILES = {
        "html": true
    };
}

class Loader
{
    static unescapeHTML(text)
    {
        const doc = new DOMParser().parseFromString(text, "text/html");
        return doc.documentElement.textContent;
    }
    
    static loadMarkdown(id, data)
    {
        let item = window.document.getElementById(id);
    
        if (item === undefined)
        {
            return;
        }

        marked.use({ MarkedRenderer });
    
        const md = Loader.unescapeHTML(data);
        const converted = marked(md, MarkedOptions);
        const html = DOMPurify.sanitize(converted, PurifyOptions);

        item.innerHTML = html;
    }
}

class Router
{
    static path = "assets/md/";

    static getPage()
    {
        const search = window.location.search;
        const params = new URLSearchParams(search);
        const page = params.has("page") ? params.get("page") : "index";
        const url = window.location.href.replace(search, "");

        fetch(`${url}${Router.path}${page}.md`)
            .catch(() => { window.location.href = "404.html"; })
            .then(response => response.text())
            .then((data) => Loader.loadMarkdown("content", data));
    }
}
