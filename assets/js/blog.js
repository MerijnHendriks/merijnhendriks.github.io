"use strict";

class Loader {
  constructor() {
    const options = {"extensions": ["footnotes"]};
    this.mdparser = new showdown.Converter(options);
    this.mdparser.setOption("noHeaderId", true);
    this.mdparser.setOption("strikethrough", true);
    this.mdparser.setOption("tables", true);
    this.mdparser.setOption("tasklists", true);
  }

  injectStyling() {
    // block quotes styling
    const blockquotes = document.querySelectorAll("blockquote");

    for (const element of blockquotes) {
      element.classList.add("blockquote", "px-3");
    }

    // tables styling
    const tables = document.querySelectorAll("table");

    for (const element of tables) {
      element.classList.add("table", "table-bordered");
    }

    // codeblock styling
    const pres = document.querySelectorAll("pre");
    const codes = document.querySelectorAll("code");

    for (const element of pres) {
      if (element.classList.length == 0) {
        element.classList.add("language-text");
      }
    }

    for (const element of codes) {
      if (element.classList.length == 0) {
        element.classList.add("language-text");
      }
    }
  }

  loadMarkdown(md, id) {
    const html = this.mdparser.makeHtml(md);
    const element = window.document.getElementById(id);
    element.innerHTML = html;
  }

  loadBlogEntries(url, routes, id = "blog-entries") {
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
  async get(url) {
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
    const loader = new Loader();
    const request = new Request();

    // get url info
    const search = window.location.search;
    const url = window.location.href.replace(search, "");
    const params = new URLSearchParams(search);

    // get route
    const json = await request.get(`${url}assets/routes.json`);
    const routes = JSON.parse(json);

    // get about markdown
    const aboutPath = Router.getPagePath("about", routes);
    const aboutMd = await request.get(`${url}${aboutPath}`);

    // get page markdown
    const pageName = params.has("page") ? params.get("page") : "latest";
    const pagePath = Router.getPagePath(pageName, routes);
    const pageMd = await request.get(`${url}${pagePath}`);

    // load html
    loader.loadMarkdown(aboutMd, "blog-about");
    loader.loadMarkdown(pageMd, "blog-article");
    loader.loadBlogEntries(url, routes);

    // inject missing html styling after markdown generation
    loader.injectStyling();
    
    // code highlighting
    Prism.highlightAll();
  }
}
