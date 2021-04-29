"use strict";

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
        return text.replace(/&amp;/g, "&")
                   .replace(/&lt;/g, "<")
                   .replace(/&gt;/g, ">")
                   .replace(/&quot;/g, "\"")
                   .replace(/&#39;/g, "'" );
    }
    
    static loadMarkdown(id, data)
    {
        let item = window.document.getElementById(id);
    
        if (item === undefined)
        {
            return;
        }
    
        const md = Loader.unescapeHTML(data);
        const converted = marked(md);
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
