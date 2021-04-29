"use strict";

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
        const page = params.has("page") ? params.get("page") : "index";
        const url = window.location.href.replace(search, "");

        if (!routes[page])
        {
            Router.redirect("404.html");
            return;
        }

        fetch(`${url}${routes[page]}`)
            .catch(() => { Router.redirect("500.html"); })
            .then(response => response.text())
            .then((data) => Loader.loadMarkdown("content", data));
    }
}