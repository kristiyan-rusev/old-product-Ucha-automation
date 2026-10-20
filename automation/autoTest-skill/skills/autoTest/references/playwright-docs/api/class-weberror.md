# class: WebError
* since: v1.38

[WebError] class represents an unhandled exception thrown in the page. It is dispatched via the `BrowserContext.webError` event.

```js
// Log all uncaught errors to the terminal
context.on('weberror', webError => {
  console.log(`Uncaught exception: "${webError.error()}"`);
});

// Navigate to a page with an exception.
await page.goto('data:text/html,<script>throw new Error("Test")</script>');
```

## method: WebError.page
* since: v1.38
- returns: <[null]|[Page]>

The page that produced this unhandled exception, if any.

## method: WebError.error
* since: v1.38
- returns: <[Error]>

Unhandled error that was thrown.

## method: WebError.error
* since: v1.38
* langs: java, csharp
- returns: <[string]>

Unhandled error that was thrown.

## method: WebError.location
* since: v1.60
- returns: <[Object]>
  * alias: WebErrorLocation
  - `url` <[string]> URL of the resource.
  - `line` <[int]> 0-based line number in the resource.
  - `column` <[int]> 0-based column number in the resource.
