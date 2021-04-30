"use strict";

class LoaderHelper
{
    static blockquote(quote)
    {
        return `<blockquote class="blockquote">${quote}</blockquote>`;
    }

    static table(header, body)
    {
        return `<table class="table"><thead">${header}</thead><tbody>${body}</tbody></table>`;
    }

    static code(code, language)
    {
        const valid = Prism.languages[language] !== undefined;
        const highlighted = (valid) ? Prism.highlight(code, Prism.languages[language], language) : code
        return `<pre><code class="language-${language}">${highlighted}</code></pre>`;
    }
}

class Loader
{
    static unescapeText(text)
    {
        const doc = new DOMParser().parseFromString(text, "text/html");
        return doc.documentElement.textContent;
    }

    static convertMarkdown(md)
    {
        // setup
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

    static sanitizeHtml()
    {
        // setup
        const options = {
            "USE_PROFILES": {
                "html": true
            }
        };

        // sanitize
        return DOMPurify.sanitize(converted, options);
    }
    
    static loadMarkdown(id, data)
    {
        let item = window.document.getElementById(id);
    
        if (item === undefined)
        {
            return;
        }

        const md = Loader.unescapeText(data);
        const html = Loader.convertMarkdown(md);
        const result = Loader.sanitizeHtml(html);

        item.innerHTML = result;
    }
}
