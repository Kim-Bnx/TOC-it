(function (root, factory) {
  var pluginName = "toc";

  if (typeof define === "function" && define.amd) {
    define([], factory(pluginName));
  } else if (typeof exports === "object") {
    module.exports = factory(pluginName);
  } else {
    root[pluginName] = factory(pluginName);
  }
})(this, function (pluginName) {
  "use strict";

  var defaults = {
    pageSelector: "main",
    headersSelector: "h1, h2, h3, h4, h5, h6",
    tocElement: "#toc",
  };

  /**
   * Fusionner les options
   * @param {Object} defaults Default settings
   * @param {Object} options User options
   */
  var extend = function (target, options) {
    var prop,
      extended = {};
    for (prop in defaults) {
      if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
        extended[prop] = defaults[prop];
      }
    }
    for (prop in options) {
      if (Object.prototype.hasOwnProperty.call(options, prop)) {
        extended[prop] = options[prop];
      }
    }
    return extended;
  };

  /**
   * L'object du plugin
   * @param {Object} options User options
   * @constructor
   */
  function Plugin(options) {
    this.options = extend(defaults, options);
    this.init(); // Initialization Code Here
  }

  /**
   * Create HTML element
   * @param {string} type tag element
   * @param {object} attributes element attributes
   * @param {node} parent element parent
   * @param {string} content element text content
   * @returns {node} created element
   */
  function createElement(type, attributes, parent, content = "") {
    let el = document.createElement(type);
    for (let key in attributes) {
      el.setAttribute(key, attributes[key]);
    }

    el.innerHTML = content;
    if (parent) {
      parent.appendChild(el);
    }
    return el;
  }

  /**
   * https://jasonwatmore.com/vanilla-js-slugify-a-string-in-javascript
   * @param {string} input
   * @returns {string} slugify input
   */
  function slufify(input) {
    if (!input) return "";

    // make lower case and trim
    var slug = input.toLowerCase().trim();

    // remove accents from charaters
    slug = slug.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // replace invalid chars with spaces
    slug = slug.replace(/[^a-z0-9\s-]/g, " ").trim();

    // replace multiple spaces or hyphens with a single hyphen
    slug = slug.replace(/[\s-]+/g, "-");

    return slug;
  }

  /**
   * Get the text content of an element and ignore its children
   * @param {node} element
   * @returns {string} text content of the element
   */
  function getTextElement(element) {
    const childs = Array.from(element.childNodes);
    const text = childs.find((child) => child.nodeName == "#text");
    return text.nodeValue;
  }

  /**
   * Les prototypes du plugin
   * @public
   * @constructor
   */
  Plugin.prototype = {
    init: function () {
      this.PAGE = document.querySelector(this.options.pageSelector);
      this.HEADINGS = this.PAGE.querySelectorAll(this.options.headersSelector);
      this.TOC_ELEMENT = document.querySelector(this.options.tocElement);

      this.setHeadingsId();
      this.generateTocHTML(this.HEADINGS);
    },

    /**
     * Set ID to headings
     */
    setHeadingsId: function () {
      this.HEADINGS.forEach((heading) => {
        const title = getTextElement(heading);
        // Set the id attribute to the heading
        let idContent = slufify(title);
        heading.setAttribute("id", idContent);

        // Create a anchor for the heading
        const anchor = createElement(
          "a",
          {
            href: `#${idContent}`,
            class: "heading-anchor",
            "aria-label": `Link to the section : ${title}`,
          },
          heading,
          "#"
        );
      });
    },

    /**
     * Generate the table of contents based on the heading in the page
     * @param {array} headings list of headings
     */
    generateTocHTML: function (headings) {
      const list = createElement("ol", { class: "tocList" }, this.TOC_ELEMENT);

      let lastLi = null;
      let lastList = list;
      let currentLevel = 1;

      this.HEADINGS.forEach((heading) => {
        // Heading level from its tag
        const level = Number(heading.tagName.substr(1));
        // Heading text
        const title = getTextElement(heading);

        // Create the list item
        const li = createElement("li", { class: "level-" + level });
        // Create the link for the list item
        const a = createElement("a", { href: "/#" + slufify(title) }, li, title);

        // Create a sub list if sub level
        if (level > currentLevel) {
          const newList = createElement("ol", { class: "sub-tocList" }, lastLi);
          newList.appendChild(li);
          lastList = newList;
        }
        // Continue previous list
        else if (level < currentLevel) {
          let currentList = lastList;

          while (level < currentLevel) {
            currentList = currentList.parentNode.closest("ol");
            currentLevel--;
          }
          currentList.appendChild(li);
          lastList = currentList;
        }
        // If same level, append in the current list
        else {
          lastList.appendChild(li);
        }

        lastLi = li;
        currentLevel = level;
      });
    },
  };
  return Plugin;
});
