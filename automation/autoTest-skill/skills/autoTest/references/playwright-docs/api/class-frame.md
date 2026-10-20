# class: Frame
* since: v1.8

At every point of time, page exposes its current frame tree via the `Page.mainFrame()` and
`Frame.childFrames()` methods.

[Frame] object's lifecycle is controlled by three events, dispatched on the page object:
* `Page.frameAttached` - fired when the frame gets attached to the page. A Frame can be attached to the page
  only once.
* `Page.frameNavigated` - fired when the frame commits navigation to a different URL.
* `Page.frameDetached` - fired when the frame gets detached from the page.  A Frame can be detached from the
  page only once.

An example of dumping frame tree:

```js
const { firefox } = require('playwright');  // Or 'chromium' or 'webkit'.

(async () => {
  const browser = await firefox.launch();
  const page = await browser.newPage();
  await page.goto('https://www.google.com/chrome/browser/canary.html');
  dumpFrameTree(page.mainFrame(), '');
  await browser.close();

  function dumpFrameTree(frame, indent) {
    console.log(indent + frame.url());
    for (const child of frame.childFrames())
      dumpFrameTree(child, indent + '  ');
  }
})();
```

## async method: Frame.addScriptTag
* since: v1.8
- returns: <[ElementHandle]>

Returns the added tag when the script's onload fires or when the script content was injected into frame.

Adds a `<script>` tag into the page with the desired url or content.

### option: Frame.addScriptTag.url
* since: v1.8
- `url` <[string]>

URL of a script to be added.

### option: Frame.addScriptTag.path
* since: v1.8
- `path` <[path]>

Path to the JavaScript file to be injected into frame. If `path` is a relative path, then it is resolved relative to the
current working directory.

### option: Frame.addScriptTag.content
* since: v1.8
- `content` <[string]>

Raw JavaScript content to be injected into frame.

### option: Frame.addScriptTag.type
* since: v1.8
- `type` <[string]>

Script type. Use 'module' in order to load a JavaScript ES6 module. See
[script](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script) for more details.

## async method: Frame.addStyleTag
* since: v1.8
- returns: <[ElementHandle]>

Returns the added tag when the stylesheet's onload fires or when the CSS content was injected into frame.

Adds a `<link rel="stylesheet">` tag into the page with the desired url or a `<style type="text/css">` tag with the
content.

### option: Frame.addStyleTag.url
* since: v1.8
- `url` <[string]>

URL of the `<link>` tag.

### option: Frame.addStyleTag.path
* since: v1.8
- `path` <[path]>

Path to the CSS file to be injected into frame. If `path` is a relative path, then it is resolved relative to the
current working directory.

### option: Frame.addStyleTag.content
* since: v1.8
- `content` <[string]>

Raw CSS content to be injected into frame.

## async method: Frame.check
* since: v1.8
* discouraged: Use locator-based `Locator.check()` instead. Read more about [locators](../locators.md).

This method checks an element matching `selector` by performing the following steps:
1. Find an element matching `selector`. If there is none, wait until a matching element is attached to
   the DOM.
1. Ensure that matched element is a checkbox or a radio input. If not, this method throws. If the element is already
   checked, this method returns immediately.
1. Wait for [actionability](../actionability.md) checks on the matched element, unless `force` option is
   set. If the element is detached during the checks, the whole action is retried.
1. Scroll the element into view if needed.
1. Use `Page.mouse` to click in the center of the element.
1. Ensure that the element is now checked. If not, this method throws.

When all steps combined have not finished during the specified `timeout`, this method throws a
[TimeoutError]. Passing zero timeout disables this.

### param: Frame.check.selector = %%-input-selector-%%
* since: v1.8

### option: Frame.check.force = %%-input-force-%%
* since: v1.8

### option: Frame.check.scroll = %%-input-scroll-%%
* since: v1.62

### option: Frame.check.noWaitAfter = %%-input-no-wait-after-removed-%%
* since: v1.8

### option: Frame.check.position = %%-input-position-%%
* since: v1.11

### option: Frame.check.strict = %%-input-strict-%%
* since: v1.14

### option: Frame.check.timeout = %%-input-timeout-%%
* since: v1.8

### option: Frame.check.timeout = %%-input-timeout-js-%%
* since: v1.8

### option: Frame.check.signal = %%-input-signal-%%

### option: Frame.check.trial = %%-input-trial-%%
* since: v1.11

## method: Frame.childFrames
* since: v1.8
- returns: <[Array]<[Frame]>>

## async method: Frame.click
* since: v1.8
* discouraged: Use locator-based `Locator.click()` instead. Read more about [locators](../locators.md).

This method clicks an element matching `selector` by performing the following steps:
1. Find an element matching `selector`. If there is none, wait until a matching element is attached to
   the DOM.
1. Wait for [actionability](../actionability.md) checks on the matched element, unless `force` option is
   set. If the element is detached during the checks, the whole action is retried.
1. Scroll the element into view if needed.
1. Use `Page.mouse` to click in the center of the element, or the specified `position`.
1. Wait for initiated navigations to either succeed or fail, unless `noWaitAfter` option is set.

When all steps combined have not finished during the specified `timeout`, this method throws a
[TimeoutError]. Passing zero timeout disables this.

### param: Frame.click.selector = %%-input-selector-%%
* since: v1.8

### option: Frame.click.button = %%-input-button-%%
* since: v1.8

### option: Frame.click.clickCount = %%-input-click-count-%%
* since: v1.8

### option: Frame.click.delay = %%-input-down-up-delay-%%
* since: v1.8

### option: Frame.click.force = %%-input-force-%%
* since: v1.8

### option: Frame.click.scroll = %%-input-scroll-%%
* since: v1.62

### option: Frame.click.modifiers = %%-input-modifiers-%%
* since: v1.8

### option: Frame.click.noWaitAfter = %%-input-no-wait-after-%%
* since: v1.8

### option: Frame.click.position = %%-input-position-%%
* since: v1.8

### option: Frame.click.strict = %%-input-strict-%%
* since: v1.14

### option: Frame.click.timeout = %%-input-timeout-%%
* since: v1.8

### option: Frame.click.timeout = %%-input-timeout-js-%%
* since: v1.8

### option: Frame.click.signal = %%-input-signal-%%

### option: Frame.click.trial = %%-input-trial-with-modifiers-%%
* since: v1.11

## async method: Frame.content
* since: v1.8
- returns: <[string]>

Gets the full HTML contents of the frame, including the doctype.

## async method: Frame.dblclick
* since: v1.8
* discouraged: Use locator-based `Locator.dblclick()` instead. Read more about [locators](../locators.md).
* langs:
  - alias-csharp: DblClickAsync

This method double clicks an element matching `selector` by performing the following steps:
1. Find an element matching `selector`. If there is none, wait until a matching element is attached to
   the DOM.
1. Wait for [actionability](../actionability.md) checks on the matched element, unless `force` option is
   set. If the element is detached during the checks, the whole action is retried.
1. Scroll the element into view if needed.
1. Use `Page.mouse` to double click in the center of the element, or the specified `position`.
   if the first click of the `dblclick()` triggers a navigation event, this method will throw.

When all steps combined have not finished during the specified `timeout`, this method throws a
[TimeoutError]. Passing zero timeout disables this.

:::note
`frame.dblclick()` dispatches two `click` events and a single `dblclick` event.
:::

### param: Frame.dblclick.selector = %%-input-selector-%%
* since: v1.8

### option: Frame.dblclick.button = %%-input-button-%%
* since: v1.8

### option: Frame.dblclick.force = %%-input-force-%%
* since: v1.8

### option: Frame.dblclick.scroll = %%-input-scroll-%%
* since: v1.62

### option: Frame.dblclick.delay = %%-input-down-up-delay-%%
* since: v1.8

### option: Frame.dblclick.modifiers = %%-input-modifiers-%%
* since: v1.8

### option: Frame.dblclick.noWaitAfter = %%-input-no-wait-after-removed-%%
* since: v1.8

### option: Frame.dblclick.position = %%-input-position-%%
* since: v1.8

### option: Frame.dblclick.strict = %%-input-strict-%%
* since: v1.14

### option: Frame.dblclick.timeout = %%-input-timeout-%%
* since: v1.8

### option: Frame.dblclick.timeout = %%-input-timeout-js-%%
* since: v1.8

### option: Frame.dblclick.signal = %%-input-signal-%%

### option: Frame.dblclick.trial = %%-input-trial-with-modifiers-%%
* since: v1.11

## async method: Frame.dispatchEvent
* since: v1.8
* discouraged: Use locator-based `Locator.dispatchEvent()` instead. Read more about [locators](../locators.md).

The snippet below dispatches the `click` event on the element. Regardless of the visibility state of the element, `click`
is dispatched. This is equivalent to calling
[element.click()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/click).

**Usage**

```js
await frame.dispatchEvent('button#submit', 'click');
```

Under the hood, it creates an instance of an event based on the given `type`, initializes it with
`eventInit` properties and dispatches it on the element. Events are `composed`, `cancelable` and bubble by
default.

Since `eventInit` is event-specific, please refer to the events documentation for the lists of initial
properties:
* [DeviceMotionEvent](https://developer.mozilla.org/en-US/docs/Web/API/DeviceMotionEvent/DeviceMotionEvent)
* [DeviceOrientationEvent](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/DeviceOrientationEvent)
* [DragEvent](https://developer.mozilla.org/en-US/docs/Web/API/DragEvent/DragEvent)
* [Event](https://developer.mozilla.org/en-US/docs/Web/API/Event/Event)
* [FocusEvent](https://developer.mozilla.org/en-US/docs/Web/API/FocusEvent/FocusEvent)
* [KeyboardEvent](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/KeyboardEvent)
* [MouseEvent](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/MouseEvent)
* [PointerEvent](https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/PointerEvent)
* [TouchEvent](https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent/TouchEvent)
* [WheelEvent](https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent/WheelEvent)

You can also specify `JSHandle` as the property value if you want live objects to be passed into the event:

```js
// Note you can only create DataTransfer in Chromium and Firefox
const dataTransfer = await frame.evaluateHandle(() => new DataTransfer());
await frame.dispatchEvent('#source', 'dragstart', { dataTransfer });
```

### param: Frame.dispatchEvent.selector = %%-input-selector-%%
* since: v1.8

### param: Frame.dispatchEvent.type
* since: v1.8
- `type` <[string]>

DOM event type: `"click"`, `"dragstart"`, etc.

### param: Frame.dispatchEvent.eventInit
* since: v1.8
- `eventInit` ?<[EvaluationArgument]>

Optional event-specific initialization properties.

### option: Frame.dispatchEvent.strict = %%-input-strict-%%
* since: v1.14

### option: Frame.dispatchEvent.timeout = %%-input-timeout-%%
* since: v1.8

### option: Frame.dispatchEvent.timeout = %%-input-timeout-js-%%
* since: v1.8

### option: Frame.dispatchEvent.signal = %%-input-signal-%%

## async method: Frame.dragAndDrop
* since: v1.13

### param: Frame.dragAndDrop.source = %%-input-source-%%
* since: v1.13

### param: Frame.dragAndDrop.target = %%-input-target-%%
* since: v1.13

### option: Frame.dragAndDrop.force = %%-input-force-%%
* since: v1.13

### option: Frame.dragAndDrop.scroll = %%-input-scroll-%%
* since: v1.62

### option: Frame.dragAndDrop.noWaitAfter = %%-input-no-wait-after-removed-%%
* since: v1.13

### option: Frame.dragAndDrop.strict = %%-input-strict-%%
* since: v1.14

### option: Frame.dragAndDrop.timeout = %%-input-timeout-%%
* since: v1.13

### option: Frame.dragAndDrop.timeout = %%-input-timeout-js-%%
* since: v1.13

### option: Frame.dragAndDrop.signal = %%-input-signal-%%

### option: Frame.dragAndDrop.trial = %%-input-trial-%%
* since: v1.13

### option: Frame.dragAndDrop.sourcePosition = %%-input-source-position-%%
* since: v1.14

### option: Frame.dragAndDrop.targetPosition = %%-input-target-position-%%
* since: v1.14

### option: Frame.dragAndDrop.steps = %%-input-drag-steps-%%
* since: v1.57

## async method: Frame.evalOnSelector
* since: v1.9
* discouraged: This method does not wait for the element to pass the actionability
  checks and therefore can lead to the flaky tests. Use `Locator.evaluate()`, other [Locator] helper methods or web-first assertions instead.
* langs:
  - alias-python: eval_on_selector
  - alias-js: $eval
- returns: <[Serializable]>

Returns the return value of `expression`.

The method finds an element matching the specified selector within the frame and passes it as a first argument to
`expression`. If no
elements match the selector, the method throws an error.

If `expression` returns a [Promise], then `Frame.evalOnSelector()` would wait for the promise to resolve and return its
value.

**Usage**

```js
const searchValue = await frame.$eval('#search', el => el.value);
const preloadHref = await frame.$eval('link[rel=preload]', el => el.href);
const html = await frame.$eval('.main-container', (e, suffix) => e.outerHTML + suffix, 'hello');
```

### param: Frame.evalOnSelector.selector = %%-query-selector-%%
* since: v1.9

### param: Frame.evalOnSelector.expression = %%-evaluate-expression-%%
* since: v1.9

### param: Frame.evalOnSelector.expression = %%-js-evalonselector-pagefunction-%%
* since: v1.9

### param: Frame.evalOnSelector.arg
* since: v1.9
- `arg` ?<[EvaluationArgument]>

Optional argument to pass to `expression`.

### option: Frame.evalOnSelector.strict = %%-input-strict-%%
* since: v1.14

## async method: Frame.evalOnSelectorAll
* since: v1.9
* discouraged: In most cases, `Locator.evaluateAll()`,
  other [Locator] helper methods and web-first assertions do a better job.
* langs:
  - alias-python: eval_on_selector_all
  - alias-js: $$eval
- returns: <[Serializable]>

Returns the return value of `expression`.

The method finds all elements matching the specified selector within the frame and passes an array of matched elements
as a first argument to `expression`.

If `expression` returns a [Promise], then `Frame.evalOnSelectorAll()` would wait for the promise to resolve and return its
value.

**Usage**

```js
const divsCounts = await frame.$$eval('div', (divs, min) => divs.length >= min, 10);
```

### param: Frame.evalOnSelectorAll.selector = %%-query-selector-%%
* since: v1.9

### param: Frame.evalOnSelectorAll.expression = %%-evaluate-expression-%%
* since: v1.9

### param: Frame.evalOnSelectorAll.expression = %%-js-evalonselectorall-pagefunction-%%
* since: v1.9

### param: Frame.evalOnSelectorAll.arg
* since: v1.9
- `arg` ?<[EvaluationArgument]>

Optional argument to pass to `expression`.

## async method: Frame.evaluate
* since: v1.8
- returns: <[Serializable]>

Returns the return value of `expression`.

If the function passed to the `Frame.evaluate()` returns a [Promise], then `Frame.evaluate()` would wait for the promise to
resolve and return its value.

If the function passed to the `Frame.evaluate()` returns a non-[Serializable] value, then
`Frame.evaluate()` returns `undefined`. Playwright also supports transferring some
additional values that are not serializable by `JSON`: `-0`, `NaN`, `Infinity`, `-Infinity`.

**Usage**

```js
const result = await frame.evaluate(([x, y]) => {
  return Promise.resolve(x * y);
}, [7, 8]);
console.log(result); // prints "56"
```

A string can also be passed in instead of a function.

```js
console.log(await frame.evaluate('1 + 2')); // prints "3"
```

[ElementHandle] instances can be passed as an argument to the `Frame.evaluate()`:

```js
const bodyHandle = await frame.evaluateHandle('document.body');
const html = await frame.evaluate(([body, suffix]) =>
  body.innerHTML + suffix, [bodyHandle, 'hello'],
);
await bodyHandle.dispose();
```

### param: Frame.evaluate.expression = %%-evaluate-expression-%%
* since: v1.8

### param: Frame.evaluate.expression = %%-js-evaluate-pagefunction-%%
* since: v1.8

### param: Frame.evaluate.arg
* since: v1.8
- `arg` ?<[EvaluationArgument]>

Optional argument to pass to `expression`.

### option: Frame.evaluate.exposeFunctions = %%-js-evaluate-expose-functions-%%
* since: v1.62

## async method: Frame.evaluateHandle
* since: v1.8
- returns: <[JSHandle]>

Returns the return value of `expression` as a [JSHandle].

The only difference between `Frame.evaluate()` and `Frame.evaluateHandle()` is that
`Frame.evaluateHandle()` returns [JSHandle].

If the function, passed to the `Frame.evaluateHandle()`, returns a [Promise], then
`Frame.evaluateHandle()` would wait for the promise to resolve and return its value.

**Usage**

```js
// Handle for the window object
const aWindowHandle = await frame.evaluateHandle(() => Promise.resolve(window));
```

A string can also be passed in instead of a function.

```js
const aHandle = await frame.evaluateHandle('document'); // Handle for the 'document'.
```

[JSHandle] instances can be passed as an argument to the `Frame.evaluateHandle()`:

```js
const aHandle = await frame.evaluateHandle(() => document.body);
const resultHandle = await frame.evaluateHandle(([body, suffix]) =>
  body.innerHTML + suffix, [aHandle, 'hello'],
);
console.log(await resultHandle.jsonValue());
await resultHandle.dispose();
```

### param: Frame.evaluateHandle.expression = %%-evaluate-expression-%%
* since: v1.8

### param: Frame.evaluateHandle.expression = %%-js-evaluate-pagefunction-%%
* since: v1.8

### param: Frame.evaluateHandle.arg
* since: v1.8
- `arg` ?<[EvaluationArgument]>

Optional argument to pass to `expression`.

### option: Frame.evaluateHandle.exposeFunctions = %%-js-evaluate-expose-functions-%%
* since: v1.62

## async method: Frame.fill
* since: v1.8
* discouraged: Use locator-based `Locator.fill()` instead. Read more about [locators](../locators.md).

This method waits for an element matching `selector`, waits for [actionability](../actionability.md) checks, focuses the element, fills it and triggers an `input` event after filling. Note that you can pass an empty string to clear the input field.

If the target element is not an `<input>`, `<textarea>` or `[contenteditable]` element, this method throws an error. However, if the element is inside the `<label>` element that has an associated [control](https://developer.mozilla.org/en-US/docs/Web/API/HTMLLabelElement/control), the control will be filled instead.

To send fine-grained keyboard events, use `Locator.pressSequentially()`.

### param: Frame.fill.selector = %%-input-selector-%%
* since: v1.8

### param: Frame.fill.value
* since: v1.8
- `value` <[string]>

Value to fill for the `<input>`, `<textarea>` or `[contenteditable]` element.

### option: Frame.fill.force = %%-input-force-%%
* since: v1.13

### option: Frame.fill.noWaitAfter = %%-input-no-wait-after-removed-%%
* since: v1.8

### option: Frame.fill.strict = %%-input-strict-%%
* since: v1.14

### option: Frame.fill.timeout = %%-input-timeout-%%
* since: v1.8

### option: Frame.fill.timeout = %%-input-timeout-js-%%
* since: v1.8

### option: Frame.fill.signal = %%-input-signal-%%

## async method: Frame.focus
* since: v1.8
* discouraged: Use locator-based `Locator.focus()` instead. Read more about [locators](../locators.md).

This method fetches an element with `selector` and focuses it. If there's no element matching
`selector`, the method waits until a matching element appears in the DOM.

### param: Frame.focus.selector = %%-input-selector-%%
* since: v1.8

### option: Frame.focus.strict = %%-input-strict-%%
* since: v1.14

### option: Frame.focus.timeout = %%-input-timeout-%%
* since: v1.8

### option: Frame.focus.timeout = %%-input-timeout-js-%%
* since: v1.8

### option: Frame.focus.signal = %%-input-signal-%%

## async method: Frame.frameElement
* since: v1.8
- returns: <[ElementHandle]>

Returns the `frame` or `iframe` element handle which corresponds to this frame.

This is an inverse of `ElementHandle.contentFrame()`. Note that returned handle actually belongs to the parent
frame.

This method throws an error if the frame has been detached before `frameElement()` returns.

**Usage**

```js
const frameElement = await frame.frameElement();
const contentFrame = await frameElement.contentFrame();
console.log(frame === contentFrame);  // -> true
```

## method: Frame.frameLocator
* since: v1.17
- returns: <[FrameLocator]>

When working with iframes, you can create a frame locator that will enter the iframe and allow selecting elements
in that iframe.

When called without `selector`, the search starts in this frame or in any of the iframes inside it,
so that you don't need to locate each iframe first. Note that the rest of the locator is resolved inside a single
frame, just like any other locator. If it matches elements inside multiple frames, an error is thrown.

**Usage**

Following snippet locates element with text "Submit" in the iframe with id `my-frame`, like `<iframe id="my-frame">`:

```js
const locator = frame.frameLocator('#my-iframe').getByText('Submit');
await locator.click();
```

Following snippet locates a button, either in the frame or in one of the iframes inside it:

```js
const locator = frame.frameLocator().getByRole('button');
await locator.click();
```

### param: Frame.frameLocator.selector
* since: v1.17
- `selector` ?<[string]>

A selector that matches the frame element. When not specified, locator is matched in this frame or in any of the iframes inside it.

## async method: Frame.getAttribute
* since: v1.8
* discouraged: Use locator-based `Locator.getAttribute()` instead. Read more about [locators](../locators.md).
- returns: <[null]|[string]>

Returns element attribute value.

### param: Frame.getAttribute.selector = %%-input-selector-%%
* since: v1.8

### param: Frame.getAttribute.name
* since: v1.8
- `name` <[string]>

Attribute name to get the value for.

### option: Frame.getAttribute.strict = %%-input-strict-%%
* since: v1.14

### option: Frame.getAttribute.timeout = %%-input-timeout-%%
* since: v1.8

### option: Frame.getAttribute.timeout = %%-input-timeout-js-%%
* since: v1.8

### option: Frame.getAttribute.signal = %%-input-signal-%%

## method: Frame.getByAltText
* since: v1.27
- returns: <[Locator]>

%%-template-locator-get-by-alt-text-%%

### param: Frame.getByAltText.text = %%-locator-get-by-text-text-%%

### option: Frame.getByAltText.exact = %%-locator-get-by-text-exact-%%

## method: Frame.getByLabel
* since: v1.27
- returns: <[Locator]>

%%-template-locator-get-by-label-text-%%

### param: Frame.getByLabel.text = %%-locator-get-by-text-text-%%

### option: Frame.getByLabel.exact = %%-locator-get-by-text-exact-%%

## method: Frame.getByPlaceholder
* since: v1.27
- returns: <[Locator]>

%%-template-locator-get-by-placeholder-text-%%

### param: Frame.getByPlaceholder.text = %%-locator-get-by-text-text-%%

### option: Frame.getByPlaceholder.exact = %%-locator-get-by-text-exact-%%

## method: Frame.getByRole
* since: v1.27
- returns: <[Locator]>

%%-template-locator-get-by-role-%%

### param: Frame.getByRole.role = %%-get-by-role-to-have-role-role-%%
* since: v1.27

### option: Frame.getByRole.-inline- = %%-locator-get-by-role-option-list-v1.27-%%
* since: v1.27

### option: Frame.getByRole.exact = %%-locator-get-by-role-option-exact-%%

### option: Frame.getByRole.description = %%-locator-get-by-role-option-description-%%

## method: Frame.getByTestId
* since: v1.27
- returns: <[Locator]>

%%-template-locator-get-by-test-id-%%

### param: Frame.getByTestId.testId = %%-locator-get-by-test-id-test-id-%%
* since: v1.27

## method: Frame.getByText
* since: v1.27
- returns: <[Locator]>

%%-template-locator-get-by-text-%%

### param: Frame.getByText.text = %%-locator-get-by-text-text-%%

### option: Frame.getByText.exact = %%-locator-get-by-text-exact-%%

## method: Frame.getByTitle
* since: v1.27
- returns: <[Locator]>

%%-template-locator-get-by-title-%%

### param: Frame.getByTitle.text = %%-locator-get-by-text-text-%%

### option: Frame.getByTitle.exact = %%-locator-get-by-text-exact-%%

## async method: Frame.goto
* since: v1.8
* langs:
  - alias-java: navigate
- returns: <[null]|[Response]>

Returns the main resource response. In case of multiple redirects, the navigation will resolve with the response of the
last redirect.

The method will throw an error if:
* there's an SSL error (e.g. in case of self-signed certificates).
* target URL is invalid.
* the `timeout` is exceeded during navigation.
* the remote server does not respond or is unreachable.
* the main resource failed to load.

The method will not throw an error when any valid HTTP status code is returned by the remote server, including 404
"Not Found" and 500 "Internal Server Error".  The status code for such responses can be retrieved by calling
`Response.status()`.

:::note
The method either throws an error or returns a main resource response. The only exceptions are navigation to
`about:blank` or navigation to the same URL with a different hash, which would succeed and return `null`.
:::

:::note
Headless mode doesn't support navigation to a PDF document. See the
[upstream issue](https://bugs.chromium.org/p/chromium/issues/detail?id=761295).
:::

### param: Frame.goto.url
* since: v1.8
- `url` <[string]>

URL to navigate frame to. The url should include scheme, e.g. `https://`.

### option: Frame.goto.waitUntil = %%-navigation-wait-until-%%
* since: v1.8

### option: Frame.goto.timeout = %%-navigation-timeout-%%
* since: v1.8

### option: Frame.goto.timeout = %%-navigation-timeout-js-%%
* since: v1.8

### option: Frame.goto.signal = %%-input-signal-%%

### option: Frame.goto.referer
* since: v1.8
- `referer` <[string]>

Referer header value. If provided it will take preference over the referer header value set by
`Page.setExtraHTTPHeaders()`.

## async method: Frame.hover
* since: v1.8
* discouraged: Use locator-based `Locator.hover()` instead. Read more about [locators](../locators.md).

This method hovers over an element matching `selector` by performing the following steps:
1. Find an element matching `selector`. If there is none, wait until a matching element is attached to
   the DOM.
1. Wait for [actionability](../actionability.md) checks on the matched element, unless `force` option is
   set. If the element is detached during the checks, the whole action is retried.
1. Scroll the element into view if needed.
1. Use `Page.mouse` to hover over the center of the element, or the specified `position`.

When all steps combined have not finished during the specified `timeout`, this method throws a
[TimeoutError]. Passing zero timeout disables this.

### param: Frame.hover.selector = %%-input-selector-%%
* since: v1.8

### option: Frame.hover.position = %%-input-position-%%
* since: v1.8

### option: Frame.hover.modifiers = %%-input-modifiers-%%
* since: v1.8

### option: Frame.hover.force = %%-input-force-%%
* since: v1.8

### option: Frame.hover.scroll = %%-input-scroll-%%
* since: v1.62

### option: Frame.hover.strict = %%-input-strict-%%
* since: v1.14

### option: Frame.hover.timeout = %%-input-timeout-%%
* since: v1.8

### option: Frame.hover.timeout = %%-input-timeout-js-%%
* since: v1.8

### option: Frame.hover.signal = %%-input-signal-%%

### option: Frame.hover.trial = %%-input-trial-with-modifiers-%%
* since: v1.11

### option: Frame.hover.noWaitAfter = %%-input-no-wait-after-removed-%%
* since: v1.28

## async method: Frame.innerHTML
* since: v1.8
* discouraged: Use locator-based `Locator.innerHTML()` instead. Read more about [locators](../locators.md).
- returns: <[string]>

Returns `element.innerHTML`.

### param: Frame.innerHTML.selector = %%-input-selector-%%
* since: v1.8

### option: Frame.innerHTML.strict = %%-input-strict-%%
* since: v1.14

### option: Frame.innerHTML.timeout = %%-input-timeout-%%
* since: v1.8

### option: Frame.innerHTML.timeout = %%-input-timeout-js-%%
* since: v1.8

### option: Frame.innerHTML.signal = %%-input-signal-%%

## async method: Frame.innerText
* since: v1.8
* discouraged: Use locator-based `Locator.innerText()` instead. Read more about [locators](../locators.md).
- returns: <[string]>

Returns `element.innerText`.

### param: Frame.innerText.selector = %%-input-selector-%%
* since: v1.8

### option: Frame.innerText.strict = %%-input-strict-%%
* since: v1.14

### option: Frame.innerText.timeout = %%-input-timeout-%%
* since: v1.8

### option: Frame.innerText.timeout = %%-input-timeout-js-%%
* since: v1.8

### option: Frame.innerText.signal = %%-input-signal-%%

## async method: Frame.inputValue
* since: v1.13
* discouraged: Use locator-based `Locator.inputValue()` instead. Read more about [locators](../locators.md).
- returns: <[string]>

Returns `input.value` for the selected `<input>` or `<textarea>` or `<select>` element.

Throws for non-input elements. However, if the element is inside the `<label>` element that has an associated [control](https://developer.mozilla.org/en-US/docs/Web/API/HTMLLabelElement/control), returns the value of the control.

### param: Frame.inputValue.selector = %%-input-selector-%%
* since: v1.13

### option: Frame.inputValue.strict = %%-input-strict-%%
* since: v1.14

### option: Frame.inputValue.timeout = %%-input-timeout-%%
* since: v1.13

### option: Frame.inputValue.timeout = %%-input-timeout-js-%%
* since: v1.13

### option: Frame.inputValue.signal = %%-input-signal-%%

## async method: Frame.isChecked
* since: v1.8
* discouraged: Use locator-based `Locator.isChecked()` instead. Read more about [locators](../locators.md).
- returns: <[boolean]>

Returns whether the element is checked. Throws if the element is not a checkbox or radio input.

### param: Frame.isChecked.selector = %%-input-selector-%%
* since: v1.8

### option: Frame.isChecked.strict = %%-input-strict-%%
* since: v1.14

### option: Frame.isChecked.timeout = %%-input-timeout-%%
* since: v1.8

### option: Frame.isChecked.timeout = %%-input-timeout-js-%%
* since: v1.8

### option: Frame.isChecked.signal = %%-input-signal-%%

## method: Frame.isDetached
* since: v1.8
- returns: <[boolean]>

Returns `true` if the frame has been detached, or `false` otherwise.

## async method: Frame.isDisabled
* since: v1.8
* discouraged: Use locator-based `Locator.isDisabled()` instead. Read more about [locators](../locators.md).
- returns: <[boolean]>

Returns whether the element is disabled, the opposite of [enabled](../actionability.md#enabled).

### param: Frame.isDisabled.selector = %%-input-selector-%%
* since: v1.8

### option: Frame.isDisabled.strict = %%-input-strict-%%
* since: v1.14

### option: Frame.isDisabled.timeout = %%-input-timeout-%%
* since: v1.8

### option: Frame.isDisabled.timeout = %%-input-timeout-js-%%
* since: v1.8

### option: Frame.isDisabled.signal = %%-input-signal-%%

## async method: Frame.isEditable
* since: v1.8
* discouraged: Use locator-based `Locator.isEditable()` instead. Read more about [locators](../locators.md).
- returns: <[boolean]>

Returns whether the element is [editable](../actionability.md#editable).

### param: Frame.isEditable.selector = %%-input-selector-%%
* since: v1.8

### option: Frame.isEditable.strict = %%-input-strict-%%
* since: v1.14

### option: Frame.isEditable.timeout = %%-input-timeout-%%
* since: v1.8

### option: Frame.isEditable.timeout = %%-input-timeout-js-%%
* since: v1.8

### option: Frame.isEditable.signal = %%-input-signal-%%

## async method: Frame.isEnabled
* since: v1.8
- returns: <[boolean]>

Returns whether the element is [enabled](../actionability.md#enabled).

### param: Frame.isEnabled.selector = %%-input-selector-%%
* since: v1.8

### option: Frame.isEnabled.strict = %%-input-strict-%%
* since: v1.14

### option: Frame.isEnabled.timeout = %%-input-timeout-%%
* since: v1.8

### option: Frame.isEnabled.timeout = %%-input-timeout-js-%%
* since: v1.8

### option: Frame.isEnabled.signal = %%-input-signal-%%

## async method: Frame.isHidden
* since: v1.8
* discouraged: Use locator-based `Locator.isHidden()` instead. Read more about [locators](../locators.md).
- returns: <[boolean]>

Returns whether the element is hidden, the opposite of [visible](../actionability.md#visible).  `selector` that does not match any elements is considered hidden.

### param: Frame.isHidden.selector = %%-input-selector-%%
* since: v1.8

### option: Frame.isHidden.strict = %%-input-strict-%%
* since: v1.14

### option: Frame.isHidden.timeout
* since: v1.8
* deprecated: This option is ignored. `Frame.isHidden()` does not wait for the element to become hidden and returns immediately.
- `timeout` <[float]>

## async method: Frame.isVisible
* since: v1.8
* discouraged: Use locator-based `Locator.isVisible()` instead. Read more about [locators](../locators.md).
- returns: <[boolean]>

Returns whether the element is [visible](../actionability.md#visible). `selector` that does not match any elements is considered not visible.

### param: Frame.isVisible.selector = %%-input-selector-%%
* since: v1.8

### option: Frame.isVisible.strict = %%-input-strict-%%
* since: v1.14

### option: Frame.isVisible.timeout
* since: v1.8
* deprecated: This option is ignored. `Frame.isVisible()` does not wait for the element to become visible and returns immediately.
- `timeout` <[float]>

## method: Frame.locator
* since: v1.14
- returns: <[Locator]>

%%-template-locator-root-locator-%%

[Learn more about locators](../locators.md).

### param: Frame.locator.selector = %%-find-selector-%%
* since: v1.14

### option: Frame.locator.-inline- = %%-locator-options-list-v1.14-%%
* since: v1.14

### option: Frame.locator.hasNot = %%-locator-option-has-not-%%
* since: v1.33

### option: Frame.locator.hasNotText = %%-locator-option-has-not-text-%%
* since: v1.33

## method: Frame.name
* since: v1.8
- returns: <[string]>

Returns frame's name attribute as specified in the tag.

If the name is empty, returns the id attribute instead.

:::note
This value is calculated once when the frame is created, and will not update if the attribute is changed later.
:::

## method: Frame.page
* since: v1.8
- returns: <[Page]>

Returns the page containing this frame.

## method: Frame.parentFrame
* since: v1.8
- returns: <[null]|[Frame]>

Parent frame, if any. Detached frames and main frames return `null`.

## async method: Frame.press
* since: v1.8
* discouraged: Use locator-based `Locator.press()` instead. Read more about [locators](../locators.md).

`key` can specify the intended
[keyboardEvent.key](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key) value or a single character to
generate the text for. A superset of the `key` values can be found
[here](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values). Examples of the keys are:

`F1` - `F12`, `Digit0`- `Digit9`, `KeyA`- `KeyZ`, `Backquote`, `Minus`, `Equal`, `Backslash`, `Backspace`, `Tab`,
`Delete`, `Escape`, `ArrowDown`, `End`, `Enter`, `Home`, `Insert`, `PageDown`, `PageUp`, `ArrowRight`, `ArrowUp`, etc.

Following modification shortcuts are also supported: `Shift`, `Control`, `Alt`, `Meta`, `ShiftLeft`, `ControlOrMeta`.
`ControlOrMeta` resolves to `Control` on Windows and Linux and to `Meta` on macOS.

Holding down `Shift` will type the text that corresponds to the `key` in the upper case.

If `key` is a single character, it is case-sensitive, so the values `a` and `A` will generate different
respective texts.

Shortcuts such as `key: "Control+o"`, `key: "Control++` or `key: "Control+Shift+T"` are supported as well. When specified with the
modifier, modifier is pressed and being held while the subsequent key is being pressed.

### param: Frame.press.selector = %%-input-selector-%%
* since: v1.8

### param: Frame.press.key
* since: v1.8
- `key` <[string]>

Name of the key to press or a character to generate, such as `ArrowLeft` or `a`.

### option: Frame.press.delay
* since: v1.8
- `delay` <[float]>

Time to wait between `keydown` and `keyup` in milliseconds. Defaults to 0.

### option: Frame.press.noWaitAfter = %%-input-no-wait-after-%%
* since: v1.8

### option: Frame.press.strict = %%-input-strict-%%
* since: v1.14

### option: Frame.press.timeout = %%-input-timeout-%%
* since: v1.8

### option: Frame.press.timeout = %%-input-timeout-js-%%
* since: v1.8

### option: Frame.press.signal = %%-input-signal-%%

## async method: Frame.querySelector
* since: v1.9
* discouraged: Use locator-based `Frame.locator()` instead. Read more about [locators](../locators.md).
* langs:
  - alias-python: query_selector
  - alias-js: $
- returns: <[null]|[ElementHandle]>

Returns the ElementHandle pointing to the frame element.

:::caution
The use of [ElementHandle] is discouraged, use [Locator] objects and web-first assertions instead.
:::

The method finds an element matching the specified selector within the frame. If no elements match the selector,
returns `null`.

### param: Frame.querySelector.selector = %%-query-selector-%%
* since: v1.9

### option: Frame.querySelector.strict = %%-input-strict-%%
* since: v1.14

## async method: Frame.querySelectorAll
* since: v1.9
* discouraged: Use locator-based `Frame.locator()` instead. Read more about [locators](../locators.md).
* langs:
  - alias-python: query_selector_all
  - alias-js: $$
- returns: <[Array]<[ElementHandle]>>

Returns the ElementHandles pointing to the frame elements.

:::caution
The use of [ElementHandle] is discouraged, use [Locator] objects instead.
:::

The method finds all elements matching the specified selector within the frame. If no elements match the selector,
returns empty array.

### param: Frame.querySelectorAll.selector = %%-query-selector-%%
* since: v1.9

## async method: Frame.selectOption
* since: v1.8
* discouraged: Use locator-based `Locator.selectOption()` instead. Read more about [locators](../locators.md).
- returns: <[Array]<[string]>>

This method waits for an element matching `selector`, waits for [actionability](../actionability.md) checks, waits until all specified options are present in the `<select>` element and selects these options.

If the target element is not a `<select>` element, this method throws an error. However, if the element is inside the `<label>` element that has an associated [control](https://developer.mozilla.org/en-US/docs/Web/API/HTMLLabelElement/control), the control will be used instead.

Returns the array of option values that have been successfully selected.

Triggers a `change` and `input` event once all the provided options have been selected.

**Usage**

```js
// Single selection matching the value or label
frame.selectOption('select#colors', 'blue');

// single selection matching both the value and the label
frame.selectOption('select#colors', { label: 'Blue' });

// multiple selection
frame.selectOption('select#colors', 'red', 'green', 'blue');
```

### param: Frame.selectOption.selector = %%-query-selector-%%
* since: v1.8

### param: Frame.selectOption.values = %%-select-options-values-%%
* since: v1.8

### option: Frame.selectOption.force = %%-input-force-%%
* since: v1.13

### option: Frame.selectOption.noWaitAfter = %%-input-no-wait-after-removed-%%
* since: v1.8

### option: Frame.selectOption.strict = %%-input-strict-%%
* since: v1.14

### option: Frame.selectOption.timeout = %%-input-timeout-%%
* since: v1.8

### option: Frame.selectOption.timeout = %%-input-timeout-js-%%
* since: v1.8

### option: Frame.selectOption.signal = %%-input-signal-%%

### param: Frame.selectOption.element = %%-python-select-options-element-%%
* since: v1.8

### param: Frame.selectOption.index = %%-python-select-options-index-%%
* since: v1.8

### param: Frame.selectOption.value = %%-python-select-options-value-%%
* since: v1.8

### param: Frame.selectOption.label = %%-python-select-options-label-%%
* since: v1.8

## async method: Frame.setChecked
* since: v1.15
* discouraged: Use locator-based `Locator.setChecked()` instead. Read more about [locators](../locators.md).

This method checks or unchecks an element matching `selector` by performing the following steps:
1. Find an element matching `selector`. If there is none, wait until a matching element is attached to
   the DOM.
1. Ensure that matched element is a checkbox or a radio input. If not, this method throws.
1. If the element already has the right checked state, this method returns immediately.
1. Wait for [actionability](../actionability.md) checks on the matched element, unless `force` option is
   set. If the element is detached during the checks, the whole action is retried.
1. Scroll the element into view if needed.
1. Use `Page.mouse` to click in the center of the element.
1. Ensure that the element is now checked or unchecked. If not, this method throws.

When all steps combined have not finished during the specified `timeout`, this method throws a
[TimeoutError]. Passing zero timeout disables this.

### param: Frame.setChecked.selector = %%-input-selector-%%
* since: v1.15

### param: Frame.setChecked.checked = %%-input-checked-%%
* since: v1.15

### option: Frame.setChecked.force = %%-input-force-%%
* since: v1.15

### option: Frame.setChecked.scroll = %%-input-scroll-%%
* since: v1.62

### option: Frame.setChecked.noWaitAfter = %%-input-no-wait-after-removed-%%
* since: v1.15

### option: Frame.setChecked.position = %%-input-position-%%
* since: v1.15

### option: Frame.setChecked.strict = %%-input-strict-%%
* since: v1.15

### option: Frame.setChecked.timeout = %%-input-timeout-%%
* since: v1.15

### option: Frame.setChecked.timeout = %%-input-timeout-js-%%
* since: v1.15

### option: Frame.setChecked.signal = %%-input-signal-%%

### option: Frame.setChecked.trial = %%-input-trial-%%
* since: v1.15

## async method: Frame.setContent
* since: v1.8

This method internally calls [document.write()](https://developer.mozilla.org/en-US/docs/Web/API/Document/write), inheriting all its specific characteristics and behaviors.

### param: Frame.setContent.html
* since: v1.8
- `html` <[string]>

HTML markup to assign to the page.

### option: Frame.setContent.timeout = %%-navigation-timeout-%%
* since: v1.8

### option: Frame.setContent.timeout = %%-navigation-timeout-js-%%
* since: v1.8

### option: Frame.setContent.signal = %%-input-signal-%%

### option: Frame.setContent.waitUntil = %%-navigation-wait-until-%%
* since: v1.8

## async method: Frame.setInputFiles
* since: v1.8
* discouraged: Use locator-based `Locator.setInputFiles()` instead. Read more about [locators](../locators.md).

Sets the value of the file input to these file paths or files. If some of the `filePaths` are relative paths, then they
are resolved relative to the current working directory. For empty array, clears the selected files.

This method expects `selector` to point to an
[input element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input). However, if the element is inside the `<label>` element that has an associated [control](https://developer.mozilla.org/en-US/docs/Web/API/HTMLLabelElement/control), targets the control instead.

### param: Frame.setInputFiles.selector = %%-input-selector-%%
* since: v1.8

### param: Frame.setInputFiles.files = %%-input-files-%%
* since: v1.8

### option: Frame.setInputFiles.noWaitAfter = %%-input-no-wait-after-removed-%%
* since: v1.8

### option: Frame.setInputFiles.strict = %%-input-strict-%%
* since: v1.14

### option: Frame.setInputFiles.timeout = %%-input-timeout-%%
* since: v1.8

### option: Frame.setInputFiles.timeout = %%-input-timeout-js-%%
* since: v1.8

### option: Frame.setInputFiles.signal = %%-input-signal-%%

## async method: Frame.tap
* since: v1.8
* discouraged: Use locator-based `Locator.tap()` instead. Read more about [locators](../locators.md).

This method taps an element matching `selector` by performing the following steps:
1. Find an element matching `selector`. If there is none, wait until a matching element is attached to
   the DOM.
1. Wait for [actionability](../actionability.md) checks on the matched element, unless `force` option is
   set. If the element is detached during the checks, the whole action is retried.
1. Scroll the element into view if needed.
1. Use `Page.touchscreen` to tap the center of the element, or the specified `position`.

When all steps combined have not finished during the specified `timeout`, this method throws a
[TimeoutError]. Passing zero timeout disables this.

:::note
`frame.tap()` requires that the `hasTouch` option of the browser context be set to true.
:::

### param: Frame.tap.selector = %%-input-selector-%%
* since: v1.8

### option: Frame.tap.force = %%-input-force-%%
* since: v1.8

### option: Frame.tap.scroll = %%-input-scroll-%%
* since: v1.62

### option: Frame.tap.modifiers = %%-input-modifiers-%%
* since: v1.8

### option: Frame.tap.noWaitAfter = %%-input-no-wait-after-removed-%%
* since: v1.8

### option: Frame.tap.position = %%-input-position-%%
* since: v1.8

### option: Frame.tap.strict = %%-input-strict-%%
* since: v1.14

### option: Frame.tap.timeout = %%-input-timeout-%%
* since: v1.8

### option: Frame.tap.timeout = %%-input-timeout-js-%%
* since: v1.8

### option: Frame.tap.signal = %%-input-signal-%%

### option: Frame.tap.trial = %%-input-trial-with-modifiers-%%
* since: v1.11

## async method: Frame.textContent
* since: v1.8
* discouraged: Use locator-based `Locator.textContent()` instead. Read more about [locators](../locators.md).
- returns: <[null]|[string]>

Returns `element.textContent`.

### param: Frame.textContent.selector = %%-input-selector-%%
* since: v1.8

### option: Frame.textContent.strict = %%-input-strict-%%
* since: v1.14

### option: Frame.textContent.timeout = %%-input-timeout-%%
* since: v1.8

### option: Frame.textContent.timeout = %%-input-timeout-js-%%
* since: v1.8

### option: Frame.textContent.signal = %%-input-signal-%%

## async method: Frame.title
* since: v1.8
- returns: <[string]>

Returns the page title.

## async method: Frame.type
* since: v1.8
* deprecated: In most cases, you should use `Locator.fill()` instead. You only need to press keys one by one if there is special keyboard handling on the page - in this case use `Locator.pressSequentially()`.

Sends a `keydown`, `keypress`/`input`, and `keyup` event for each character in the text. `frame.type` can be used to
send fine-grained keyboard events. To fill values in form fields, use `Frame.fill()`.

To press a special key, like `Control` or `ArrowDown`, use `Keyboard.press()`.

**Usage**

### param: Frame.type.selector = %%-input-selector-%%
* since: v1.8

### param: Frame.type.text
* since: v1.8
- `text` <[string]>

A text to type into a focused element.

### option: Frame.type.delay
* since: v1.8
- `delay` <[float]>

Time to wait between key presses in milliseconds. Defaults to 0.

### option: Frame.type.noWaitAfter = %%-input-no-wait-after-removed-%%
* since: v1.8

### option: Frame.type.strict = %%-input-strict-%%
* since: v1.14

### option: Frame.type.timeout = %%-input-timeout-%%
* since: v1.8

### option: Frame.type.timeout = %%-input-timeout-js-%%
* since: v1.8

### option: Frame.type.signal = %%-input-signal-%%

## async method: Frame.uncheck
* since: v1.8
* discouraged: Use locator-based `Locator.uncheck()` instead. Read more about [locators](../locators.md).

This method checks an element matching `selector` by performing the following steps:
1. Find an element matching `selector`. If there is none, wait until a matching element is attached to
   the DOM.
1. Ensure that matched element is a checkbox or a radio input. If not, this method throws. If the element is already
   unchecked, this method returns immediately.
1. Wait for [actionability](../actionability.md) checks on the matched element, unless `force` option is
   set. If the element is detached during the checks, the whole action is retried.
1. Scroll the element into view if needed.
1. Use `Page.mouse` to click in the center of the element.
1. Ensure that the element is now unchecked. If not, this method throws.

When all steps combined have not finished during the specified `timeout`, this method throws a
[TimeoutError]. Passing zero timeout disables this.

### param: Frame.uncheck.selector = %%-input-selector-%%
* since: v1.8

### option: Frame.uncheck.force = %%-input-force-%%
* since: v1.8

### option: Frame.uncheck.scroll = %%-input-scroll-%%
* since: v1.62

### option: Frame.uncheck.noWaitAfter = %%-input-no-wait-after-removed-%%
* since: v1.8

### option: Frame.uncheck.position = %%-input-position-%%
* since: v1.11

### option: Frame.uncheck.strict = %%-input-strict-%%
* since: v1.14

### option: Frame.uncheck.timeout = %%-input-timeout-%%
* since: v1.8

### option: Frame.uncheck.timeout = %%-input-timeout-js-%%
* since: v1.8

### option: Frame.uncheck.signal = %%-input-signal-%%

### option: Frame.uncheck.trial = %%-input-trial-%%
* since: v1.11

## method: Frame.url
* since: v1.8
- returns: <[string]>

Returns frame's url.

## async method: Frame.waitForFunction
* since: v1.8
- returns: <[JSHandle]>

Returns when the `expression` returns a truthy value, returns that value.

**Usage**

The `Frame.waitForFunction()` can be used to observe viewport size change:

```js
const { firefox } = require('playwright');  // Or 'chromium' or 'webkit'.

(async () => {
  const browser = await firefox.launch();
  const page = await browser.newPage();
  const watchDog = page.mainFrame().waitForFunction('window.innerWidth < 100');
  await page.setViewportSize({ width: 50, height: 50 });
  await watchDog;
  await browser.close();
})();
```

To pass an argument to the predicate of `frame.waitForFunction` function:

```js
const selector = '.foo';
await frame.waitForFunction(selector => !!document.querySelector(selector), selector);
```

### param: Frame.waitForFunction.expression = %%-evaluate-expression-%%
* since: v1.8

### param: Frame.waitForFunction.expression = %%-js-evaluate-pagefunction-%%
* since: v1.8

### param: Frame.waitForFunction.arg
* since: v1.8
- `arg` ?<[EvaluationArgument]>

Optional argument to pass to `expression`.

### option: Frame.waitForFunction.polling = %%-js-python-wait-for-function-polling-%%
* since: v1.8

### option: Frame.waitForFunction.polling = %%-csharp-java-wait-for-function-polling-%%
* since: v1.8

### option: Frame.waitForFunction.timeout = %%-wait-for-function-timeout-%%
* since: v1.8

### option: Frame.waitForFunction.timeout = %%-wait-for-function-timeout-js-%%
* since: v1.8

### option: Frame.waitForFunction.signal = %%-input-signal-%%

## async method: Frame.waitForLoadState
* since: v1.8

Waits for the required load state to be reached.

This returns when the frame reaches a required load state, `load` by default. The navigation must have been committed
when this method is called. If current document has already reached the required state, resolves immediately.

:::note
Most of the time, this method is not needed because Playwright [auto-waits before every action](../actionability.md).
:::

**Usage**

```js
await frame.click('button'); // Click triggers navigation.
await frame.waitForLoadState(); // Waits for 'load' state by default.
```

### param: Frame.waitForLoadState.state = %%-wait-for-load-state-state-%%
* since: v1.8

### option: Frame.waitForLoadState.timeout = %%-navigation-timeout-%%
* since: v1.8

### option: Frame.waitForLoadState.timeout = %%-navigation-timeout-js-%%
* since: v1.8
### option: Frame.waitForLoadState.signal = %%-wait-for-event-signal-%%

## async method: Frame.waitForNavigation
* since: v1.8
* deprecated: This method is inherently racy, please use `Frame.waitForURL()` instead.
* langs:
  * alias-python: expect_navigation
  * alias-csharp: RunAndWaitForNavigation
- returns: <[null]|[Response]>

Waits for the frame navigation and returns the main resource response. In case of multiple redirects, the navigation
will resolve with the response of the last redirect. In case of navigation to a different anchor or navigation due to
History API usage, the navigation will resolve with `null`.

**Usage**

This method waits for the frame to navigate to a new URL. It is useful for when you run code which will indirectly cause
the frame to navigate. Consider this example:

```js
// Start waiting for navigation before clicking. Note no await.
const navigationPromise = page.waitForNavigation();
await page.getByText('Navigate after timeout').click();
await navigationPromise;
```

:::note
Usage of the [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API) to change the URL is considered
a navigation.
:::

## async method: Frame.waitForNavigation
* since: v1.8
* deprecated: This method is inherently racy, please use `Frame.waitForURL()` instead.
* langs: python
- returns: <[EventContextManager]<[Response]>>

### param: Frame.waitForNavigation.action = %%-csharp-wait-for-event-action-%%
* since: v1.12

### option: Frame.waitForNavigation.url = %%-js-wait-for-navigation-url-%%
* since: v1.8

### option: Frame.waitForNavigation.url = %%-python-csharp-java-wait-for-navigation-url-%%
* since: v1.8

### option: Frame.waitForNavigation.waitUntil = %%-navigation-wait-until-%%
* since: v1.8

### option: Frame.waitForNavigation.timeout = %%-navigation-timeout-%%
* since: v1.8

### option: Frame.waitForNavigation.timeout = %%-navigation-timeout-js-%%
* since: v1.8
### option: Frame.waitForNavigation.signal = %%-wait-for-event-signal-%%

### param: Frame.waitForNavigation.callback = %%-java-wait-for-event-callback-%%
* since: v1.9

## async method: Frame.waitForSelector
* since: v1.8
* discouraged: Use web assertions that assert visibility or a locator-based `Locator.waitFor()` instead.
  Read more about [locators](../locators.md).
- returns: <[null]|[ElementHandle]>

Returns when element specified by selector satisfies `state` option. Returns `null` if waiting for `hidden` or
`detached`.

:::note
Playwright automatically waits for element to be ready before performing an action. Using
[Locator] objects and web-first assertions make the code wait-for-selector-free.
:::

Wait for the `selector` to satisfy `state` option (either appear/disappear from dom, or become
visible/hidden). If at the moment of calling the method `selector` already satisfies the condition, the method
will return immediately. If the selector doesn't satisfy the condition for the `timeout` milliseconds, the
function will throw.

**Usage**

This method works across navigations:

```js
const { chromium } = require('playwright');  // Or 'firefox' or 'webkit'.

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const currentURL of ['https://google.com', 'https://bbc.com']) {
    await page.goto(currentURL);
    const element = await page.mainFrame().waitForSelector('img');
    console.log('Loaded image: ' + await element.getAttribute('src'));
  }
  await browser.close();
})();
```

### param: Frame.waitForSelector.selector = %%-query-selector-%%
* since: v1.8

### option: Frame.waitForSelector.state = %%-wait-for-selector-state-%%
* since: v1.8

### option: Frame.waitForSelector.strict = %%-input-strict-%%
* since: v1.14

### option: Frame.waitForSelector.timeout = %%-input-timeout-%%
* since: v1.8

### option: Frame.waitForSelector.timeout = %%-input-timeout-js-%%
* since: v1.8

### option: Frame.waitForSelector.signal = %%-input-signal-%%

## async method: Frame.waitForTimeout
* since: v1.8
* discouraged: Never wait for timeout in production. Tests that wait for time are
  inherently flaky. Use [Locator] actions and web assertions that wait automatically.

Waits for the given `timeout` in milliseconds.

Note that `frame.waitForTimeout()` should only be used for debugging. Tests using the timer in production are going to
be flaky. Use signals such as network events, selectors becoming visible and others instead.

### param: Frame.waitForTimeout.timeout
* since: v1.8
- `timeout` <[float]>

A timeout to wait for

## async method: Frame.waitForURL
* since: v1.11

Waits for the frame to navigate to the given URL.

**Usage**

```js
await frame.click('a.delayed-navigation'); // Clicking the link will indirectly cause a navigation
await frame.waitForURL('**/target.html');
```

### param: Frame.waitForURL.url = %%-js-wait-for-navigation-url-%%
* since: v1.11

### param: Frame.waitForURL.url = %%-python-csharp-java-wait-for-navigation-url-%%
* since: v1.11

### option: Frame.waitForURL.timeout = %%-navigation-timeout-%%
* since: v1.11

### option: Frame.waitForURL.timeout = %%-navigation-timeout-js-%%
* since: v1.11
### option: Frame.waitForURL.signal = %%-wait-for-event-signal-%%

### option: Frame.waitForURL.waitUntil = %%-navigation-wait-until-%%
* since: v1.11
