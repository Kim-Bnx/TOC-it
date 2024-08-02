(function (root, factory) {  var pluginName = "TOCit";

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
    enableHeadingsAnchor: true,
    enableHeadingsObserver: true,
    selectors: {
      contentSelector: "body",
      headersSelector: "h1, h2, h3, h4, h5, h6",
      tocSelector: "#toc",
    },
    observerOptions: {
      root: null,
      rootMargin: "0px",
      threshold: 0,
    },
    tocClasses: {
      ol: "toc__list",
      li: "toc__list-section",
      a: "toc-link",
      isVisible: "is-visible",
      isActive: "is-active",
      anchor: "heading-anchor",
    },
    content: {
      anchorContent: "#",
      linkTo: "Link to section :",
      goTo: "Go to section :",
    },
    afterLoad: function (headings) {},
  };

  /**
   * Combine plugin's options
   * @param {Object} defaults Default settings
   * @param {Object} options User options
   */
  var extend = function (target, options) {
    var extended = {};

    var merge = function (obj1, obj2) {
      for (var prop in obj1) {
        if (Object.prototype.hasOwnProperty.call(obj1, prop)) {
          if (typeof obj1[prop] === "object" && obj1[prop] !== null && !Array.isArray(obj1[prop])) {
            extended[prop] = merge(obj1[prop], obj2[prop] || {});
          } else {
            extended[prop] = obj2 && obj2[prop] !== undefined ? obj2[prop] : obj1[prop];
          }
        }
      }
      return extended;
    };

    return merge(target, options);
  };

  /**
   * Starts the plugin
   * @param {Object} options User options
   * @constructor
   */
  function Plugin(options) {
    this.options = extend(defaults, options);
    this.init(); // Initialization Code Here
  }

  /**
   * Create HTML element
   * @typedef {Object} ElementProperties
   * @property {string} type tag element
   * @property {object} attributes element attributes
   * @property {node} parent element parent
   * @property {string} content element text content
   * @returns {node} created element
   */
  function createElement({ type, attributes, parent, content = "" }) {
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
  function slugify(input) {
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
   * Plugin prototype
   * @public
   * @constructor
   */
  Plugin.prototype = {
    init: function () {
      this.TOC_ELEMENT = document.querySelector(this.options.selectors.tocSelector);

      // If no TOC container, abort
      if (!this.TOC_ELEMENT) return;

      this.PAGE = document.querySelector(this.options.selectors.contentSelector);
      this.HEADINGS = this.PAGE.querySelectorAll(this.options.selectors.headersSelector);

      // Set the TOC
      this.generateTocHTML(this.HEADINGS);
      this.setHeadingsAnchor();

      this.TOC_LINKS = this.TOC_ELEMENT ? this.TOC_ELEMENT.querySelectorAll(`.${this.options.tocClasses.link}`) : null;

      // Headings observer if enabled
      if (!this.options.enableHeadingsObserver) return;
      this.headingsObserver();
    },

    /**
     * Set ID and a link anchor to each headings
     */
    setHeadingsAnchor: function () {
      this.HEADINGS.forEach((heading) => {
        const title = getTextElement(heading);
        // Set the id attribute to the heading
        let idContent = slugify(title);
        heading.setAttribute("id", idContent);

        // Create a anchor for the heading if enabled
        if (!this.options.enableHeadingsAnchor) return;

        const anchor = createElement({
          type: "a",
          attributes: {
            href: `#${idContent}`,
            class: `${this.options.tocClasses.anchor}`,
            title: `${this.options.content.linkTo} ${title}`,
            "aria-label": `${this.options.content.linkTo} ${title}`,
          },
          parent: heading,
          content: `${this.options.content.anchorContent}`,
        });
      });
    },

    /**
     * Generate the table of contents based on the headings in the page
     * @param {array} headings list of headings
     */
    generateTocHTML: function (headings) {
      let currentLevel = 1;

      const list = createElement({
        type: "ol",
        attributes: { class: `${this.options.tocClasses.ol}` },
        parent: this.TOC_ELEMENT,
      });

      let lastLi = null;
      let lastList = list;

      this.HEADINGS.forEach((heading) => {
        // Heading level from its tag
        const level = Number(heading.tagName.substr(1));
        // Heading text
        const title = getTextElement(heading);

        // Create the list item
        const li = createElement({
          type: "li",
          attributes: {
            class: `${this.options.tocClasses.li}`,
            "data-level": level,
          },
        });

        // Create the link for the list item
        const a = createElement({
          type: "a",
          attributes: {
            href: "#" + slugify(title),
            class: `${this.options.tocClasses.a}`,
            title: `${this.options.content.goTo} ${title}`,
            "aria-label": `${this.options.content.goTo} ${title}`,
          },
          parent: li,
          content: title,
        });

        // Create a sub list if sub level
        if (level > currentLevel) {
          const newList = createElement({
            type: "ol",
            attributes: { class: `${this.options.tocClasses.ol}` },
            parent: lastLi,
          });

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

      this.options.afterLoad(headings);
    },

    /**
     * Make a reactive TOC with observer API
     */
    headingsObserver: function () {
      // Observer actions
      const handleObserver = (entries) => {
        entries.forEach((entry) => {
          // Select the toc's link of the entry witch matching id
          const link = document.querySelector(`a[href="#${entry.target.id}"]`);

          // Add class when entry is visible in the viewport
          if (entry.isIntersecting) {
            link.classList.add(`${this.options.tocClasses.isVisible}`);
          } else {
            link.classList.remove(`${this.options.tocClasses.isVisible}`);
            link.classList.remove(`${this.options.tocClasses.isActive}`);
          }
        });

        // Set a active class to the first visible link
        const visibleLinks = document.querySelectorAll(`.${this.options.tocClasses.isVisible}`);
        visibleLinks.forEach((link) => link.classList.remove(`${this.options.tocClasses.isActive}`));
        if (visibleLinks.length > 0) {
          visibleLinks[0].classList.add(`${this.options.tocClasses.isActive}`);
        }
      };

      const options = {
        root: this.options.observerOptions.root,
        rootMargin: this.options.observerOptions.rootMargin,
        threshold: this.options.observerOptions.threshold,
      };

      const observer = new IntersectionObserver(handleObserver, options);

      // Observer on each headings
      this.HEADINGS.forEach((heading) => observer.observe(heading));
    },
  };
  return Plugin;
});
