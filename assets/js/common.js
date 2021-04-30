"use strict";

class LoaderHelper
{
    static unescapeText(text)
    {
        const doc = new DOMParser().parseFromString(text, "text/html");
        return doc.documentElement.textContent;
    }

    static escapeText(text)
    {
        return text.replace(/&/g, "&amp;")
                   .replace(/</g, "&lt;")
                   .replace(/>/g, "&gt;")
                   .replace(/"/g, "&quot;")
                   .replace(/'/g, "&apos;");
    }

    static blockquote(quote)
    {
        return `<blockquote class="blockquote"><p class="mb-0">${quote}</p></blockquote>`;
    }

    static table(header, body)
    {
        return `<table class="table"><thead">${header}</thead><tbody>${body}</tbody></table>`;
    }

    static code(code, language)
    {
        const text = LoaderHelper.escapeText(code);
        const selected = (Prism.languages[language]) ? language : "plain";
        const highlighted = Prism.highlight(text, Prism.languages[selected], selected);

        return `<pre><code class="language-${language}">${highlighted}</code></pre>`;
    }
}

class Loader
{
    static convertMarkdown(data)
    {
        // setup
        const md = LoaderHelper.unescapeText(data);
        let renderer = new marked.Renderer();

        renderer.blockquote = LoaderHelper.blockquote;
        renderer.table = LoaderHelper.table;
        renderer.code = LoaderHelper.code;

        marked.setOptions({
            "breaks": true,
            "renderer": renderer,
            "xhtml": true
        });

        // convert
        return marked(md);
    }

    static sanitizeHtml(html)
    {
        // setup
        const options = {
            "USE_PROFILES": {
                "html": true
            }
        };

        // sanitize
        return DOMPurify.sanitize(html, options);
    }
    
    static loadMarkdown(id, data)
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
    static redirect(file)
    {
        window.location.href = file;
    }

    static getPage()
    {
        const search = window.location.search;
        const params = new URLSearchParams(search);
        const route = params.has("page") ? params.get("page") : "index";
        const url = window.location.href.replace(search, "");

        if (!routes[route])
        {
            Router.redirect("404.html");
            return;
        }

        fetch(`${url}${routes[route]}`)
            .catch(() => { Router.redirect("500.html"); })
            .then(response => response.text())
            .then((data) => Loader.loadMarkdown("content", data));
    }
}
