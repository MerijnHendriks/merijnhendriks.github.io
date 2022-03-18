"use strict";

class CustomRenderer extends marked.Renderer {
  constructor() {
    super();
  }

  blockquote(quote) {
    return `<blockquote class="blockquote p-3">${quote}</blockquote>`;
  }

  table(header, body) {
    return `<table class="table"><thead">${header}</thead><tbody>${body}</tbody></table>`;
  }

  code(code, lang) {
    const selected = (Prism.languages[lang]) ? lang : "plain";
    return `<pre><code class="language-${selected}">${code}</code></pre>`;
  }
}

class Loader {
  static convertMarkdown(md) {
    const options = {
      "breaks": true,
      "gfm": true,
      "renderer": new CustomRenderer(),
      "xhtml": true
    }

    marked.setOptions(options);
    return marked.parse(md);
  }

  static sanitizeHtml(html) {
    const options = {"USE_PROFILES": {"html": true}};
    return DOMPurify.sanitize(html, options);
  }

  static loadBlogPost(md, id = "blog-content") {
    const html = Loader.convertMarkdown(md);
    const result = Loader.sanitizeHtml(html);
    const element = window.document.getElementById(id);
    element.innerHTML = result;
  }

  static loadBlogEntries(url, routes, id = "blog-entries") {
    let html = "";

    for (const page of routes) {
      if (page.visible) {
        html += `<li><a href="${url}?post=${page.path}">${page.name}</a></li>`;
      }
    }

    const result = Loader.sanitizeHtml(html);
    const element = window.document.getElementById(id);
    element.innerHTML = result;
  }
}

class Request {
  static async get(url) {
    const response = await fetch(url);
    return (response.ok) ? await response.text() : "";
  }
}

class Router {
  static async getPostPath(name, routes) {
    if (name === "latest") {
      return routes[0].file;
    }

    for (const page of routes) {
      if (page.path === name) {
        return page.file;
      }
    }

    return "404";
  }

  static async getPage() {
    // get url info
    const search = window.location.search;
    const url = window.location.href.replace(search, "");
    const params = new URLSearchParams(search);

    // get route
    const json = await Request.get(`${url}assets/routes.json`);
    const routes = JSON.parse(json);

    // get page info
    const pageName = params.has("page") ? params.get("page") : "latest";
    const pagePath = Router.getPostPath(pageName, routes);
    const pageMd = await Request.get(`${url}${pagePath}`);

    // load html
    Loader.loadBlogEntries(url, routes);
    Loader.loadBlogPost(pageMd);
    Prism.highlightAll();
  }
}
