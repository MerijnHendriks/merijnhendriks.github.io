const converter = new showdown.Converter();

function unescapeHTML(text)
{
    return text.replace( /&amp;/g, "&" )
               .replace( /&lt;/g, "<" )
               .replace( /&gt;/g, ">" )
               .replace( /&quot;/g, "\"")
               .replace( /&#39;/g, "'" );
}

function loadMarkdown(data)
{
    let item = document.querySelector('[data-markdown]');

    if (item !== undefined)
    {
        const md = unescapeHTML(data);
        item.innerHTML = converter.makeHtml(md);
    }
}

function loadPage()
{
    let url = window.location.href;
    let file = url.split('/').pop();

    if (file !== window.location.host)
    {
        // subpage
        url = url.replace(file, `assets/md/${file}.md`);
    }
    else
    {
        // index
        url += "assets/md/index.md";
    }

    // load page
    fetch(url)
            .catch(() => { window.location.href = "404.html"; })
            .then(response => response.text())
            .then((data) => loadMarkdown(data));
}
