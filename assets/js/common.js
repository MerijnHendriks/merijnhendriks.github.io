"use strict";

class CustomRenderer extends marked.Renderer
{
    constructor()
    {
        super();
    }

    blockquote(quote)
    {
        return `<blockquote class="blockquote">${quote}</blockquote>`;
    }

    table(header, body)
    {
        return `<table class="table"><thead">${header}</thead><tbody>${body}</tbody></table>`;
    }

    code(code, language)
    {
        const selected = (Prism.languages[language]) ? language : "plain";
        const highlighted = Prism.highlight(code, Prism.languages[selected], selected);
        return `<pre><code class="highlight language-${language}">${highlighted}</code></pre>`;
    }
}

class Loader
{
    static unescapeText(text)
    {
        const doc = new DOMParser().parseFromString(text, "text/html");
        return doc.documentElement.textContent;
    }

    static convertMarkdown(data)
    {
        const md = data; //LoaderHelper.unescapeText(data);

        marked.setOptions({
            "breaks": true,
            "gfm": true,
            "renderer": new CustomRenderer(),
            "xhtml": true
        });

        return marked(md);
    }

    static sanitizeHtml(html)
    {
        const options = {
            "USE_PROFILES": {
                "html": true
            }
        };

        return DOMPurify.sanitize(html, options);
    }
    
    static loadMarkdown(data, id = "content")
    {
        let item = window.document.getElementById(id);
    
        if (item === undefined)
        {
            return;
        }

        const html = Loader.convertMarkdown(data);
        const result = Loader.sanitizeHtml(html);

        item.innerHTML = result;
    }
}

class Router
{
    routes = {};

    static redirect(file)
    {
        window.location.href = file;
    }

    static request(url, callback)
    {
        fetch(url)
            .catch(() => { Router.redirect("500.html"); })
            .then(response => response.text())
            .then((data) => callback(data));
    }

    static getRoutes(url)
    {
        Router.request(`${url}assets/routes.json`, (data) => { Router.routes = data; });
    }

    static getPage()
    {
        const search = window.location.search;
        const params = new URLSearchParams(search);
        const route = params.has("page") ? params.get("page") : "index";
        const url = window.location.href.replace(search, "");

        // get routes
        Router.getRoutes();

        if (!Router.routes[route])
        {
            Router.redirect("404.html");
            return;
        }

        // get page content
        Router.request(`${url}${routes[route]}`, Loader.loadMarkdown);
    }
}
