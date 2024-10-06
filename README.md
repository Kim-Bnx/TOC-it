# **TOC-it**

A simple plugin to generate a table of contents for a page!

(Demo coming soon!)

Features: 
- Generates a table of contents (TOC) that contains ordered lists of all the page heading elements
- Creates a link anchor to each heading
- Adds an observer that follows the user navigation and highlights TOC links

## Get Started

### Installation

Add the following to your HTML file, before the `</body>` tag:

```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/Kim-Bnx/TOC-it@main/TOCit.js"></script>
```



### Usage

First, you need to plan where your table of contents will be located and create an empty container where it will be generated:

```html
<div id="toc"></div>
```

Then you can initialize the plugin with a new instance, like so:

```javascript
new TOCit()

// With options 
new TOCit({
    selectors: {
        tocSelector: "#toc",
    }
})
```

You can also directly initialize it in your HTML file:

```html
<script>
    new TOCit()
</script>
```


## Options

Here are the default options of the plugin:

```javascript
new TOCit({
    enableHeadingsAnchor: true,
    enableHeadingsObserver: true,
    selectors: {
        contentSelector: "main",
        headersSelector: "h1, h2, h3, h4, h5, h6",
        tocSelector: "#toc",
    },
    observerOptions: {
        root: null,
        rootMargin: "0px", 
        threshold: 0.5,
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
    afterLoad: function (headings) { },
})
```

### Features options

```javascript	
new TOCit({
    enableHeadingsAnchor: true,
    enableHeadingsObserver: true,
})
```

* `enableHeadingsAnchor` *(boolean)*: Enables the generation of an anchor for each heading
* `enableHeadingsObserver` *(boolean)*: Enables the heading observer

### Selectors
```javascript	
new TOCit({
    selectors: {
        contentSelector: "body",
        headersSelector: "h1, h2, h3, h4, h5, h6",
        tocSelector: "#toc",
    },
})
```

* `contentSelector` *(string)* Element where the main content is
* `headersSelector` *(string)* Headings selectors
* `tocSelector` *(string)* Element where the TOC will be generated

### Observers options
```javascript	
new TOCit({
    observerOptions: {
        root: null,
        rootMargin: "0px", 
        threshold: 0,
})
```

If the heading observer is enabled, here are its options based on the Intersection Observer API [(read to the documentation)](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#creating_an_intersection_observer).

* `root` *(Element|null)* Element observed, by default `null` is the browser viewport
* `rootMargin` *(string)* Root margin, can only be in **px** or **em** value
* `threshold` *(number)* Pourcentage of the target's visibily observed, scale 0 -> 1

### Custom classes

```javascript
new TOCit({
    tocClasses: {
        ol: "toc__list",
        li: "toc__list-section",
        a: "toc-link",
        isVisible: "is-visible",
        isActive: "is-active",
        anchor: "heading-anchor",
    },
})
```
TOC's element class name
* `ol` *(string)* List element
* `li` *(string)* Item list element
* `a` *(string)* Link's anchor element
* `isVisible` *(string)* TOC links that are visible in the viewport
* `isActive` *(string)* First link visible in the viewport
* `anchor` *(string)* Heading link anchor

### Generated content

```javascript
new TOCit({
    content: {
        anchorContent: "#",
        linkTo: "Link to section :",
        goTo: "Go to section :",
    },
})
```

* `anchorContent` *(string)* The HTML content of the link anchor generated for each heading
* `linkTo` *(string)* Link's title of the heading anchor
* `goTo` *(string)* Link's title of the TOC anchor
### afterLoad

```javascript
new TOCit({
    afterLoad: function (headings) { },
})
```

* `afterLoad` *(function)* To add new features after the TOC has been generated. The parameter `headings` *(optional)* is an array of the heading elements you can use to improve the TOC.