# class: WebStorage
* since: v1.61

WebStorage exposes the page's `localStorage` or `sessionStorage` for the current origin via an async,
[browser-consistent](https://developer.mozilla.org/en-US/docs/Web/API/Storage) API.

Instances are accessed through `Page.localStorage` and `Page.sessionStorage`.

```js
await page.goto('https://example.com');
await page.localStorage.setItem('token', 'abc');
const token = await page.localStorage.getItem('token');
const all = await page.localStorage.items();
await page.localStorage.removeItem('token');
await page.localStorage.clear();
```

## async method: WebStorage.items
* since: v1.61
- returns: <[Array]<[Object]>>
  * alias: WebStorageItem
  - `name` <[string]>
  - `value` <[string]>

Returns all items in the storage as name/value pairs.

## async method: WebStorage.getItem
* since: v1.61
- returns: <[null]|[string]>

Returns the value for the given `WebStorage.getItem.name` if present.

### param: WebStorage.getItem.name
* since: v1.61
- `name` <[string]>

Name of the item to retrieve.

## async method: WebStorage.setItem
* since: v1.61

Sets the value for the given `WebStorage.setItem.name`. Overwrites any existing value for that name.

### param: WebStorage.setItem.name
* since: v1.61
- `name` <[string]>

Name of the item to set.

### param: WebStorage.setItem.value
* since: v1.61
- `value` <[string]>

New value for the item.

## async method: WebStorage.removeItem
* since: v1.61

Removes the item with the given `WebStorage.removeItem.name`. No-op if the item is absent.

### param: WebStorage.removeItem.name
* since: v1.61
- `name` <[string]>

Name of the item to remove.

## async method: WebStorage.clear
* since: v1.61

Removes all items from the storage.
