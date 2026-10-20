# class: Locator
* since: v1.14

Locators are the central piece of Playwright's auto-waiting and retry-ability. In a nutshell, locators represent
a way to find element(s) on the page at any moment. A locator can be created with the `Page.locator()` method.

[Learn more about locators](../locators.md).

## async method: Locator.all
* since: v1.29
- returns: <[Array]<[Locator]>>

When the locator points to a list of elements, this returns an array of locators, pointing to their respective elements.

:::note
`Locator.all()` does not wait for elements to match the locator, and instead immediately returns whatever is present in the page.

When the list of elements changes dynamically, `Locator.all()` will produce unpredictable and flaky results.

When the list of elements is stable, but loaded dynamically, wait for the full list to finish loading before calling `Locator.all()`.
:::

**Usage**

```js
for (const li of await page.getByRole('listitem').all())
  await li.click();
```

## async method: Locator.allInnerTexts
* since: v1.14
- returns: <[Array]<[string]>>

Returns an array of `node.innerText` values for all matching nodes.

:::warning[Asserting text]
If you need to assert text on the page, prefer `LocatorAssertions.toHaveText()` with `LocatorAssertions.toHaveText.useInnerText` option to avoid flakiness. See [assertions guide](../test-assertions.md) for more details.
:::

**Usage**

```js
const texts = await page.getByRole('link').allInnerTexts();
```

## async method: Locator.allTextContents
* since: v1.14
- returns: <[Array]<[string]>>

Returns an array of `node.textContent` values for all matching nodes.

:::warning[Asserting text]
If you need to assert text on the page, prefer `LocatorAssertions.toHaveText()` to avoid flakiness. See [assertions guide](../test-assertions.md) for more details.
:::

**Usage**

```js
const texts = await page.getByRole('link').allTextContents();
```

## method: Locator.and
* since: v1.34
* langs:
  - alias-python: and_
- returns: <[Locator]>

Creates a locator that matches both this locator and the argument locator.

**Usage**

The following example finds a button with a specific title.

```js
const button = page.getByRole('button').and(page.getByTitle('Subscribe'));
```

### param: Locator.and.locator
* since: v1.34
- `locator` <[Locator]>

Additional locator to match.

## async method: Locator.ariaSnapshot
* since: v1.49
- returns: <[string]>

Captures the aria snapshot of the given element.
Read more about [aria snapshots](../aria-snapshots.md) and `LocatorAssertions.toMatchAriaSnapshot()` for the corresponding assertion.

**Usage**

```js
await page.getByRole('link').ariaSnapshot();
```

**Details**

This method captures the aria snapshot of the given element. The snapshot is a string that represents the state of the element and its children.
The snapshot can be used to assert the state of the element in the test, or to compare it to state in the future.

The ARIA snapshot is represented using [YAML](https://yaml.org/spec/1.2.2/) markup language:
* The keys of the objects are the roles and optional accessible names of the elements.
* The values are either text content or an array of child elements.
* Generic static text can be represented with the `text` key.

Below is the HTML markup and the respective ARIA snapshot:

```html
<ul aria-label="Links">
  <li><a href="/">Home</a></li>
  <li><a href="/about">About</a></li>
<ul>
```

```yml
- list "Links":
  - listitem:
    - link "Home"
  - listitem:
    - link "About"
```

An AI-optimized snapshot, controlled by `Locator.ariaSnapshot.mode`, is different from a default snapshot:
1. Includes element references `[ref=e2]`.
2. Does not wait for an element matching the locator, and throws when no elements match.
3. Includes snapshots of `<iframe>`s inside the target.

### option: Locator.ariaSnapshot.mode
* since: v1.59
- `mode` <[AriaSnapshotMode]<"ai"|"default">>

When set to `"ai"`, returns a snapshot optimized for AI consumption. Defaults to `"default"`. See details for more information.

### option: Locator.ariaSnapshot.timeout = %%-input-timeout-%%
* since: v1.49

### option: Locator.ariaSnapshot.timeout = %%-input-timeout-js-%%
* since: v1.49

### option: Locator.ariaSnapshot.signal = %%-input-signal-%%

### option: Locator.ariaSnapshot.depth
* since: v1.59
- `depth` <[int]>

When specified, limits the depth of the snapshot.

### option: Locator.ariaSnapshot.boxes
* since: v1.60
- `boxes` <[boolean]>

When `true`, appends each element's bounding box as `[box=x,y,width,height]` to the snapshot. Coordinates are
relative to the viewport, in CSS pixels, as returned by [`Element.getBoundingClientRect()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect).
Defaults to `false`.

## async method: Locator.ariaSnapshotJSON
* since: v1.63
* langs: js
- returns: <[Serializable]>

Captures the aria snapshot of the given element as a free form JSON object.

**Usage**

```js
await page.getByRole('list').ariaSnapshotJSON();
```

**Details**

This method returns the same tree as `Locator.ariaSnapshot()`, serialized as a JSON value instead of YAML markup.
The result is a list of nodes, each node being an object with the following properties:
* `role` Aria role of the element, or `"text"` for a static text fragment.
* `name` Accessible name of the element, if any.
* `text` Text content of the element when it is the only child, or the content of a static text fragment.
* `children` Child nodes and text fragments.
* Boolean and value properties for element state flags: `checked`, `disabled`, `expanded`, `active`, `invalid`, `level`, `pressed` and `selected`.
* Additional element properties, for example `url` for links and `placeholder` for text boxes.
* `ref` Element reference for AI-optimized snapshots.
* `cursor` Set to `"pointer"` for clickable elements in AI-optimized snapshots.
* `box` Bounding box of the element when `Locator.ariaSnapshotJSON.boxes` is set.

### option: Locator.ariaSnapshotJSON.mode
* since: v1.63
- `mode` <[AriaSnapshotMode]<"ai"|"default">>

When set to `"ai"`, returns a snapshot optimized for AI consumption. Defaults to `"default"`. See details in `Locator.ariaSnapshot()`.

### option: Locator.ariaSnapshotJSON.timeout = %%-input-timeout-%%
* since: v1.63

### option: Locator.ariaSnapshotJSON.timeout = %%-input-timeout-js-%%
* since: v1.63

### option: Locator.ariaSnapshotJSON.signal = %%-input-signal-%%

### option: Locator.ariaSnapshotJSON.depth
* since: v1.63
- `depth` <[int]>

When specified, limits the depth of the snapshot.

### option: Locator.ariaSnapshotJSON.boxes
* since: v1.63
- `boxes` <[boolean]>

When `true`, includes each element's bounding box as a `box` property with `x`, `y`, `width` and `height`. Coordinates are
relative to the viewport, in CSS pixels, as returned by [`Element.getBoundingClientRect()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect).
Defaults to `false`.

## async method: Locator.blur
* since: v1.28

Calls [blur](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/blur) on the element.

### option: Locator.blur.timeout = %%-input-timeout-%%
* since: v1.28

### option: Locator.blur.timeout = %%-input-timeout-js-%%
* since: v1.28

### option: Locator.blur.signal = %%-input-signal-%%

## async method: Locator.boundingBox
* since: v1.14
- returns: <[null]|[Object]>
  * alias: BoundingBox
  * alias-csharp: LocatorBoundingBoxResult
  - `x` <[float]> the x coordinate of the element in pixels.
  - `y` <[float]> the y coordinate of the element in pixels.
  - `width` <[float]> the width of the element in pixels.
  - `height` <[float]> the height of the element in pixels.

This method returns the bounding box of the element matching the locator, or `null` if the element is not visible. The bounding box is
calculated relative to the main frame viewport - which is usually the same as the browser window.

**Details**

Scrolling affects the returned bounding box, similarly to
[Element.getBoundingClientRect](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect). That
means `x` and/or `y` may be negative.

Elements from child frames return the bounding box relative to the main frame, unlike the
[Element.getBoundingClientRect](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect).

Assuming the page is static, it is safe to use bounding box coordinates to perform input. For example, the following
snippet should click the center of the element.

**Usage**

```js
const box = await page.getByRole('button').boundingBox();
await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
```

### option: Locator.boundingBox.timeout = %%-input-timeout-%%
* since: v1.14

### option: Locator.boundingBox.timeout = %%-input-timeout-js-%%
* since: v1.14

### option: Locator.boundingBox.signal = %%-input-signal-%%

## async method: Locator.check
* since: v1.14

Ensure that checkbox or radio element is checked.

**Details**

Performs the following steps:
1. Ensure that element is a checkbox or a radio input. If not, this method throws. If the element is already
   checked, this method returns immediately.
1. Wait for [actionability](../actionability.md) checks on the element, unless `force` option is set.
1. Scroll the element into view if needed.
1. Use `Page.mouse` to click in the center of the element.
1. Ensure that the element is now checked. If not, this method throws.

If the element is detached from the DOM at any moment during the action, this method throws.

When all steps combined have not finished during the specified `timeout`, this method throws a
[TimeoutError]. Passing zero timeout disables this.

**Usage**

```js
await page.getByRole('checkbox').check();
```

### option: Locator.check.position = %%-input-position-%%
* since: v1.14

### option: Locator.check.force = %%-input-force-%%
* since: v1.14

### option: Locator.check.scroll = %%-input-scroll-%%
* since: v1.62

### option: Locator.check.noWaitAfter = %%-input-no-wait-after-removed-%%
* since: v1.14

### option: Locator.check.timeout = %%-input-timeout-%%
* since: v1.14

### option: Locator.check.timeout = %%-input-timeout-js-%%
* since: v1.14

### option: Locator.check.signal = %%-input-signal-%%

### option: Locator.check.trial = %%-input-trial-%%
* since: v1.14

## async method: Locator.clear
* since: v1.28

Clear the input field.

**Details**

This method waits for [actionability](../actionability.md) checks, focuses the element, clears it and triggers an `input` event after clearing.

If the target element is not an `<input>`, `<textarea>` or `[contenteditable]` element, this method throws an error. However, if the element is inside the `<label>` element that has an associated [control](https://developer.mozilla.org/en-US/docs/Web/API/HTMLLabelElement/control), the control will be cleared instead.

**Usage**

```js
await page.getByRole('textbox').clear();
```

### option: Locator.clear.force = %%-input-force-%%
* since: v1.28

### option: Locator.clear.noWaitAfter = %%-input-no-wait-after-removed-%%
* since: v1.28

### option: Locator.clear.timeout = %%-input-timeout-%%
* since: v1.28

### option: Locator.clear.timeout = %%-input-timeout-js-%%
* since: v1.28

### option: Locator.clear.signal = %%-input-signal-%%

## async method: Locator.click
* since: v1.14

Click an element.

**Details**

This method clicks the element by performing the following steps:
1. Wait for [actionability](../actionability.md) checks on the element, unless `force` option is set.
1. Scroll the element into view if needed.
1. Use `Page.mouse` to click in the center of the element, or the specified `position`.
1. Wait for initiated navigations to either succeed or fail, unless `noWaitAfter` option is set.

If the element is detached from the DOM at any moment during the action, this method throws.

When all steps combined have not finished during the specified `timeout`, this method throws a
[TimeoutError]. Passing zero timeout disables this.

**Usage**

Click a button:

```js
await page.getByRole('button').click();
```

Shift-right-click at a specific position on a canvas:

```js
await page.locator('canvas').click({
  button: 'right',
  modifiers: ['Shift'],
  position: { x: 23, y: 32 },
});
```

### option: Locator.click.button = %%-input-button-%%
* since: v1.14

### option: Locator.click.clickCount = %%-input-click-count-%%
* since: v1.14

### option: Locator.click.delay = %%-input-down-up-delay-%%
* since: v1.14

### option: Locator.click.position = %%-input-position-%%
* since: v1.14

### option: Locator.click.modifiers = %%-input-modifiers-%%
* since: v1.14

### option: Locator.click.force = %%-input-force-%%
* since: v1.14

### option: Locator.click.scroll = %%-input-scroll-%%
* since: v1.62

### option: Locator.click.noWaitAfter = %%-input-no-wait-after-%%
* since: v1.14

### option: Locator.click.timeout = %%-input-timeout-%%
* since: v1.14

### option: Locator.click.timeout = %%-input-timeout-js-%%
* since: v1.14

### option: Locator.click.signal = %%-input-signal-%%

### option: Locator.click.trial = %%-input-trial-with-modifiers-%%
* since: v1.14

### option: Locator.click.steps = %%-input-mousemove-steps-%%
* since: v1.57

## async method: Locator.count
* since: v1.14
- returns: <[int]>

Returns the number of elements matching the locator.

:::warning[Asserting count]
If you need to assert the number of elements on the page, prefer `LocatorAssertions.toHaveCount()` to avoid flakiness. See [assertions guide](../test-assertions.md) for more details.
:::

**Usage**

```js
const count = await page.getByRole('listitem').count();
```

## async method: Locator.dblclick
* since: v1.14
* langs:
  - alias-csharp: DblClickAsync

Double-click an element.

**Details**

This method double clicks the element by performing the following steps:
1. Wait for [actionability](../actionability.md) checks on the element, unless `force` option is set.
1. Scroll the element into view if needed.
1. Use `Page.mouse` to double click in the center of the element, or the specified `position`.

If the element is detached from the DOM at any moment during the action, this method throws.

When all steps combined have not finished during the specified `timeout`, this method throws a
[TimeoutError]. Passing zero timeout disables this.

:::note
`element.dblclick()` dispatches two `click` events and a single `dblclick` event.
:::

### option: Locator.dblclick.button = %%-input-button-%%
* since: v1.14

### option: Locator.dblclick.delay = %%-input-down-up-delay-%%
* since: v1.14

### option: Locator.dblclick.position = %%-input-position-%%
* since: v1.14

### option: Locator.dblclick.modifiers = %%-input-modifiers-%%
* since: v1.14

### option: Locator.dblclick.force = %%-input-force-%%
* since: v1.14

### option: Locator.dblclick.scroll = %%-input-scroll-%%
* since: v1.62

### option: Locator.dblclick.noWaitAfter = %%-input-no-wait-after-removed-%%
* since: v1.14

### option: Locator.dblclick.timeout = %%-input-timeout-%%
* since: v1.14

### option: Locator.dblclick.timeout = %%-input-timeout-js-%%
* since: v1.14

### option: Locator.dblclick.signal = %%-input-signal-%%

### option: Locator.dblclick.trial = %%-input-trial-with-modifiers-%%
* since: v1.14

### option: Locator.dblclick.steps = %%-input-mousemove-steps-%%
* since: v1.57

## method: Locator.describe
* since: v1.53
- returns: <[Locator]>

Describes the locator, description is used in the trace viewer and reports.
Returns the locator pointing to the same element.

**Usage**

```js
const button = page.getByTestId('btn-sub').describe('Subscribe button');
await button.click();
```

### param: Locator.describe.description
* since: v1.53
- `description` <[string]>

Locator description.

## method: Locator.description
* since: v1.57
* langs: python, java, csharp
- returns: <[null]|[string]>

Returns locator description previously set with `Locator.describe()`. Returns `null` if no custom description has been set.

**Usage**

## method: Locator.description
* since: v1.57
* langs: js
- returns: <[null]|[string]>

Returns locator description previously set with `Locator.describe()`. Returns `null` if no custom description has been set. Prefer `Locator.toString()` for a human-readable representation, as it uses the description when available.

**Usage**

```js
const button = page.getByRole('button').describe('Subscribe button');
console.log(button.description()); // "Subscribe button"

const input = page.getByRole('textbox');
console.log(input.description()); // null
```

## async method: Locator.dispatchEvent
* since: v1.14

Programmatically dispatch an event on the matching element.

**Usage**

```js
await locator.dispatchEvent('click');
```

**Details**

The snippet above dispatches the `click` event on the element. Regardless of the visibility state of the element, `click`
is dispatched. This is equivalent to calling
[element.click()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/click).

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

You can also specify [JSHandle] as the property value if you want live objects to be passed into the event:

```js
const dataTransfer = await page.evaluateHandle(() => new DataTransfer());
await locator.dispatchEvent('dragstart', { dataTransfer });
```

### param: Locator.dispatchEvent.type
* since: v1.14
- `type` <[string]>

DOM event type: `"click"`, `"dragstart"`, etc.

### param: Locator.dispatchEvent.eventInit
* since: v1.14
- `eventInit` ?<[EvaluationArgument]>

Optional event-specific initialization properties.

### option: Locator.dispatchEvent.timeout = %%-input-timeout-%%
* since: v1.14

### option: Locator.dispatchEvent.timeout = %%-input-timeout-js-%%
* since: v1.14

### option: Locator.dispatchEvent.signal = %%-input-signal-%%

## async method: Locator.dragTo
* since: v1.18

Drag the source element towards the target element and drop it.

**Details**

This method drags the locator to another target locator or target position. It will
first move to the source element, perform a `mousedown`, then move to the target
element or position and perform a `mouseup`.

**Usage**

```js
const source = page.locator('#source');
const target = page.locator('#target');

await source.dragTo(target);
// or specify exact positions relative to the top-left corners of the elements:
await source.dragTo(target, {
  sourcePosition: { x: 34, y: 7 },
  targetPosition: { x: 10, y: 20 },
});
```

### param: Locator.dragTo.target
* since: v1.18
- `target` <[Locator]>

Locator of the element to drag to.

### option: Locator.dragTo.force = %%-input-force-%%
* since: v1.18

### option: Locator.dragTo.scroll = %%-input-scroll-%%
* since: v1.62

### option: Locator.dragTo.noWaitAfter = %%-input-no-wait-after-removed-%%
* since: v1.18

### option: Locator.dragTo.timeout = %%-input-timeout-%%
* since: v1.18

### option: Locator.dragTo.timeout = %%-input-timeout-js-%%
* since: v1.18

### option: Locator.dragTo.signal = %%-input-signal-%%

### option: Locator.dragTo.trial = %%-input-trial-%%
* since: v1.18

### option: Locator.dragTo.sourcePosition = %%-input-source-position-%%
* since: v1.18

### option: Locator.dragTo.targetPosition = %%-input-target-position-%%
* since: v1.18

### option: Locator.dragTo.steps = %%-input-drag-steps-%%
* since: v1.57

## async method: Locator.drop
* since: v1.60

Simulate an external drag-and-drop of files or clipboard-like data onto this locator.

**Details**

Dispatches the native `dragenter`, `dragover`, and `drop` events at the center of the
target element with a synthetic [DataTransfer] carrying the provided files and/or data
entries. Works cross-browser by constructing the [DataTransfer] in the page context.

If the target element's `dragover` listener does not call `preventDefault()`, the target
is considered to have rejected the drop: Playwright dispatches `dragleave` and this
method throws.

**Usage**

Drop a file buffer onto an upload area:

```js
await page.locator('#dropzone').drop({
  files: { name: 'note.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') },
});
```

Drop plain text and a URL together:

```js
await page.locator('#dropzone').drop({
  data: {
    'text/plain': 'hello world',
    'text/uri-list': 'https://example.com',
  },
});
```

### param: Locator.drop.payload = %%-drop-payload-%%
* since: v1.60

### option: Locator.drop.position = %%-input-position-%%
* since: v1.60

### option: Locator.drop.timeout = %%-input-timeout-%%
* since: v1.60

### option: Locator.drop.timeout = %%-input-timeout-js-%%
* since: v1.60

### option: Locator.drop.signal = %%-input-signal-%%

## async method: Locator.elementHandle
* since: v1.14
* discouraged: Always prefer using [Locator]s and web assertions over [ElementHandle]s because latter are inherently racy.
- returns: <[ElementHandle]>

Resolves given locator to the first matching DOM element. If there are no matching elements, waits for one. If multiple elements match the locator, throws.

### option: Locator.elementHandle.timeout = %%-input-timeout-%%
* since: v1.14

### option: Locator.elementHandle.timeout = %%-input-timeout-js-%%
* since: v1.14

### option: Locator.elementHandle.signal = %%-input-signal-%%

## async method: Locator.elementHandles
* since: v1.14
* discouraged: Always prefer using [Locator]s and web assertions over [ElementHandle]s because latter are inherently racy.
- returns: <[Array]<[ElementHandle]>>

Resolves given locator to all matching DOM elements. If there are no matching elements, returns an empty list.

## method: Locator.contentFrame
* since: v1.43
- returns: <[FrameLocator]>

Returns a [FrameLocator] object pointing to the same `iframe` as this locator.

Useful when you have a [Locator] object obtained somewhere, and later on would like to interact with the content inside the frame.

For a reverse operation, use `FrameLocator.owner()`.

**Usage**

```js
const locator = page.locator('iframe[name="embedded"]');
// ...
const frameLocator = locator.contentFrame();
await frameLocator.getByRole('button').click();
```

## async method: Locator.evaluate
* since: v1.14
- returns: <[Serializable]>

Execute JavaScript code in the page, taking the matching element as an argument.

**Details**

Returns the return value of `expression`, called with the matching element as a first argument, and `arg` as a second argument.

If `expression` returns a [Promise], this method will wait for the promise to resolve and return its value.

If `expression` throws or rejects, this method throws.

**Usage**

Passing argument to `expression`:

```js
const result = await page.getByTestId('myId').evaluate((element, [x, y]) => {
  return element.textContent + ' ' + x * y;
}, [7, 8]);
console.log(result); // prints "myId text 56"
```

### param: Locator.evaluate.expression = %%-evaluate-expression-%%
* since: v1.14

### param: Locator.evaluate.expression = %%-js-evaluate-pagefunction-%%
* since: v1.14

### param: Locator.evaluate.arg
* since: v1.14
- `arg` ?<[EvaluationArgument]>

Optional argument to pass to `expression`.

### option: Locator.evaluate.exposeFunctions = %%-js-evaluate-expose-functions-%%
* since: v1.62

### option: Locator.evaluate.timeout
* since: v1.14
* langs: python, java, csharp
- `timeout` <[float]>

Maximum time in milliseconds to wait for the locator before evaluating. Note that after locator is resolved, evaluation itself is not limited by the timeout. Defaults to `30000` (30 seconds). Pass `0` to disable timeout.

### option: Locator.evaluate.timeout
* since: v1.14
* langs: js
- `timeout` <[float]>

Maximum time in milliseconds to wait for the locator before evaluating. Note that after locator is resolved, evaluation itself is not limited by the timeout. Defaults to `0` - no timeout.

### option: Locator.evaluate.signal = %%-input-signal-%%

## async method: Locator.evaluateAll
* since: v1.14
- returns: <[Serializable]>

Execute JavaScript code in the page, taking all matching elements as an argument.

**Details**

Returns the return value of `expression`, called with an array of all matching elements as a first argument, and `arg` as a second argument.

If `expression` returns a [Promise], this method will wait for the promise to resolve and return its value.

If `expression` throws or rejects, this method throws.

**Usage**

```js
const locator = page.locator('div');
const moreThanTen = await locator.evaluateAll((divs, min) => divs.length > min, 10);
```

### param: Locator.evaluateAll.expression = %%-evaluate-expression-%%
* since: v1.14

### param: Locator.evaluateAll.expression = %%-js-evaluate-pagefunction-%%
* since: v1.14

### param: Locator.evaluateAll.arg
* since: v1.14
- `arg` ?<[EvaluationArgument]>

Optional argument to pass to `expression`.

## async method: Locator.evaluateHandle
* since: v1.14
- returns: <[JSHandle]>

Execute JavaScript code in the page, taking the matching element as an argument, and return a [JSHandle] with the result.

**Details**

Returns the return value of `expression` as a[JSHandle], called with the matching element as a first argument, and `arg` as a second argument.

The only difference between `Locator.evaluate()` and `Locator.evaluateHandle()` is that `Locator.evaluateHandle()` returns [JSHandle].

If `expression` returns a [Promise], this method will wait for the promise to resolve and return its value.

If `expression` throws or rejects, this method throws.

See `Page.evaluateHandle()` for more details.

### param: Locator.evaluateHandle.expression = %%-evaluate-expression-%%
* since: v1.14

### param: Locator.evaluateHandle.expression = %%-js-evaluate-pagefunction-%%
* since: v1.14

### param: Locator.evaluateHandle.arg
* since: v1.14
- `arg` ?<[EvaluationArgument]>

Optional argument to pass to `expression`.

### option: Locator.evaluateHandle.exposeFunctions = %%-js-evaluate-expose-functions-%%
* since: v1.62

### option: Locator.evaluateHandle.timeout
* since: v1.14
* langs: python, java, csharp
- `timeout` <[float]>

Maximum time in milliseconds to wait for the locator before evaluating. Note that after locator is resolved, evaluation itself is not limited by the timeout. Defaults to `30000` (30 seconds). Pass `0` to disable timeout.

### option: Locator.evaluateHandle.timeout
* since: v1.14
* langs: js
- `timeout` <[float]>

Maximum time in milliseconds to wait for the locator before evaluating. Note that after locator is resolved, evaluation itself is not limited by the timeout. Defaults to `0` - no timeout.

### option: Locator.evaluateHandle.signal = %%-input-signal-%%

## async method: Locator.fill
* since: v1.14

Set a value to the input field.

**Usage**

```js
await page.getByRole('textbox').fill('example value');
```

**Details**

This method waits for [actionability](../actionability.md) checks, focuses the element, fills it and triggers an `input` event after filling. Note that you can pass an empty string to clear the input field.

If the target element is not an `<input>`, `<textarea>` or `[contenteditable]` element, this method throws an error. However, if the element is inside the `<label>` element that has an associated [control](https://developer.mozilla.org/en-US/docs/Web/API/HTMLLabelElement/control), the control will be filled instead.

To send fine-grained keyboard events, use `Locator.pressSequentially()`.

### param: Locator.fill.value
* since: v1.14
- `value` <[string]>

Value to set for the `<input>`, `<textarea>` or `[contenteditable]` element.

### option: Locator.fill.force = %%-input-force-%%
* since: v1.14

### option: Locator.fill.noWaitAfter = %%-input-no-wait-after-removed-%%
* since: v1.14

### option: Locator.fill.timeout = %%-input-timeout-%%
* since: v1.14

### option: Locator.fill.timeout = %%-input-timeout-js-%%
* since: v1.14

### option: Locator.fill.signal = %%-input-signal-%%

## method: Locator.filter
* since: v1.22
- returns: <[Locator]>

This method narrows existing locator according to the options, for example filters by text.
It can be chained to filter multiple times.

**Usage**

```js
const rowLocator = page.locator('tr');
// ...
await rowLocator
    .filter({ hasText: 'text in column 1' })
    .filter({ has: page.getByRole('button', { name: 'column 2 button' }) })
    .screenshot();
```

### option: Locator.filter.-inline- = %%-locator-options-list-v1.14-%%
* since: v1.22

### option: Locator.filter.hasNot = %%-locator-option-has-not-%%
* since: v1.33

### option: Locator.filter.hasNotText = %%-locator-option-has-not-text-%%
* since: v1.33

### option: Locator.filter.visible = %%-locator-option-visible-%%
* since: v1.51

## method: Locator.first
* since: v1.14
- returns: <[Locator]>

Returns locator to the first matching element.

## async method: Locator.focus
* since: v1.14

Calls [focus](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus) on the matching element.

### option: Locator.focus.timeout = %%-input-timeout-%%
* since: v1.14

### option: Locator.focus.timeout = %%-input-timeout-js-%%
* since: v1.14

### option: Locator.focus.signal = %%-input-signal-%%

## method: Locator.frameLocator
* since: v1.17
- returns: <[FrameLocator]>

When working with iframes, you can create a frame locator that will enter the iframe and allow locating elements
in that iframe:

**Usage**

```js
const locator = page.frameLocator('iframe').getByText('Submit');
await locator.click();
```

### param: Locator.frameLocator.selector = %%-find-selector-%%
* since: v1.17

## async method: Locator.getAttribute
* since: v1.14
- returns: <[null]|[string]>

Returns the matching element's attribute value.

:::warning[Asserting attributes]
If you need to assert an element's attribute, prefer `LocatorAssertions.toHaveAttribute()` to avoid flakiness. See [assertions guide](../test-assertions.md) for more details.
:::

### param: Locator.getAttribute.name
* since: v1.14
- `name` <[string]>

Attribute name to get the value for.

### option: Locator.getAttribute.timeout = %%-input-timeout-%%
* since: v1.14

### option: Locator.getAttribute.timeout = %%-input-timeout-js-%%
* since: v1.14

### option: Locator.getAttribute.signal = %%-input-signal-%%

## method: Locator.getByAltText
* since: v1.27
- returns: <[Locator]>

%%-template-locator-get-by-alt-text-%%

### param: Locator.getByAltText.text = %%-locator-get-by-text-text-%%

### option: Locator.getByAltText.exact = %%-locator-get-by-text-exact-%%

## method: Locator.getByLabel
* since: v1.27
- returns: <[Locator]>

%%-template-locator-get-by-label-text-%%

### param: Locator.getByLabel.text = %%-locator-get-by-text-text-%%

### option: Locator.getByLabel.exact = %%-locator-get-by-text-exact-%%

## method: Locator.getByPlaceholder
* since: v1.27
- returns: <[Locator]>

%%-template-locator-get-by-placeholder-text-%%

### param: Locator.getByPlaceholder.text = %%-locator-get-by-text-text-%%

### option: Locator.getByPlaceholder.exact = %%-locator-get-by-text-exact-%%

## method: Locator.getByRole
* since: v1.27
- returns: <[Locator]>

%%-template-locator-get-by-role-%%

### param: Locator.getByRole.role = %%-get-by-role-to-have-role-role-%%
* since: v1.27

### option: Locator.getByRole.-inline- = %%-locator-get-by-role-option-list-v1.27-%%
* since: v1.27

### option: Locator.getByRole.exact = %%-locator-get-by-role-option-exact-%%

### option: Locator.getByRole.description = %%-locator-get-by-role-option-description-%%

## method: Locator.getByTestId
* since: v1.27
- returns: <[Locator]>

%%-template-locator-get-by-test-id-%%

### param: Locator.getByTestId.testId = %%-locator-get-by-test-id-test-id-%%
* since: v1.27

## method: Locator.getByText
* since: v1.27
- returns: <[Locator]>

%%-template-locator-get-by-text-%%

### param: Locator.getByText.text = %%-locator-get-by-text-text-%%

### option: Locator.getByText.exact = %%-locator-get-by-text-exact-%%

## method: Locator.getByTitle
* since: v1.27
- returns: <[Locator]>

%%-template-locator-get-by-title-%%

### param: Locator.getByTitle.text = %%-locator-get-by-text-text-%%

### option: Locator.getByTitle.exact = %%-locator-get-by-text-exact-%%

## async method: Locator.hideHighlight
* since: v1.60

Hides the element highlight previously added by `Locator.highlight()`.

## async method: Locator.highlight
* since: v1.20
- returns: <[Disposable]>

Highlight the corresponding element(s) on the screen. Useful for debugging, don't commit the code that uses `Locator.highlight()`.

### option: Locator.highlight.style
* since: v1.60
* langs: js
- `style` <[string]|[Object]<[string], [string]|[number]>>

Inline CSS applied to the highlight overlay, e.g.

```js
await locator.highlight({ style: 'outline: 2px dashed red' });
await locator.highlight({ style: { color: 'red' } });
```

### option: Locator.highlight.style
* since: v1.60
* langs: java, python, csharp
- `style` <[string]>

Additional inline CSS applied to the highlight overlay, e.g. `"outline: 2px dashed red"`.

## async method: Locator.hover
* since: v1.14

Hover over the matching element.

**Usage**

```js
await page.getByRole('link').hover();
```

**Details**

This method hovers over the element by performing the following steps:
1. Wait for [actionability](../actionability.md) checks on the element, unless `force` option is set.
1. Scroll the element into view if needed.
1. Use `Page.mouse` to hover over the center of the element, or the specified `position`.

If the element is detached from the DOM at any moment during the action, this method throws.

When all steps combined have not finished during the specified `timeout`, this method throws a
[TimeoutError]. Passing zero timeout disables this.

### option: Locator.hover.position = %%-input-position-%%
* since: v1.14

### option: Locator.hover.modifiers = %%-input-modifiers-%%
* since: v1.14

### option: Locator.hover.force = %%-input-force-%%
* since: v1.14

### option: Locator.hover.scroll = %%-input-scroll-%%
* since: v1.62

### option: Locator.hover.timeout = %%-input-timeout-%%
* since: v1.14

### option: Locator.hover.timeout = %%-input-timeout-js-%%
* since: v1.14

### option: Locator.hover.signal = %%-input-signal-%%

### option: Locator.hover.trial = %%-input-trial-with-modifiers-%%
* since: v1.14

### option: Locator.hover.noWaitAfter = %%-input-no-wait-after-removed-%%
* since: v1.28

## async method: Locator.innerHTML
* since: v1.14
- returns: <[string]>

Returns the [`element.innerHTML`](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML).

### option: Locator.innerHTML.timeout = %%-input-timeout-%%
* since: v1.14

### option: Locator.innerHTML.timeout = %%-input-timeout-js-%%
* since: v1.14

### option: Locator.innerHTML.signal = %%-input-signal-%%

## async method: Locator.innerText
* since: v1.14
- returns: <[string]>

Returns the [`element.innerText`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText).

:::warning[Asserting text]
If you need to assert text on the page, prefer `LocatorAssertions.toHaveText()` with `LocatorAssertions.toHaveText.useInnerText` option to avoid flakiness. See [assertions guide](../test-assertions.md) for more details.
:::

### option: Locator.innerText.timeout = %%-input-timeout-%%
* since: v1.14

### option: Locator.innerText.timeout = %%-input-timeout-js-%%
* since: v1.14

### option: Locator.innerText.signal = %%-input-signal-%%

## async method: Locator.inputValue
* since: v1.14
- returns: <[string]>

Returns the value for the matching `<input>` or `<textarea>` or `<select>` element.

:::warning[Asserting value]
If you need to assert input value, prefer `LocatorAssertions.toHaveValue()` to avoid flakiness. See [assertions guide](../test-assertions.md) for more details.
:::

**Usage**

```js
const value = await page.getByRole('textbox').inputValue();
```

**Details**

Throws elements that are not an input, textarea or a select. However, if the element is inside the `<label>` element that has an associated [control](https://developer.mozilla.org/en-US/docs/Web/API/HTMLLabelElement/control), returns the value of the control.

### option: Locator.inputValue.timeout = %%-input-timeout-%%
* since: v1.14

### option: Locator.inputValue.timeout = %%-input-timeout-js-%%
* since: v1.14

### option: Locator.inputValue.signal = %%-input-signal-%%

## async method: Locator.isChecked
* since: v1.14
- returns: <[boolean]>

Returns whether the element is checked. Throws if the element is not a checkbox or radio input.

:::warning[Asserting checked state]
If you need to assert that checkbox is checked, prefer `LocatorAssertions.toBeChecked()` to avoid flakiness. See [assertions guide](../test-assertions.md) for more details.
:::

**Usage**

```js
const checked = await page.getByRole('checkbox').isChecked();
```

### option: Locator.isChecked.timeout = %%-input-timeout-%%
* since: v1.14

### option: Locator.isChecked.timeout = %%-input-timeout-js-%%
* since: v1.14

### option: Locator.isChecked.signal = %%-input-signal-%%

## async method: Locator.isDisabled
* since: v1.14
- returns: <[boolean]>

Returns whether the element is disabled, the opposite of [enabled](../actionability.md#enabled).

:::warning[Asserting disabled state]
If you need to assert that an element is disabled, prefer `LocatorAssertions.toBeDisabled()` to avoid flakiness. See [assertions guide](../test-assertions.md) for more details.
:::

**Usage**

```js
const disabled = await page.getByRole('button').isDisabled();
```

### option: Locator.isDisabled.timeout = %%-input-timeout-%%
* since: v1.14

### option: Locator.isDisabled.timeout = %%-input-timeout-js-%%
* since: v1.14

### option: Locator.isDisabled.signal = %%-input-signal-%%

## async method: Locator.isEditable
* since: v1.14
- returns: <[boolean]>

Returns whether the element is [editable](../actionability.md#editable). If the target element is not an `<input>`, `<textarea>`, `<select>`, `[contenteditable]` and does not have a role allowing `[aria-readonly]`, this method throws an error.

:::warning[Asserting editable state]
If you need to assert that an element is editable, prefer `LocatorAssertions.toBeEditable()` to avoid flakiness. See [assertions guide](../test-assertions.md) for more details.
:::

**Usage**

```js
const editable = await page.getByRole('textbox').isEditable();
```

### option: Locator.isEditable.timeout = %%-input-timeout-%%
* since: v1.14

### option: Locator.isEditable.timeout = %%-input-timeout-js-%%
* since: v1.14

### option: Locator.isEditable.signal = %%-input-signal-%%

## async method: Locator.isEnabled
* since: v1.14
- returns: <[boolean]>

Returns whether the element is [enabled](../actionability.md#enabled).

:::warning[Asserting enabled state]
If you need to assert that an element is enabled, prefer `LocatorAssertions.toBeEnabled()` to avoid flakiness. See [assertions guide](../test-assertions.md) for more details.
:::

**Usage**

```js
const enabled = await page.getByRole('button').isEnabled();
```

### option: Locator.isEnabled.timeout = %%-input-timeout-%%
* since: v1.14

### option: Locator.isEnabled.timeout = %%-input-timeout-js-%%
* since: v1.14

### option: Locator.isEnabled.signal = %%-input-signal-%%

## async method: Locator.isHidden
* since: v1.14
- returns: <[boolean]>

Returns whether the element is hidden, the opposite of [visible](../actionability.md#visible).

:::warning[Asserting visibility]
If you need to assert that element is hidden, prefer `LocatorAssertions.toBeHidden()` to avoid flakiness. See [assertions guide](../test-assertions.md) for more details.
:::

**Usage**

```js
const hidden = await page.getByRole('button').isHidden();
```

### option: Locator.isHidden.timeout
* since: v1.14
* deprecated: This option is ignored. `Locator.isHidden()` does not wait for the element to become hidden and returns immediately.
- `timeout` <[float]>

## async method: Locator.isVisible
* since: v1.14
- returns: <[boolean]>

Returns whether the element is [visible](../actionability.md#visible).

:::warning[Asserting visibility]
If you need to assert that element is visible, prefer `LocatorAssertions.toBeVisible()` to avoid flakiness. See [assertions guide](../test-assertions.md) for more details.
:::

**Usage**

```js
const visible = await page.getByRole('button').isVisible();
```

### option: Locator.isVisible.timeout
* since: v1.14
* deprecated: This option is ignored. `Locator.isVisible()` does not wait for the element to become visible and returns immediately.
- `timeout` <[float]>

## method: Locator.last
* since: v1.14
- returns: <[Locator]>

Returns locator to the last matching element.

**Usage**

```js
const banana = await page.getByRole('listitem').last();
```

## method: Locator.locator
* since: v1.14
- returns: <[Locator]>

%%-template-locator-locator-%%

### param: Locator.locator.selectorOrLocator = %%-find-selector-or-locator-%%
* since: v1.14

### option: Locator.locator.-inline- = %%-locator-options-list-v1.14-%%
* since: v1.14

### option: Locator.locator.hasNot = %%-locator-option-has-not-%%
* since: v1.33

### option: Locator.locator.hasNotText = %%-locator-option-has-not-text-%%
* since: v1.33

## async method: Locator.normalize
* since: v1.59
- returns: <[Locator]>

Returns a new locator that uses best practices for referencing the matched element, prioritizing test ids,
aria roles, and other user-facing attributes over CSS selectors. This is useful for converting implementation-detail selectors into more resilient, human-readable locators.

## method: Locator.nth
* since: v1.14
- returns: <[Locator]>

Returns locator to the n-th matching element. It's zero based, `nth(0)` selects the first element.

**Usage**

```js
const banana = await page.getByRole('listitem').nth(2);
```

### param: Locator.nth.index
* since: v1.14
- `index` <[int]>

## method: Locator.or
* since: v1.33
* langs:
  - alias-python: or_
- returns: <[Locator]>

Creates a locator matching all elements that match one or both of the two locators.

Note that when both locators match something, the resulting locator will have multiple matches, potentially causing a [locator strictness](../locators.md#strictness) violation.

**Usage**

Consider a scenario where you'd like to click on a "New email" button, but sometimes a security settings dialog shows up instead. In this case, you can wait for either a "New email" button, or a dialog and act accordingly.

:::note
If both "New email" button and security dialog appear on screen, the "or" locator will match both of them,
possibly throwing the ["strict mode violation" error](../locators.md#strictness). In this case, you can use `Locator.first()` to only match one of them.
:::

```js
const newEmail = page.getByRole('button', { name: 'New' });
const dialog = page.getByText('Confirm security settings');
await expect(newEmail.or(dialog).first()).toBeVisible();
if (await dialog.isVisible())
  await page.getByRole('button', { name: 'Dismiss' }).click();
await newEmail.click();
```

### param: Locator.or.locator
* since: v1.33
- `locator` <[Locator]>

Alternative locator to match.

## method: Locator.page
* since: v1.19
- returns: <[Page]>

A page this locator belongs to.

## async method: Locator.press
* since: v1.14

Focuses the matching element and presses a combination of the keys.

**Usage**

```js
await page.getByRole('textbox').press('Backspace');
```

**Details**

Focuses the element, and then uses `Keyboard.down()` and `Keyboard.up()`.

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

### param: Locator.press.key
* since: v1.14
- `key` <[string]>

Name of the key to press or a character to generate, such as `ArrowLeft` or `a`.

### option: Locator.press.delay
* since: v1.14
- `delay` <[float]>

Time to wait between `keydown` and `keyup` in milliseconds. Defaults to 0.

### option: Locator.press.noWaitAfter = %%-input-no-wait-after-%%
* since: v1.14

### option: Locator.press.timeout = %%-input-timeout-%%
* since: v1.14

### option: Locator.press.timeout = %%-input-timeout-js-%%
* since: v1.14

### option: Locator.press.signal = %%-input-signal-%%

## async method: Locator.pressSequentially
* since: v1.38

:::tip
In most cases, you should use `Locator.fill()` instead. You only need to press keys one by one if there is special keyboard handling on the page.
:::

Focuses the element, and then sends a `keydown`, `keypress`/`input`, and `keyup` event for each character in the text.

To press a special key, like `Control` or `ArrowDown`, use `Locator.press()`.

**Usage**

```js
await locator.pressSequentially('Hello'); // Types instantly
await locator.pressSequentially('World', { delay: 100 }); // Types slower, like a user
```

An example of typing into a text field and then submitting the form:

```js
const locator = page.getByLabel('Password');
await locator.pressSequentially('my password');
await locator.press('Enter');
```

### param: Locator.pressSequentially.text
* since: v1.38
- `text` <[string]>

String of characters to sequentially press into a focused element.

### option: Locator.pressSequentially.delay
* since: v1.38
- `delay` <[float]>

Time to wait between key presses in milliseconds. Defaults to 0.

### option: Locator.pressSequentially.noWaitAfter = %%-input-no-wait-after-removed-%%
* since: v1.38

### option: Locator.pressSequentially.timeout = %%-input-timeout-%%
* since: v1.38

### option: Locator.pressSequentially.timeout = %%-input-timeout-js-%%
* since: v1.38

### option: Locator.pressSequentially.signal = %%-input-signal-%%

## async method: Locator.screenshot
* since: v1.14
- returns: <[Buffer]>

Take a screenshot of the element matching the locator.

**Usage**

```js
await page.getByRole('link').screenshot();
```

Disable animations and save screenshot to a file:

```js
await page.getByRole('link').screenshot({ animations: 'disabled', path: 'link.png' });
```

**Details**

This method captures a screenshot of the page, clipped to the size and position of a particular element matching the locator. If the element is covered by other elements, it will not be actually visible on the screenshot. If the element is a scrollable container, only the currently scrolled content will be visible on the screenshot.

This method waits for the [actionability](../actionability.md) checks, then scrolls element into view before taking a
screenshot. If the element is detached from DOM, the method throws an error.

Returns the buffer with the captured screenshot.

### option: Locator.screenshot.-inline- = %%-screenshot-options-common-list-v1.8-%%
* since: v1.14

### option: Locator.screenshot.timeout = %%-input-timeout-%%
* since: v1.14

### option: Locator.screenshot.timeout = %%-input-timeout-js-%%
* since: v1.14

### option: Locator.screenshot.signal = %%-input-signal-%%

### option: Locator.screenshot.maskColor = %%-screenshot-option-mask-color-%%
* since: v1.34

### option: Locator.screenshot.style = %%-screenshot-option-style-%%
* since: v1.41

## async method: Locator.scrollIntoViewIfNeeded
* since: v1.14

This method waits for [actionability](../actionability.md) checks, then tries to scroll element into view, unless it is
completely visible as defined by
[IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)'s `ratio`.

See [scrolling](../input.md#scrolling) for alternative ways to scroll.

### option: Locator.scrollIntoViewIfNeeded.timeout = %%-input-timeout-%%
* since: v1.14

### option: Locator.scrollIntoViewIfNeeded.timeout = %%-input-timeout-js-%%
* since: v1.14

### option: Locator.scrollIntoViewIfNeeded.signal = %%-input-signal-%%

## async method: Locator.selectOption
* since: v1.14
- returns: <[Array]<[string]>>

Selects option or options in `<select>`.

**Details**

This method waits for [actionability](../actionability.md) checks, waits until all specified options are present in the `<select>` element and selects these options.

If the target element is not a `<select>` element, this method throws an error. However, if the element is inside the `<label>` element that has an associated [control](https://developer.mozilla.org/en-US/docs/Web/API/HTMLLabelElement/control), the control will be used instead.

Returns the array of option values that have been successfully selected.

Triggers a `change` and `input` event once all the provided options have been selected.

**Usage**

```html
<select multiple>
  <option value="red">Red</option>
  <option value="green">Green</option>
  <option value="blue">Blue</option>
</select>
```

```js
// single selection matching the value or label
element.selectOption('blue');

// single selection matching the label
element.selectOption({ label: 'Blue' });

// multiple selection for red, green and blue options
element.selectOption(['red', 'green', 'blue']);
```

### param: Locator.selectOption.values = %%-select-options-values-%%
* since: v1.14

### option: Locator.selectOption.force = %%-input-force-%%
* since: v1.14

### option: Locator.selectOption.noWaitAfter = %%-input-no-wait-after-removed-%%
* since: v1.14

### option: Locator.selectOption.timeout = %%-input-timeout-%%
* since: v1.14

### option: Locator.selectOption.timeout = %%-input-timeout-js-%%
* since: v1.14

### option: Locator.selectOption.signal = %%-input-signal-%%

### param: Locator.selectOption.element = %%-python-select-options-element-%%
* since: v1.14

### param: Locator.selectOption.index = %%-python-select-options-index-%%
* since: v1.14

### param: Locator.selectOption.value = %%-python-select-options-value-%%
* since: v1.14

### param: Locator.selectOption.label = %%-python-select-options-label-%%
* since: v1.14

## async method: Locator.selectText
* since: v1.14

This method waits for [actionability](../actionability.md) checks, then focuses the element and selects all its text
content.

If the element is inside the `<label>` element that has an associated [control](https://developer.mozilla.org/en-US/docs/Web/API/HTMLLabelElement/control), focuses and selects text in the control instead.

### option: Locator.selectText.force = %%-input-force-%%
* since: v1.14

### option: Locator.selectText.timeout = %%-input-timeout-%%
* since: v1.14

### option: Locator.selectText.timeout = %%-input-timeout-js-%%
* since: v1.14

### option: Locator.selectText.signal = %%-input-signal-%%

## async method: Locator.setChecked
* since: v1.15

Set the state of a checkbox or a radio element.

**Usage**

```js
await page.getByRole('checkbox').setChecked(true);
```

**Details**

This method checks or unchecks an element by performing the following steps:
1. Ensure that matched element is a checkbox or a radio input. If not, this method throws.
1. If the element already has the right checked state, this method returns immediately.
1. Wait for [actionability](../actionability.md) checks on the matched element, unless `force` option is
   set. If the element is detached during the checks, the whole action is retried.
1. Scroll the element into view if needed.
1. Use `Page.mouse` to click in the center of the element.
1. Ensure that the element is now checked or unchecked. If not, this method throws.

When all steps combined have not finished during the specified `timeout`, this method throws a
[TimeoutError]. Passing zero timeout disables this.

### param: Locator.setChecked.checked = %%-input-checked-%%
* since: v1.15

### option: Locator.setChecked.force = %%-input-force-%%
* since: v1.15

### option: Locator.setChecked.scroll = %%-input-scroll-%%
* since: v1.62

### option: Locator.setChecked.noWaitAfter = %%-input-no-wait-after-removed-%%
* since: v1.15

### option: Locator.setChecked.position = %%-input-position-%%
* since: v1.15

### option: Locator.setChecked.timeout = %%-input-timeout-%%
* since: v1.15

### option: Locator.setChecked.timeout = %%-input-timeout-js-%%
* since: v1.15

### option: Locator.setChecked.signal = %%-input-signal-%%

### option: Locator.setChecked.trial = %%-input-trial-%%
* since: v1.15

## async method: Locator.setInputFiles
* since: v1.14

Upload file or multiple files into `<input type=file>`.
For inputs with a `[webkitdirectory]` attribute, only a single directory path is supported.

**Usage**

```js
// Select one file
await page.getByLabel('Upload file').setInputFiles(path.join(__dirname, 'myfile.pdf'));

// Select multiple files
await page.getByLabel('Upload files').setInputFiles([
  path.join(__dirname, 'file1.txt'),
  path.join(__dirname, 'file2.txt'),
]);

// Select a directory
await page.getByLabel('Upload directory').setInputFiles(path.join(__dirname, 'mydir'));

// Remove all the selected files
await page.getByLabel('Upload file').setInputFiles([]);

// Upload buffer from memory
await page.getByLabel('Upload file').setInputFiles({
  name: 'file.txt',
  mimeType: 'text/plain',
  buffer: Buffer.from('this is test')
});
```

**Details**

Sets the value of the file input to these file paths or files. If some of the `filePaths` are relative paths, then they
are resolved relative to the current working directory. For empty array, clears the selected files.

This method expects [Locator] to point to an
[input element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input). However, if the element is inside the `<label>` element that has an associated [control](https://developer.mozilla.org/en-US/docs/Web/API/HTMLLabelElement/control), targets the control instead.

### param: Locator.setInputFiles.files = %%-input-files-%%
* since: v1.14

### option: Locator.setInputFiles.noWaitAfter = %%-input-no-wait-after-removed-%%
* since: v1.14

### option: Locator.setInputFiles.timeout = %%-input-timeout-%%
* since: v1.14

### option: Locator.setInputFiles.timeout = %%-input-timeout-js-%%
* since: v1.14

### option: Locator.setInputFiles.signal = %%-input-signal-%%

## async method: Locator.tap
* since: v1.14

Perform a tap gesture on the element matching the locator. For examples of emulating other gestures by manually dispatching touch events, see the [emulating legacy touch events](../touch-events.md) page.

**Details**

This method taps the element by performing the following steps:
1. Wait for [actionability](../actionability.md) checks on the element, unless `force` option is set.
1. Scroll the element into view if needed.
1. Use `Page.touchscreen` to tap the center of the element, or the specified `position`.

If the element is detached from the DOM at any moment during the action, this method throws.

When all steps combined have not finished during the specified `timeout`, this method throws a
[TimeoutError]. Passing zero timeout disables this.

:::note
`element.tap()` requires that the `hasTouch` option of the browser context be set to true.
:::

### option: Locator.tap.position = %%-input-position-%%
* since: v1.14

### option: Locator.tap.modifiers = %%-input-modifiers-%%
* since: v1.14

### option: Locator.tap.force = %%-input-force-%%
* since: v1.14

### option: Locator.tap.scroll = %%-input-scroll-%%
* since: v1.62

### option: Locator.tap.noWaitAfter = %%-input-no-wait-after-removed-%%
* since: v1.14

### option: Locator.tap.timeout = %%-input-timeout-%%
* since: v1.14

### option: Locator.tap.timeout = %%-input-timeout-js-%%
* since: v1.14

### option: Locator.tap.signal = %%-input-signal-%%

### option: Locator.tap.trial = %%-input-trial-with-modifiers-%%
* since: v1.14

## async method: Locator.textContent
* since: v1.14
- returns: <[null]|[string]>

Returns the [`node.textContent`](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent).

:::warning[Asserting text]
If you need to assert text on the page, prefer `LocatorAssertions.toHaveText()` to avoid flakiness. See [assertions guide](../test-assertions.md) for more details.
:::

### option: Locator.textContent.timeout = %%-input-timeout-%%
* since: v1.14

### option: Locator.textContent.timeout = %%-input-timeout-js-%%
* since: v1.14

### option: Locator.textContent.signal = %%-input-signal-%%

## method: Locator.toString
* since: v1.57
* langs: js
- returns: <[string]>

Returns a human-readable representation of the locator, using the `Locator.description()` if one exists; otherwise, it generates a string based on the locator's selector.

## async method: Locator.type
* since: v1.14
* deprecated: In most cases, you should use `Locator.fill()` instead. You only need to press keys one by one if there is special keyboard handling on the page - in this case use `Locator.pressSequentially()`.

Focuses the element, and then sends a `keydown`, `keypress`/`input`, and `keyup` event for each character in the text.

To press a special key, like `Control` or `ArrowDown`, use `Locator.press()`.

**Usage**

### param: Locator.type.text
* since: v1.14
- `text` <[string]>

A text to type into a focused element.

### option: Locator.type.delay
* since: v1.14
- `delay` <[float]>

Time to wait between key presses in milliseconds. Defaults to 0.

### option: Locator.type.noWaitAfter = %%-input-no-wait-after-removed-%%
* since: v1.14

### option: Locator.type.timeout = %%-input-timeout-%%
* since: v1.14

### option: Locator.type.timeout = %%-input-timeout-js-%%
* since: v1.14

### option: Locator.type.signal = %%-input-signal-%%

## async method: Locator.uncheck
* since: v1.14

Ensure that checkbox or radio element is unchecked.

**Usage**

```js
await page.getByRole('checkbox').uncheck();
```

**Details**

This method unchecks the element by performing the following steps:
1. Ensure that element is a checkbox or a radio input. If not, this method throws. If the element is already
   unchecked, this method returns immediately.
1. Wait for [actionability](../actionability.md) checks on the element, unless `force` option is set.
1. Scroll the element into view if needed.
1. Use `Page.mouse` to click in the center of the element.
1. Ensure that the element is now unchecked. If not, this method throws.

If the element is detached from the DOM at any moment during the action, this method throws.

When all steps combined have not finished during the specified `timeout`, this method throws a
[TimeoutError]. Passing zero timeout disables this.

### option: Locator.uncheck.position = %%-input-position-%%
* since: v1.14

### option: Locator.uncheck.force = %%-input-force-%%
* since: v1.14

### option: Locator.uncheck.scroll = %%-input-scroll-%%
* since: v1.62

### option: Locator.uncheck.noWaitAfter = %%-input-no-wait-after-removed-%%
* since: v1.14

### option: Locator.uncheck.timeout = %%-input-timeout-%%
* since: v1.14

### option: Locator.uncheck.timeout = %%-input-timeout-js-%%
* since: v1.14

### option: Locator.uncheck.signal = %%-input-signal-%%

### option: Locator.uncheck.trial = %%-input-trial-%%
* since: v1.14

## method: Locator.visible
* since: v1.63
- returns: <[Locator]>

Returns a locator that matches only [visible](../actionability.md#visible) elements, ignoring the invisible ones. This is the recommended way to distinguish elements by visibility, as opposed to the `:visible` CSS pseudo-class.

Note that visibility is checked every time the locator is used, and not at the moment of the `Locator.visible()` call.

**Usage**

Consider a page with two buttons, the first invisible and the second visible.

```html
<button style='display: none'>Invisible</button>
<button>Visible</button>
```

This will only find the second button, because it is visible, and then click it.

```js
await page.locator('button').visible().click();
```

To match invisible elements instead, use `Locator.filter()` with the `Locator.filter.visible` option set to `false`.

## async method: Locator.waitFor
* since: v1.16

Returns when element specified by locator satisfies the `state` option.

If target element already satisfies the condition, the method returns immediately. Otherwise, waits for up to
`timeout` milliseconds until the condition is met.

**Usage**

```js
const orderSent = page.locator('#order-sent');
await orderSent.waitFor();
```

### option: Locator.waitFor.state = %%-wait-for-selector-state-%%
* since: v1.16

### option: Locator.waitFor.timeout = %%-input-timeout-%%
* since: v1.16

### option: Locator.waitFor.timeout = %%-input-timeout-js-%%
* since: v1.16

### option: Locator.waitFor.signal = %%-input-signal-%%

## async method: Locator.waitForFunction
* since: v1.62

Returns when `expression` returns a truthy value, called with the matching element as a first argument, and `arg` as a second argument.

This is a generic way to wait for an element to reach a custom condition without asserting it. The locator is re-resolved on each retry, so it tolerates the element being re-rendered while waiting.

If `expression` returns a [Promise], this method will wait for the promise to resolve before checking its value.

If `expression` throws or rejects, this method throws.

**Usage**

Wait for an attribute to appear:

```js
const toggle = page.getByRole('button', { name: 'Menu' });
await toggle.click();
await toggle.waitForFunction(element => element.hasAttribute('aria-expanded'));
```

Passing argument to `expression`:

```js
await page.getByTestId('status').waitForFunction((element, value) => {
  return element.textContent === value;
}, 'Ready');
```

### param: Locator.waitForFunction.expression = %%-evaluate-expression-%%
* since: v1.62

### param: Locator.waitForFunction.expression = %%-js-evaluate-pagefunction-%%
* since: v1.62

### param: Locator.waitForFunction.arg
* since: v1.62
- `arg` ?<[EvaluationArgument]>

Optional argument to pass to `expression`.

### option: Locator.waitForFunction.timeout = %%-wait-for-function-timeout-%%
* since: v1.62

### option: Locator.waitForFunction.timeout = %%-wait-for-function-timeout-js-%%
* since: v1.62

### option: Locator.waitForFunction.signal = %%-input-signal-%%
* since: v1.62
