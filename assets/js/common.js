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
            // element data-markdown not found
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
        let url = window.location.href;
        const search = window.location.search;
        const params = new URLSearchParams(search);
    
        // get url
        if (!params.has("page"))
        {
            url += "assets/md/index.md";
        }
        else
        {
            url = url.replace(search, `assets/md/${params.get("page")}.md`);
        }
    
        // load page content
        fetch(url)
            .catch(() => { window.location.href = "404.html"; })
            .then(response => response.text())
            .then((data) => Loader.loadMarkdown(data));
    }
}
