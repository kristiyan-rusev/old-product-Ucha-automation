# class: ConsoleMessage
* since: v1.8

[ConsoleMessage] objects are dispatched by page via the `Page.console` event.
For each console message logged in the page there will be corresponding event in the Playwright
context.

```js
// Listen for all console logs
page.on('console', msg => console.log(msg.text()));

// Listen for all console events and handle errors
page.on('console', msg => {
  if (msg.type() === 'error')
    console.log(`Error text: "${msg.text()}"`);
});

// Get the next console log
const msgPromise = page.waitForEvent('console');
await page.evaluate(() => {
  console.log('hello', 42, { foo: 'bar' });  // Issue console.log inside the page
});
const msg = await msgPromise;

// Deconstruct console log arguments
await msg.args()[0].jsonValue(); // hello
await msg.args()[1].jsonValue(); // 42
```

## method: ConsoleMessage.args
* since: v1.8
- returns: <[Array]<[JSHandle]>>

List of arguments passed to a `console` function call. See also `Page.console`.

## method: ConsoleMessage.location
* since: v1.8
* langs: js, python
- returns: <[Object]>
  - `url` <[string]> URL of the resource.
  - `line` <[int]> 0-based line number in the resource.
  - `column` <[int]> 0-based column number in the resource.
  - `lineNumber` <[int]> 0-based line number in the resource. Deprecated, use `line` instead.
  - `columnNumber` <[int]> 0-based column number in the resource. Deprecated, use `column` instead.

## method: ConsoleMessage.location
* since: v1.8
* langs: csharp, java
- returns: <[string]>

URL of the resource followed by 0-based line and column numbers in the resource formatted as `URL:line:column`.

## method: ConsoleMessage.page
* since: v1.34
- returns: <[null]|[Page]>

The page that produced this console message, if any.

## method: ConsoleMessage.text
* since: v1.8
- returns: <[string]>

The text of the console message.

## method: ConsoleMessage.timestamp
* since: v1.59
- returns: <[float]>

The timestamp of the console message in milliseconds since the Unix epoch.

## method: ConsoleMessage.type
* since: v1.8
* langs: js, python
- returns: <[ConsoleMessageType]<"log"|"debug"|"info"|"error"|"warning"|"dir"|"dirxml"|"table"|"trace"|"clear"|"startGroup"|"startGroupCollapsed"|"endGroup"|"assert"|"profile"|"profileEnd"|"count"|"time"|"timeEnd">>

## method: ConsoleMessage.type
* since: v1.8
* langs: csharp, java
- returns: <[string]>

One of the following values: `'log'`, `'debug'`, `'info'`, `'error'`, `'warning'`, `'dir'`, `'dirxml'`, `'table'`,
`'trace'`, `'clear'`, `'startGroup'`, `'startGroupCollapsed'`, `'endGroup'`, `'assert'`, `'profile'`, `'profileEnd'`,
`'count'`, `'timeEnd'`.

## method: ConsoleMessage.worker
* since: v1.57
- returns: <[null]|[Worker]>

The web worker or service worker that produced this console message, if any. Note that console messages from web workers also have non-null `ConsoleMessage.page()`.
