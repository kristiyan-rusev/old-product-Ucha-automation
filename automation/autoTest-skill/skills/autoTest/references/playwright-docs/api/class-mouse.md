# class: Mouse
* since: v1.8

The Mouse class operates in main-frame CSS pixels relative to the top-left corner of the viewport.

:::tip
If you want to debug where the mouse moved, you can use the [Trace viewer](../trace-viewer-intro.md) or [Playwright Inspector](../running-tests.md). A red dot showing the location of the mouse will be shown for every mouse action.
:::

Every `page` object has its own Mouse, accessible with `Page.mouse`.

```js
// Using ‘page.mouse’ to trace a 100x100 square.
await page.mouse.move(0, 0);
await page.mouse.down();
await page.mouse.move(0, 100);
await page.mouse.move(100, 100);
await page.mouse.move(100, 0);
await page.mouse.move(0, 0);
await page.mouse.up();
```

## async method: Mouse.click
* since: v1.8

Shortcut for `Mouse.move()`, `Mouse.down()`, `Mouse.up()`.

### param: Mouse.click.x
* since: v1.8
- `x` <[float]>

X coordinate relative to the main frame's viewport in CSS pixels.

### param: Mouse.click.y
* since: v1.8
- `y` <[float]>

Y coordinate relative to the main frame's viewport in CSS pixels.

### option: Mouse.click.button = %%-input-button-%%
* since: v1.8

### option: Mouse.click.clickCount = %%-input-click-count-%%
* since: v1.8

### option: Mouse.click.delay = %%-input-down-up-delay-%%
* since: v1.8

## async method: Mouse.dblclick
* since: v1.8
* langs:
  - alias-csharp: DblClickAsync

Shortcut for `Mouse.move()`, `Mouse.down()`, `Mouse.up()`, `Mouse.down()` and
`Mouse.up()`.

### param: Mouse.dblclick.x
* since: v1.8
- `x` <[float]>

X coordinate relative to the main frame's viewport in CSS pixels.

### param: Mouse.dblclick.y
* since: v1.8
- `y` <[float]>

Y coordinate relative to the main frame's viewport in CSS pixels.

### option: Mouse.dblclick.button = %%-input-button-%%
* since: v1.8

### option: Mouse.dblclick.delay = %%-input-down-up-delay-%%
* since: v1.8

## async method: Mouse.down
* since: v1.8

Dispatches a `mousedown` event.

### option: Mouse.down.button = %%-input-button-%%
* since: v1.8

### option: Mouse.down.clickCount = %%-input-click-count-%%
* since: v1.8

## async method: Mouse.move
* since: v1.8

Dispatches a `mousemove` event.

### param: Mouse.move.x
* since: v1.8
- `x` <[float]>

X coordinate relative to the main frame's viewport in CSS pixels.

### param: Mouse.move.y
* since: v1.8
- `y` <[float]>

Y coordinate relative to the main frame's viewport in CSS pixels.

### option: Mouse.move.steps = %%-input-mousemove-steps-%%
* since: v1.8

## async method: Mouse.up
* since: v1.8

Dispatches a `mouseup` event.

### option: Mouse.up.button = %%-input-button-%%
* since: v1.8

### option: Mouse.up.clickCount = %%-input-click-count-%%
* since: v1.8

## async method: Mouse.wheel
* since: v1.15

Dispatches a `wheel` event. This method is usually used to manually scroll the page. See [scrolling](../input.md#scrolling) for alternative ways to scroll.

:::note
Wheel events may cause scrolling if they are not handled, and this method does not
wait for the scrolling to finish before returning.
:::

### param: Mouse.wheel.deltaX
* since: v1.15
- `deltaX` <[float]>

Pixels to scroll horizontally.

### param: Mouse.wheel.deltaY
* since: v1.15
- `deltaY` <[float]>

Pixels to scroll vertically.
