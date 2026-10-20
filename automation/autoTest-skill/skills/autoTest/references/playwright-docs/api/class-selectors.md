# class: Selectors
* since: v1.8

Selectors can be used to install custom selector engines. See [extensibility](../extensibility.md) for more
information.

## async method: Selectors.register
* since: v1.8

Selectors must be registered before creating the page.

**Usage**

An example of registering selector engine that queries elements based on a tag name:

```js
const { selectors, firefox } = require('@playwright/test');  // Or 'chromium' or 'webkit'.

(async () => {
  // Must be a function that evaluates to a selector engine instance.
  const createTagNameEngine = () => ({
    // Returns the first element matching given selector in the root's subtree.
    query(root, selector) {
      return root.querySelector(selector);
    },

    // Returns all elements matching given selector in the root's subtree.
    queryAll(root, selector) {
      return Array.from(root.querySelectorAll(selector));
    }
  });

  // Register the engine. Selectors will be prefixed with "tag=".
  await selectors.register('tag', createTagNameEngine);

  const browser = await firefox.launch();
  const page = await browser.newPage();
  await page.setContent(`<div><button>Click me</button></div>`);

  // Use the selector prefixed with its name.
  const button = page.locator('tag=button');
  // We can combine it with built-in locators.
  await page.locator('tag=div').getByText('Click me').click();
  // Can use it in any methods supporting selectors.
  const buttonCount = await page.locator('tag=button').count();

  await browser.close();
})();
```

### param: Selectors.register.name
* since: v1.8
- `name` <[string]>

Name that is used in selectors as a prefix, e.g. `{name: 'foo'}` enables `foo=myselectorbody` selectors. May only
contain `[a-zA-Z0-9_]` characters.

### param: Selectors.register.script
* since: v1.8
* langs: js
- `script` <[function]|[string]|[Object]>
  - `path` ?<[path]> Path to the JavaScript file. If `path` is a relative path, then it is resolved relative to the
    current working directory. Optional.
  - `content` ?<[string]> Raw script content. Optional.

Script that evaluates to a selector engine instance. The script is evaluated in the page context.

### param: Selectors.register.script
* since: v1.8
* langs: java
- `script` <[string]|[path]>

Script that evaluates to a selector engine instance. The script is evaluated in the page context.

### param: Selectors.register.script
* since: v1.8
* langs: python
- `script` ?<[string]>

Raw script content.

### option: Selectors.register.script
* since: v1.8
* langs: csharp
- `script` <[string]>

Script that evaluates to a selector engine instance. The script is evaluated in the page context.

### option: Selectors.register.path
* since: v1.8
* langs: python
- `path` <[path]>

Path to the JavaScript file. If `path` is a relative path, then it is resolved relative to the current working directory.

### option: Selectors.register.path
* since: v1.8
* langs: csharp
- `path` <[path]>

Script that evaluates to a selector engine instance. The script is evaluated in the page context.

### option: Selectors.register.contentScript
* since: v1.8
- `contentScript` <[boolean]>

Whether to run this selector engine in isolated JavaScript environment. This environment has access to the same DOM, but
not any JavaScript objects from the frame's scripts. Defaults to `false`. Note that running as a content script is not
guaranteed when this engine is used together with other registered engines.

## method: Selectors.setTestIdAttribute
* since: v1.27

Defines custom attribute name to be used in `Page.getByTestId()`. `data-testid` is used by default.

### param: Selectors.setTestIdAttribute.attributeName
* since: v1.27
- `attributeName` <[string]>

Test id attribute name. To match elements with any of several attributes, pass them as a
comma-separated list, e.g. `"data-pw,data-ti"`.
