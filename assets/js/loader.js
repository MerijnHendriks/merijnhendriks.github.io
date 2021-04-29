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

        marked.use(MarkedRenderer);
        marked.setOptions(MarkedOptions);
    
        const md = Loader.unescapeHTML(data);
        const converted = marked(md);
        const html = DOMPurify.sanitize(converted, PurifyOptions);

        item.innerHTML = html;
    }
}
