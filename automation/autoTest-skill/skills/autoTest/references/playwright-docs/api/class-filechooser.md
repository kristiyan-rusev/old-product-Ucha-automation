# class: FileChooser
* since: v1.8

[FileChooser] objects are dispatched by the page in the `Page.fileChooser` event.

```js
// Start waiting for file chooser before clicking. Note no await.
const fileChooserPromise = page.waitForEvent('filechooser');
await page.getByText('Upload file').click();
const fileChooser = await fileChooserPromise;
await fileChooser.setFiles(path.join(__dirname, 'myfile.pdf'));
```

## method: FileChooser.element
* since: v1.8
- returns: <[ElementHandle]>

Returns input element associated with this file chooser.

## method: FileChooser.isMultiple
* since: v1.8
- returns: <[boolean]>

Returns whether this file chooser accepts multiple files.

## method: FileChooser.page
* since: v1.8
- returns: <[Page]>

Returns page this file chooser belongs to.

## async method: FileChooser.setFiles
* since: v1.8

Sets the value of the file input this chooser is associated with. If some of the `filePaths` are relative paths, then
they are resolved relative to the current working directory. For empty array, clears the selected files.

### param: FileChooser.setFiles.files = %%-input-files-%%
* since: v1.8

### option: FileChooser.setFiles.noWaitAfter = %%-input-no-wait-after-removed-%%
* since: v1.8

### option: FileChooser.setFiles.timeout = %%-input-timeout-%%
* since: v1.8

### option: FileChooser.setFiles.timeout = %%-input-timeout-js-%%
* since: v1.8

### option: FileChooser.setFiles.signal = %%-input-signal-%%
