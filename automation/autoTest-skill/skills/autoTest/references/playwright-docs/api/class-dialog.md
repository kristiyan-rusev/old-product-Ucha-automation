# class: Dialog
* since: v1.8

[Dialog] objects are dispatched by page via the `Page.dialog` event.

An example of using `Dialog` class:

```js
const { chromium } = require('playwright');  // Or 'firefox' or 'webkit'.

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('dialog', async dialog => {
    console.log(dialog.message());
    await dialog.dismiss();
  });
  await page.evaluate(() => alert('1'));
  await browser.close();
})();
```

:::note
Dialogs are dismissed automatically, unless there is a `Page.dialog` listener.
When listener is present, it **must** either `Dialog.accept()` or `Dialog.dismiss()` the dialog - otherwise the page will [freeze](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop#never_blocking) waiting for the dialog, and actions like click will never finish.
:::

## async method: Dialog.accept
* since: v1.8

Returns when the dialog has been accepted.

### param: Dialog.accept.promptText
* since: v1.8
- `promptText` ?<[string]>

A text to enter in prompt. Does not cause any effects if the dialog's `type` is not prompt. Optional.

## method: Dialog.defaultValue
* since: v1.8
- returns: <[string]>

If dialog is prompt, returns default prompt value. Otherwise, returns empty string.

## async method: Dialog.dismiss
* since: v1.8

Returns when the dialog has been dismissed.

## method: Dialog.message
* since: v1.8
- returns: <[string]>

A message displayed in the dialog.

## method: Dialog.page
* since: v1.34
- returns: <[null]|[Page]>

The page that initiated this dialog, if available.

## method: Dialog.type
* since: v1.8
- returns: <[string]>

Returns dialog's type, can be one of `alert`, `beforeunload`, `confirm` or `prompt`.
