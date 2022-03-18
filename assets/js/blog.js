"use strict";

class CustomRenderer extends marked.Renderer
{
    constructor()
    {
        super();
    }

    blockquote(quote)
    {
        return `<blockquote class="blockquote p-3">${quote}</blockquote>`;
    }

    table(header, body)
    {
        return `<table class="table"><thead">${header}</thead><tbody>${body}</tbody></table>`;
    }

    code(code, lang)
    {
        const selected = (Prism.languages[lang]) ? lang : "plain";
        return `<pre><code class="language-${selected}">${code}</code></pre>`;
    }
}

class Loader
{
    static convertMarkdown(md)
    {
        const options = {
            "breaks": true,
            "gfm": true,
            "renderer": new CustomRenderer(),
            "xhtml": true
        }

        marked.setOptions(options);
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
    
    static loadMarkdown(data, id = "blog-content")
    {
        let item = window.document.getElementById(id);
    
        if (item === undefined)
        {
            return;
        }

        // generate html
        const html = Loader.convertMarkdown(data);
        const result = Loader.sanitizeHtml(html);

        // add to page
        item.innerHTML = result;

        // highlight all code
        Prism.highlightAll();
    }
}

class Request
{
    static async get(url)
    {
        const response = await fetch(url);
        const text = (response.ok) ? await response.text() : "";
        return text;
    }
}

class Router
{
    static async getPage()
    {
        // get url
        const search = window.location.search;
        const url = window.location.href.replace(search, "");

        // get routes
        const routes = JSON.parse(await Request.get(`${url}assets/routes.json`));

        // get post
        const params = new URLSearchParams(search);
        const post = params.has("post") ? params.get("post") : "latest";
        let path = "";

        if (post === "latest")
        {
            // use first entry in routes
            path = routes[0].file;
        }
        else
        {
            // search for entry in routes
            for (const item of routes)
            {
                if (item.route === post)
                {
                    path = item.file;
                }
            }
        }

        // load blog entries
        // todo: program this

        // load post
        const text = await Request.get(`${url}${path}`);
        Loader.loadMarkdown(text);
    }
}