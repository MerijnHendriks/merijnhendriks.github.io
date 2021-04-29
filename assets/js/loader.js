const converter = new showdown.Converter();

function unescapeHTML(text)
{
    return text.replace(/&amp;/g, "&")
               .replace(/&lt;/g, "<")
               .replace(/&gt;/g, ">")
               .replace(/&quot;/g, "\"")
               .replace(/&#39;/g, "'" );
}

function loadMarkdown(data)
{
    let item = window.document.querySelector("[data-markdown]");

    if (item === undefined)
    {
        // element data-markdown not found
        return;
    }

    const md = unescapeHTML(data);
    item.innerHTML = converter.makeHtml(md);
}

function loadPage()
{
    let url = window.location.href;
    const file = url.split("/").pop();

    console.log(url);
    console.log(file);

    // get filepath
    if (file === "" || file === window.location.hostname)
    {
        url += "assets/md/index.md";
    }
    else
    {
        url = url.replace(file, `assets/md/${file}.md`);
    }

    console.log(url);

    // load page content
    fetch(url)
        .catch(() => { window.location.href = "404.html"; })
        .then(response => response.text())
        .then((data) => loadMarkdown(data));
}
