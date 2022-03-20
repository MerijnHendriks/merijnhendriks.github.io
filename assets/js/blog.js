"use strict";

class CustomRenderer extends marked.Renderer {
  constructor() {
    super();
  }

  blockquote(quote) {
    return `<blockquote class="blockquote px-3">${quote}</blockquote>`;
  }

  table(header, body) {
    return `<table class="table"><thead">${header}</thead><tbody>${body}</tbody></table>`;
  }
}

class Loader {
  static convertMarkdown(md) {
    const options = {
      "breaks": true,
      "gfm": true,
      "renderer": new CustomRenderer()
    };

    marked.setOptions(options);
    return marked.parse(md);
  }

  static loadMarkdown(md, id) {
    const html = Loader.convertMarkdown(md);
    const element = window.document.getElementById(id);
    element.innerHTML = html;
  }

  static loadBlogEntries(url, routes, id = "blog-entries") {
    let html = `<ul>`;

    for (const page of routes) {
      if (page.visible) {
        html += `<li><a href="${url}?page=${page.path}">${page.name}</a></li>`;
      }
    }

    html += "</ul>";

    const element = window.document.getElementById(id);
    element.innerHTML = html;
  }
}

class Request {
  static async get(url) {
    const response = await fetch(url);
    return (response.ok) ? await response.text() : "";
  }
}

class Router {
  static getPagePath(name, routes) {
    if (name === "latest") {
      return routes[0].file;
    }

    for (const page of routes) {
      if (page.path === name) {
        return page.file;
      }
    }

    return Router.getPagePath("404", routes);
  }

  static async getPage() {
    // get url info
    const search = window.location.search;
    const url = window.location.href.replace(search, "");
    const params = new URLSearchParams(search);

    // get route
    const json = await Request.get(`${url}assets/routes.json`);
    const routes = JSON.parse(json);

    // get about markdown
    const aboutPath = Router.getPagePath("about", routes);
    const aboutMd = await Request.get(`${url}${aboutPath}`);

    // get page markdown
    const pageName = params.has("page") ? params.get("page") : "latest";
    const pagePath = Router.getPagePath(pageName, routes);
    const pageMd = await Request.get(`${url}${pagePath}`);

    // load html
    Loader.loadMarkdown(aboutMd, "blog-about");
    Loader.loadMarkdown(pageMd, "blog-article");
    Loader.loadBlogEntries(url, routes);
    
    // code highlighting
    Prism.highlightAll();
  }
}
