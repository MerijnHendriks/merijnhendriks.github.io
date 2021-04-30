"use strict";

class CustomRenderer extends marked.Renderer
{
    constructor()
    {
        super();
    }

    blockquote(quote)
    {
        return `<blockquote class="blockquote blog-container p-3">${quote}</blockquote>`;
    }

    table(header, body)
    {
        return `<table class="table blog-container"><thead">${header}</thead><tbody>${body}</tbody></table>`;
    }

    code(code, lang)
    {
        const selected = (Prism.languages[lang]) ? lang : "plain";
        let codeClass = `language-${selected}`;
        let preClass = "";
        let preAttr = "";

        // add properties based on language
        switch (selected)
        {
            case "plain":
                break;

            case "diff":
                codeClass += " diff-highlight";
                break;
            
            case "bash":
            case "shell":
                preAttr = `"data-user="user" data-host="localhost"`;
                break;

            default:
                preClass = "line-numbers";
                break;
        }

        // let prism highlight after generation
        return `<div class="blog-container p-3 mb-3"><pre class="mb-0 ${preClass}" ${preAttr}><code class="${codeClass}">${code}</code></pre></div>`;
    }
}

class Loader
{
    static convertMarkdown(data)
    {
        const md = data;

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

        if (!response.ok)
        {
            switch(response.status)
            {
                case 404:
                    Router.redirect("404.html");
                    break;

                default:
                    Router.redirect("500.html");
                    break;
            }

            return "";
        }

        const text = await response.text();
        return text;
    }
}

class Router
{
    static redirect(file)
    {
        window.location.href = file;
    }

    static async getPage()
    {
        const search = window.location.search;
        const params = new URLSearchParams(search);
        const route = params.has("page") ? params.get("page") : "index";
        const url = window.location.href.replace(search, "");
        const routes = JSON.parse(await Request.get(`${url}assets/routes.json`));

        Loader.loadMarkdown(await Request.get(`${url}${routes[route]}`));
    }
}
