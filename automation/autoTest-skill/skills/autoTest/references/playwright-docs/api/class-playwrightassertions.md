# class: PlaywrightAssertions
* langs: js, java, csharp
* since: v1.17

Playwright gives you Web-First Assertions with convenience methods for creating assertions that will wait and retry until the expected condition is met.

Consider the following example:

```js
import { test, expect } from '@playwright/test';

test('status becomes submitted', async ({ page }) => {
  // ...
  await page.locator('#submit-button').click();
  await expect(page.locator('.status')).toHaveText('Submitted');
});
```

Playwright will be re-testing the node with the selector `.status` until fetched Node has the `"Submitted"`
text. It will be re-fetching the node and checking it over and over, until the condition is met or until the timeout is
reached. You can pass this timeout as an option.

By default, the timeout for assertions is set to 5 seconds.

## method: PlaywrightAssertions.expectAPIResponse
* since: v1.18
* langs:
  - alias-java: assertThat
  - alias-python: expect
  - alias-js: expect
  - alias-csharp: Expect
- returns: <[APIResponseAssertions]>

Creates a [APIResponseAssertions] object for the given [APIResponse].

**Usage**

### param: PlaywrightAssertions.expectAPIResponse.response
* since: v1.18
- `response` <[APIResponse]>

[APIResponse] object to use for assertions.

## method: PlaywrightAssertions.expectGeneric
* since: v1.9
* langs: js
  - alias-js: expect
- returns: <[GenericAssertions]>

Creates a [GenericAssertions] object for the given value.

### param: PlaywrightAssertions.expectGeneric.value
* since: v1.9
* langs: js
- `value` <[any]>

Value that will be asserted.

## method: PlaywrightAssertions.expectLocator
* since: v1.18
* langs:
  - alias-java: assertThat
  - alias-python: expect
  - alias-js: expect
  - alias-csharp: Expect
- returns: <[LocatorAssertions]>

Creates a [LocatorAssertions] object for the given [Locator].

**Usage**

### param: PlaywrightAssertions.expectLocator.locator
* since: v1.18
- `locator` <[Locator]>

[Locator] object to use for assertions.

## method: PlaywrightAssertions.expectPage
* since: v1.18
* langs:
  - alias-java: assertThat
  - alias-python: expect
  - alias-js: expect
  - alias-csharp: Expect
- returns: <[PageAssertions]>

Creates a [PageAssertions] object for the given [Page].

**Usage**

### param: PlaywrightAssertions.expectPage.page
* since: v1.18
- `page` <[Page]>

[Page] object to use for assertions.

## method: PlaywrightAssertions.setDefaultAssertionTimeout
* since: v1.25
* langs: java

Changes default timeout for Playwright assertions from 5 seconds to the specified value.

**Usage**

### param: PlaywrightAssertions.setDefaultAssertionTimeout.timeout
* since: v1.25
- `timeout` <[float]>

Timeout in milliseconds.
