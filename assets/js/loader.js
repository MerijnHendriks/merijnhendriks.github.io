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
    let filename = (file !== window.location.host) ? file.substr(0, file.lastIndexOf('.')) : "";

    // get page
    if (file || filename)
    {
        url = url.replace(file, `assets/md/${filename || file}.md`);
    }
    else
    {
        url += "assets/md/index.md";
    }

    // load page
    fetch(url)
        .then(response => response.text())
        .then((data) => loadMarkdown(data));
}
