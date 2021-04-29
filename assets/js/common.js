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
    
    static loadMarkdown(data)
    {
        let item = window.document.getElementById("content");
    
        if (item === undefined)
        {
            // element with id content not found
            return;
        }
    
        const md = Loader.unescapeHTML(data);
        const converted = marked(md);
        const html = DOMPurify.sanitize(converted, { "USE_PROFILES": { "html": true }});

        item.innerHTML = html;
    }
}

class Router
{
    static getPage()
    {
        const search = window.location.search;
        const params = new URLSearchParams(search);
        const page = params.has("page") ? params.get("page") : "index";
        const url = window.location.href.replace(search, `assets/md/${page}.md`);

        fetch(url)
            .catch(() => { window.location.href = "404.html"; })
            .then(response => response.text())
            .then((data) => Loader.loadMarkdown(data));
    }
}
