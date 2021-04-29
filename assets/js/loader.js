const converter = new showdown.Converter();

class Loader
{
    static unescapeHTML(text)
    {
        return text.replace( /&amp;/g, "&" )
                   .replace( /&lt;/g, "<" )
                   .replace( /&gt;/g, ">" )
                   .replace( /&quot;/g, "\"")
                   .replace( /&#39;/g, "'" );
    }
    
    static loadMarkdown(data)
    {
        let item = document.querySelector("[data-markdown]");
    
        if (item !== undefined)
        {
            const md = unescapeHTML(data);
            item.innerHTML = converter.makeHtml(md);
        }
    }
    
    static loadPage()
    {
        let url = window.location.href;
        const file = url.split('/').pop();
    
        // get filepath
        if (file !== window.location.host)
        {
            url = url.replace(file, `assets/md/${file}.md`);
        }
        else
        {
            url += "assets/md/index.md";
        }
    
        // load page content
        fetch(url)
            .catch(() => { window.location.href = "404.html"; })
            .then((response) => response.text())
            .then((data) => loadMarkdown(data));
    }
}
