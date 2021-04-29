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
    
    static loadMarkdown(element, data)
    {
        let item = document.querySelector(`[${element}]`);
    
        if (!item)
        {
            // element not found
            return;
        }

        const md = Loader.unescapeHTML(data);
        item.innerHTML = converter.makeHtml(md);
    }
    
    static loadPage(url)
    {
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
            .then((data) => Loader.loadMarkdown("data-markdown", data));
    }
}
