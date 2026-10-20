# class: FrameLocator
* since: v1.17

FrameLocator represents a view to the `iframe` on the page. It captures the logic sufficient to retrieve the `iframe` and locate elements in that iframe. FrameLocator can be created with either `Locator.contentFrame()`, `Page.frameLocator()` or `Locator.frameLocator()` method.

```js
const locator = page.locator('#my-frame').contentFrame().getByText('Submit');
await locator.click();
```

**Strictness**

Frame locators are strict. This means that all operations on frame locators will throw if more than one element matches a given selector.

```js
// Throws if there are several frames in DOM:
await page.locator('.result-frame').contentFrame().getByRole('button').click();

// Works because we explicitly tell locator to pick the first frame:
await page.locator('.result-frame').contentFrame().first().getByRole('button').click();
```

**Any frame**

Calling `Page.frameLocator()` or `Frame.frameLocator()` without a selector creates a frame locator that
starts the search in any frame of the subtree - so that you don't
need to locate the iframe first.

```js
// Finds the button in any frame on the page:
await page.frameLocator().getByRole('button').click();

// Finds the iframe with id "my-frame" anywhere on the page, and clicks the button inside it:
await page.frameLocator().locator('#my-frame').contentFrame().getByRole('button').click();
```

Only the start of the search is affected - the rest of the locator is resolved inside a single frame, just like any
other locator. Following the strictness rules above, an error is thrown when elements are matched in multiple frames.

Such a frame locator does not point to a particular `iframe`, so `FrameLocator.owner()`,
`FrameLocator.first()`, `FrameLocator.last()` and `FrameLocator.nth()` are not supported on it.

**Converting Locator to FrameLocator**

If you have a [Locator] object pointing to an `iframe` it can be converted to [FrameLocator] using `Locator.contentFrame()`.

**Converting FrameLocator to Locator**

If you have a [FrameLocator] object it can be converted to [Locator] pointing to the same `iframe` using `FrameLocator.owner()`.

## method: FrameLocator.first
* deprecated: Use `Locator.first()` followed by `Locator.contentFrame()` instead.
* since: v1.17
- returns: <[FrameLocator]>

Returns locator to the first matching frame.

## method: FrameLocator.frameLocator
* since: v1.17
- returns: <[FrameLocator]>

When working with iframes, you can create a frame locator that will enter the iframe and allow selecting elements
in that iframe.

### param: FrameLocator.frameLocator.selector = %%-find-selector-%%
* since: v1.17

## method: FrameLocator.getByAltText
* since: v1.27
- returns: <[Locator]>

%%-template-locator-get-by-alt-text-%%

### param: FrameLocator.getByAltText.text = %%-locator-get-by-text-text-%%

### option: FrameLocator.getByAltText.exact = %%-locator-get-by-text-exact-%%

## method: FrameLocator.getByLabel
* since: v1.27
- returns: <[Locator]>

%%-template-locator-get-by-label-text-%%

### param: FrameLocator.getByLabel.text = %%-locator-get-by-text-text-%%

### option: FrameLocator.getByLabel.exact = %%-locator-get-by-text-exact-%%

## method: FrameLocator.getByPlaceholder
* since: v1.27
- returns: <[Locator]>

%%-template-locator-get-by-placeholder-text-%%

### param: FrameLocator.getByPlaceholder.text = %%-locator-get-by-text-text-%%

### option: FrameLocator.getByPlaceholder.exact = %%-locator-get-by-text-exact-%%

## method: FrameLocator.getByRole
* since: v1.27
- returns: <[Locator]>

%%-template-locator-get-by-role-%%

### param: FrameLocator.getByRole.role = %%-get-by-role-to-have-role-role-%%
* since: v1.27

### option: FrameLocator.getByRole.-inline- = %%-locator-get-by-role-option-list-v1.27-%%
* since: v1.27

### option: FrameLocator.getByRole.exact = %%-locator-get-by-role-option-exact-%%

### option: FrameLocator.getByRole.description = %%-locator-get-by-role-option-description-%%

## method: FrameLocator.getByTestId
* since: v1.27
- returns: <[Locator]>

%%-template-locator-get-by-test-id-%%

### param: FrameLocator.getByTestId.testId = %%-locator-get-by-test-id-test-id-%%
* since: v1.27

## method: FrameLocator.getByText
* since: v1.27
- returns: <[Locator]>

%%-template-locator-get-by-text-%%

### param: FrameLocator.getByText.text = %%-locator-get-by-text-text-%%

### option: FrameLocator.getByText.exact = %%-locator-get-by-text-exact-%%

## method: FrameLocator.getByTitle
* since: v1.27
- returns: <[Locator]>

%%-template-locator-get-by-title-%%

### param: FrameLocator.getByTitle.text = %%-locator-get-by-text-text-%%

### option: FrameLocator.getByTitle.exact = %%-locator-get-by-text-exact-%%

## method: FrameLocator.last
* deprecated: Use `Locator.last()` followed by `Locator.contentFrame()` instead.
* since: v1.17
- returns: <[FrameLocator]>

Returns locator to the last matching frame.

## method: FrameLocator.locator
* since: v1.17
- returns: <[Locator]>

%%-template-locator-locator-%%

### param: FrameLocator.locator.selectorOrLocator = %%-find-selector-or-locator-%%
* since: v1.17

### option: FrameLocator.locator.-inline- = %%-locator-options-list-v1.14-%%
* since: v1.17

### option: FrameLocator.locator.hasNot = %%-locator-option-has-not-%%
* since: v1.33

### option: FrameLocator.locator.hasNotText = %%-locator-option-has-not-text-%%
* since: v1.33

## method: FrameLocator.nth
* deprecated: Use `Locator.nth()` followed by `Locator.contentFrame()` instead.
* since: v1.17
- returns: <[FrameLocator]>

Returns locator to the n-th matching frame. It's zero based, `nth(0)` selects the first frame.

### param: FrameLocator.nth.index
* since: v1.17
- `index` <[int]>

## method: FrameLocator.owner
* since: v1.43
- returns: <[Locator]>

Returns a [Locator] object pointing to the same `iframe` as this frame locator.

Useful when you have a [FrameLocator] object obtained somewhere, and later on would like to interact with the `iframe` element.

For a reverse operation, use `Locator.contentFrame()`.

**Usage**

```js
const frameLocator = page.locator('iframe[name="embedded"]').contentFrame();
// ...
const locator = frameLocator.owner();
await expect(locator).toBeVisible();
```

