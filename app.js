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
    headersSelector: "h1, h2, h3",
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
   * Les prototypes du plugin
   * @public
   * @constructor
   */
  Plugin.prototype = {
    init: function () {
      this.PAGE = document.querySelector(this.options.pageSelector);
      this.HEADINGS = this.PAGE.querySelectorAll(this.options.headersSelector);

      this.setHeadingsId();
    },

    setHeadingsId: function () {
      this.HEADINGS.forEach((heading) => {
        let idContent = this.slufify(heading.textContent);

        heading.setAttribute("id", idContent);
      });
    },

    /**
     * https://jasonwatmore.com/vanilla-js-slugify-a-string-in-javascript
     * @param {string} input
     * @returns {string} slugify input
     */
    slufify: function (input) {
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
    },
  };
  return Plugin;
});
