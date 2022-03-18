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
  convertMarkdown(md) {
    const options = {
      "breaks": true,
      "gfm": true,
      "renderer": new CustomRenderer(),
      "xhtml": true
    }

    marked.setOptions(options);
    return marked.parse(md);
  }

  sanitizeHtml(html) {
    const options = {"USE_PROFILES": {"html": true}};
    return DOMPurify.sanitize(html, options);
  }

  loadBlogPost(md, id = "blog-content") {
    const html = this.convertMarkdown(md);
    const result = this.sanitizeHtml(html);
    const element = window.document.getElementById(id);
    element.innerHTML = result;
  }

  loadBlogEntries(url, routes, id = "blog-entries") {
    let html = "";

    for (const page of routes) {
      if (page.visible) {
        html += `<li><a href="${url}?post=${page.path}">${page.name}</a></li>`;
      }
    }

    const result = this.sanitizeHtml(html);
    const element = window.document.getElementById(id);
    element.innerHTML = result;
  }
}

class Request {
  async get(url) {
    const response = await fetch(url);
    return (response.ok) ? await response.text() : "";
  }
}

class Router {
  async getPostPath(name, routes) {
    if (name === "latest") {
      // use first entry in routes
      return routes[0].file;
    }

    // search for entry in routes
    for (const page of routes) {
      if (page.path === name) {
        return page.file;
      }
    }

    // post not found
    return "404";
  }

  async getPage() {
    const loader = new Loader();
    const request = new Request();

    // get url info
    const search = window.location.search;
    const url = window.location.href.replace(search, "");
    const params = new URLSearchParams(search);

    // get route
    const json = await request.get(`${url}assets/routes.json`);
    const routes = JSON.parse(json);

    // get page info
    const pageName = params.has("page") ? params.get("page") : "latest";
    const pagePath = this.getPostPath(pageName, routes);
    const pageMd = await request.get(`${url}${pagePath}`);

    // load html
    loader.loadBlogEntries(url, routes);
    loader.loadBlogPost(pageMd);
    Prism.highlightAll();
  }
}
