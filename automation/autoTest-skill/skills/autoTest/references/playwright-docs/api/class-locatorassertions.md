# class: LocatorAssertions
* since: v1.17

The [LocatorAssertions] class provides assertion methods that can be used to make assertions about the [Locator] state in the tests.

```js
import { test, expect } from '@playwright/test';

test('status becomes submitted', async ({ page }) => {
  // ...
  await page.getByRole('button').click();
  await expect(page.locator('.status')).toHaveText('Submitted');
});
```

## property: LocatorAssertions.not
* since: v1.20
* langs: java, js, csharp
- returns: <[LocatorAssertions]>

Makes the assertion check for the opposite condition.

**Usage**

For example, this code tests that the Locator doesn't contain text `"error"`:

```js
await expect(locator).not.toContainText('error');
```

## async method: LocatorAssertions.NotToBeAttached
* since: v1.33
* langs: python

The opposite of `LocatorAssertions.toBeAttached()`.

### option: LocatorAssertions.NotToBeAttached.attached
* since: v1.33
- `attached` <[boolean]>

### option: LocatorAssertions.NotToBeAttached.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.33

## async method: LocatorAssertions.NotToBeChecked
* since: v1.20
* langs: python

The opposite of `LocatorAssertions.toBeChecked()`.

### option: LocatorAssertions.NotToBeChecked.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.18

## async method: LocatorAssertions.NotToBeDisabled
* since: v1.20
* langs: python

The opposite of `LocatorAssertions.toBeDisabled()`.

### option: LocatorAssertions.NotToBeDisabled.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.18

## async method: LocatorAssertions.NotToBeEditable
* since: v1.20
* langs: python

The opposite of `LocatorAssertions.toBeEditable()`.

### option: LocatorAssertions.NotToBeEditable.editable
* since: v1.26
- `editable` <[boolean]>

### option: LocatorAssertions.NotToBeEditable.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.18

## async method: LocatorAssertions.NotToBeEmpty
* since: v1.20
* langs: python

The opposite of `LocatorAssertions.toBeEmpty()`.

### option: LocatorAssertions.NotToBeEmpty.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.18

## async method: LocatorAssertions.NotToBeEnabled
* since: v1.20
* langs: python

The opposite of `LocatorAssertions.toBeEnabled()`.

### option: LocatorAssertions.NotToBeEnabled.enabled
* since: v1.26
- `enabled` <[boolean]>

### option: LocatorAssertions.NotToBeEnabled.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.18

## async method: LocatorAssertions.NotToBeFocused
* since: v1.20
* langs: python

The opposite of `LocatorAssertions.toBeFocused()`.

### option: LocatorAssertions.NotToBeFocused.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.18

## async method: LocatorAssertions.NotToBeHidden
* since: v1.20
* langs: python

The opposite of `LocatorAssertions.toBeHidden()`.

### option: LocatorAssertions.NotToBeHidden.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.18

## async method: LocatorAssertions.NotToBeInViewport
* since: v1.31
* langs: python

The opposite of `LocatorAssertions.toBeInViewport()`.

### option: LocatorAssertions.NotToBeInViewport.ratio
* since: v1.31
* langs: python
- `ratio` <[float]>

### option: LocatorAssertions.NotToBeInViewport.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.31
* langs: python

## async method: LocatorAssertions.NotToBeVisible
* since: v1.20
* langs: python

The opposite of `LocatorAssertions.toBeVisible()`.

### option: LocatorAssertions.NotToBeVisible.visible
* since: v1.26
- `visible` <[boolean]>

### option: LocatorAssertions.NotToBeVisible.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.18

## async method: LocatorAssertions.NotToContainClass
* since: v1.52
* langs: python

The opposite of `LocatorAssertions.toContainClass()`.

### param: LocatorAssertions.NotToContainClass.expected
* since: v1.52
- `expected` <[string]|[Array]<[string]>>

Expected class or RegExp or a list of those.

### option: LocatorAssertions.NotToContainClass.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.52

## async method: LocatorAssertions.NotToContainText
* since: v1.20
* langs: python

The opposite of `LocatorAssertions.toContainText()`.

### param: LocatorAssertions.NotToContainText.expected
* since: v1.18
- `expected` <[string]|[RegExp]|[Array]<[string]>|[Array]<[RegExp]>|[Array]<[string]|[RegExp]>>

Expected substring or RegExp or a list of those.

### option: LocatorAssertions.NotToContainText.ignoreCase = %%-assertions-ignore-case-%%
* since: v1.23

### option: LocatorAssertions.NotToContainText.useInnerText
* since: v1.18
- `useInnerText` <[boolean]>

Whether to use `element.innerText` instead of `element.textContent` when retrieving DOM node text.

### option: LocatorAssertions.NotToContainText.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.18

## async method: LocatorAssertions.NotToHaveAccessibleDescription
* since: v1.44
* langs: python

The opposite of `LocatorAssertions.toHaveAccessibleDescription()`.

### param: LocatorAssertions.NotToHaveAccessibleDescription.name
* since: v1.44
- `description` <[string]|[RegExp]>

Expected accessible description.

### option: LocatorAssertions.NotToHaveAccessibleDescription.ignoreCase = %%-assertions-ignore-case-%%
* since: v1.44

### option: LocatorAssertions.NotToHaveAccessibleDescription.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.44

## async method: LocatorAssertions.NotToHaveAccessibleErrorMessage
* since: v1.50
* langs: python

The opposite of `LocatorAssertions.toHaveAccessibleErrorMessage()`.

### param: LocatorAssertions.NotToHaveAccessibleErrorMessage.errorMessage
* since: v1.50
- `errorMessage` <[string]|[RegExp]>

Expected accessible error message.

### option: LocatorAssertions.NotToHaveAccessibleErrorMessage.ignoreCase = %%-assertions-ignore-case-%%
* since: v1.50

### option: LocatorAssertions.NotToHaveAccessibleErrorMessage.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.50

## async method: LocatorAssertions.NotToHaveAccessibleName
* since: v1.44
* langs: python

The opposite of `LocatorAssertions.toHaveAccessibleName()`.

### param: LocatorAssertions.NotToHaveAccessibleName.name
* since: v1.44
- `name` <[string]|[RegExp]>

Expected accessible name.

### option: LocatorAssertions.NotToHaveAccessibleName.ignoreCase = %%-assertions-ignore-case-%%
* since: v1.44

### option: LocatorAssertions.NotToHaveAccessibleName.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.44

## async method: LocatorAssertions.NotToHaveAttribute
* since: v1.20
* langs: python

The opposite of `LocatorAssertions.toHaveAttribute()`.

### param: LocatorAssertions.NotToHaveAttribute.name
* since: v1.18
- `name` <[string]>

Attribute name.

### param: LocatorAssertions.NotToHaveAttribute.value
* since: v1.18
- `value` <[string]|[RegExp]>

Expected attribute value.

### param: LocatorAssertions.NotToHaveAttribute.value
* since: v1.62
* langs: python
- `value` ?<[string]|[RegExp]>

Expected attribute value. If not specified, the assertion verifies that the attribute is absent.

### option: LocatorAssertions.NotToHaveAttribute.ignoreCase = %%-assertions-ignore-case-%%
* since: v1.40

### option: LocatorAssertions.NotToHaveAttribute.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.18

## async method: LocatorAssertions.NotToHaveClass
* since: v1.20
* langs: python

The opposite of `LocatorAssertions.toHaveClass()`.

### param: LocatorAssertions.NotToHaveClass.expected
* since: v1.18
- `expected` <[string]|[RegExp]|[Array]<[string]>|[Array]<[RegExp]>|[Array]<[string]|[RegExp]>>

Expected class or RegExp or a list of those.

### option: LocatorAssertions.NotToHaveClass.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.18

## async method: LocatorAssertions.NotToHaveCount
* since: v1.20
* langs: python

The opposite of `LocatorAssertions.toHaveCount()`.

### param: LocatorAssertions.NotToHaveCount.count
* since: v1.18
- `count` <[int]>

Expected count.

### option: LocatorAssertions.NotToHaveCount.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.18

## async method: LocatorAssertions.NotToHaveCSS
* since: v1.20
* langs: python

The opposite of `LocatorAssertions.toHaveCSS()`.

### param: LocatorAssertions.NotToHaveCSS.name
* since: v1.18
- `name` <[string]>

CSS property name.

### param: LocatorAssertions.NotToHaveCSS.value
* since: v1.18
- `value` <[string]|[RegExp]>

CSS property value.

### option: LocatorAssertions.NotToHaveCSS.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.18

## async method: LocatorAssertions.NotToHaveId
* since: v1.20
* langs: python

The opposite of `LocatorAssertions.toHaveId()`.

### param: LocatorAssertions.NotToHaveId.id
* since: v1.18
- `id` <[string]|[RegExp]>

Element id.

### option: LocatorAssertions.NotToHaveId.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.18

## async method: LocatorAssertions.NotToHaveJSProperty
* since: v1.20
* langs: python

The opposite of `LocatorAssertions.toHaveJSProperty()`.

### param: LocatorAssertions.NotToHaveJSProperty.name
* since: v1.18
- `name` <[string]>

Property name.

### param: LocatorAssertions.NotToHaveJSProperty.value
* since: v1.18
- `value` <[any]>

Property value.

### option: LocatorAssertions.NotToHaveJSProperty.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.18

## async method: LocatorAssertions.NotToHaveRole
* since: v1.44
* langs: python

The opposite of `LocatorAssertions.toHaveRole()`.

### param: LocatorAssertions.NotToHaveRole.role = %%-get-by-role-to-have-role-role-%%
* since: v1.44

### option: LocatorAssertions.NotToHaveRole.timeout = %%-js-assertions-timeout-%%
* since: v1.44

### option: LocatorAssertions.NotToHaveRole.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.44

## async method: LocatorAssertions.NotToHaveText
* since: v1.20
* langs: python

The opposite of `LocatorAssertions.toHaveText()`.

### param: LocatorAssertions.NotToHaveText.expected
* since: v1.18
- `expected` <[string]|[RegExp]|[Array]<[string]>|[Array]<[RegExp]>|[Array]<[string]|[RegExp]>>

Expected string or RegExp or a list of those.

### option: LocatorAssertions.NotToHaveText.ignoreCase = %%-assertions-ignore-case-%%
* since: v1.23

### option: LocatorAssertions.NotToHaveText.useInnerText
* since: v1.18
- `useInnerText` <[boolean]>

Whether to use `element.innerText` instead of `element.textContent` when retrieving DOM node text.

### option: LocatorAssertions.NotToHaveText.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.18

## async method: LocatorAssertions.NotToHaveValue
* since: v1.20
* langs: python

The opposite of `LocatorAssertions.toHaveValue()`.

### param: LocatorAssertions.NotToHaveValue.value
* since: v1.18
- `value` <[string]|[RegExp]>

Expected value.

### option: LocatorAssertions.NotToHaveValue.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.18

## async method: LocatorAssertions.NotToHaveValues
* since: v1.23
* langs: python

The opposite of `LocatorAssertions.toHaveValues()`.

### param: LocatorAssertions.NotToHaveValues.values
* since: v1.23
- `values` <[Array]<[string]>|[Array]<[RegExp]>|[Array]<[string]|[RegExp]>>

Expected options currently selected.

### option: LocatorAssertions.NotToHaveValues.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.23

## async method: LocatorAssertions.NotToMatchAriaSnapshot
* since: v1.49
* langs: python

The opposite of `LocatorAssertions.toMatchAriaSnapshot()`.

### param: LocatorAssertions.NotToMatchAriaSnapshot.expected
* since: v1.49
- `expected` <string>

### option: LocatorAssertions.NotToMatchAriaSnapshot.timeout = %%-js-assertions-timeout-%%
* since: v1.49

### option: LocatorAssertions.NotToMatchAriaSnapshot.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.49

## async method: LocatorAssertions.toBeAttached
* since: v1.33
* langs:
  - alias-java: isAttached

Ensures that [Locator] points to an element that is [connected](https://developer.mozilla.org/en-US/docs/Web/API/Node/isConnected) to a Document or a ShadowRoot.

**Usage**

```js
await expect(page.getByText('Hidden text')).toBeAttached();
```

### option: LocatorAssertions.toBeAttached.attached
* since: v1.33
- `attached` <[boolean]>

### option: LocatorAssertions.toBeAttached.timeout = %%-js-assertions-timeout-%%
* since: v1.33

### option: LocatorAssertions.toBeAttached.signal = %%-js-assertions-signal-%%
* since: v1.62

### option: LocatorAssertions.toBeAttached.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.33

## async method: LocatorAssertions.toBeChecked
* since: v1.20
* langs:
  - alias-java: isChecked

Ensures the [Locator] points to a checked input.

**Usage**

```js
const locator = page.getByLabel('Subscribe to newsletter');
await expect(locator).toBeChecked();
```

### option: LocatorAssertions.toBeChecked.checked
* since: v1.18
- `checked` <[boolean]>

Provides state to assert for. Asserts for input to be checked by default.
This option can't be used when `LocatorAssertions.toBeChecked.indeterminate` is set to true.

### option: LocatorAssertions.toBeChecked.indeterminate
* since: v1.50
- `indeterminate` <[boolean]>

Asserts that the element is in the indeterminate (mixed) state. Only supported for checkboxes and radio buttons.
This option can't be true when `LocatorAssertions.toBeChecked.checked` is provided.

### option: LocatorAssertions.toBeChecked.timeout = %%-js-assertions-timeout-%%
* since: v1.18

### option: LocatorAssertions.toBeChecked.signal = %%-js-assertions-signal-%%
* since: v1.62

### option: LocatorAssertions.toBeChecked.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.18

## async method: LocatorAssertions.toBeDisabled
* since: v1.20
* langs:
  - alias-java: isDisabled

Ensures the [Locator] points to a disabled element. Element is disabled if it has "disabled" attribute
or is disabled via ['aria-disabled'](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-disabled).
Note that only native control elements such as HTML `button`, `input`, `select`, `textarea`, `option`, `optgroup`
can be disabled by setting "disabled" attribute. "disabled" attribute on other elements is ignored
by the browser.

**Usage**

```js
const locator = page.locator('button.submit');
await expect(locator).toBeDisabled();
```

### option: LocatorAssertions.toBeDisabled.timeout = %%-js-assertions-timeout-%%
* since: v1.18

### option: LocatorAssertions.toBeDisabled.signal = %%-js-assertions-signal-%%
* since: v1.62

### option: LocatorAssertions.toBeDisabled.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.18

## async method: LocatorAssertions.toBeEditable
* since: v1.20
* langs:
  - alias-java: isEditable

Ensures the [Locator] points to an editable element.

**Usage**

```js
const locator = page.getByRole('textbox');
await expect(locator).toBeEditable();
```

### option: LocatorAssertions.toBeEditable.editable
* since: v1.26
- `editable` <[boolean]>

### option: LocatorAssertions.toBeEditable.timeout = %%-js-assertions-timeout-%%
* since: v1.18

### option: LocatorAssertions.toBeEditable.signal = %%-js-assertions-signal-%%
* since: v1.62

### option: LocatorAssertions.toBeEditable.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.18

## async method: LocatorAssertions.toBeEmpty
* since: v1.20
* langs:
  - alias-java: isEmpty

Ensures the [Locator] points to an empty editable element or to a DOM node that has no text.

**Usage**

```js
const locator = page.locator('div.warning');
await expect(locator).toBeEmpty();
```

### option: LocatorAssertions.toBeEmpty.timeout = %%-js-assertions-timeout-%%
* since: v1.18

### option: LocatorAssertions.toBeEmpty.signal = %%-js-assertions-signal-%%
* since: v1.62

### option: LocatorAssertions.toBeEmpty.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.18

## async method: LocatorAssertions.toBeEnabled
* since: v1.20
* langs:
  - alias-java: isEnabled

Ensures the [Locator] points to an enabled element.

**Usage**

```js
const locator = page.locator('button.submit');
await expect(locator).toBeEnabled();
```

### option: LocatorAssertions.toBeEnabled.enabled
* since: v1.26
- `enabled` <[boolean]>

### option: LocatorAssertions.toBeEnabled.timeout = %%-js-assertions-timeout-%%
* since: v1.18

### option: LocatorAssertions.toBeEnabled.signal = %%-js-assertions-signal-%%
* since: v1.62

### option: LocatorAssertions.toBeEnabled.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.18

## async method: LocatorAssertions.toBeFocused
* since: v1.20
* langs:
  - alias-java: isFocused

Ensures the [Locator] points to a focused DOM node.

**Usage**

```js
const locator = page.getByRole('textbox');
await expect(locator).toBeFocused();
```

### option: LocatorAssertions.toBeFocused.timeout = %%-js-assertions-timeout-%%
* since: v1.18

### option: LocatorAssertions.toBeFocused.signal = %%-js-assertions-signal-%%
* since: v1.62

### option: LocatorAssertions.toBeFocused.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.18

## async method: LocatorAssertions.toBeHidden
* since: v1.20
* langs:
  - alias-java: isHidden

Ensures that [Locator] either does not resolve to any DOM node, or resolves to a [non-visible](../actionability.md#visible) one.

**Usage**

```js
const locator = page.locator('.my-element');
await expect(locator).toBeHidden();
```

### option: LocatorAssertions.toBeHidden.timeout = %%-js-assertions-timeout-%%
* since: v1.18

### option: LocatorAssertions.toBeHidden.signal = %%-js-assertions-signal-%%
* since: v1.62

### option: LocatorAssertions.toBeHidden.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.18

## async method: LocatorAssertions.toBeInViewport
* since: v1.31
* langs:
  - alias-java: isInViewport

Ensures the [Locator] points to an element that intersects viewport, according to the [intersection observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API).

**Usage**

```js
const locator = page.getByRole('button');
// Make sure at least some part of element intersects viewport.
await expect(locator).toBeInViewport();
// Make sure element is fully outside of viewport.
await expect(locator).not.toBeInViewport();
// Make sure that at least half of the element intersects viewport.
await expect(locator).toBeInViewport({ ratio: 0.5 });
```

### option: LocatorAssertions.toBeInViewport.ratio
* since: v1.31
- `ratio` <[float]>

The minimal ratio of the element to intersect viewport. If equals to `0`, then
element should intersect viewport at any positive ratio. Defaults to `0`.

### option: LocatorAssertions.toBeInViewport.timeout = %%-js-assertions-timeout-%%
* since: v1.31

### option: LocatorAssertions.toBeInViewport.signal = %%-js-assertions-signal-%%
* since: v1.62

### option: LocatorAssertions.toBeInViewport.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.31

## async method: LocatorAssertions.toBeVisible
* since: v1.20
* langs:
  - alias-java: isVisible

Ensures that [Locator] points to an attached and [visible](../actionability.md#visible) DOM node.

To check that at least one element from the list is visible, use `Locator.first()`.

**Usage**

```js
// A specific element is visible.
await expect(page.getByText('Welcome')).toBeVisible();

// At least one item in the list is visible.
await expect(page.getByTestId('todo-item').first()).toBeVisible();

// At least one of the two elements is visible, possibly both.
await expect(
    page.getByRole('button', { name: 'Sign in' })
        .or(page.getByRole('button', { name: 'Sign up' }))
        .first()
).toBeVisible();
```

### option: LocatorAssertions.toBeVisible.visible
* since: v1.26
- `visible` <[boolean]>

### option: LocatorAssertions.toBeVisible.timeout = %%-js-assertions-timeout-%%
* since: v1.18

### option: LocatorAssertions.toBeVisible.signal = %%-js-assertions-signal-%%
* since: v1.62

### option: LocatorAssertions.toBeVisible.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.18

## async method: LocatorAssertions.toContainClass
* since: v1.52
* langs:
  - alias-java: containsClass

Ensures the [Locator] points to an element with given CSS classes. All classes from the asserted value, separated by spaces, must be present in the [Element.classList](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList) in any order.

**Usage**

```html
<div class='middle selected row' id='component'></div>
```

```js
const locator = page.locator('#component');
await expect(locator).toContainClass('middle selected row');
await expect(locator).toContainClass('selected');
await expect(locator).toContainClass('row middle');
```

When an array is passed, the method asserts that the list of elements located matches the corresponding list of expected class lists. Each element's class attribute is matched against the corresponding class in the array:

```html
<div class='list'>
  <div class='component inactive'></div>
  <div class='component active'></div>
  <div class='component inactive'></div>
</div>
```

```js
const locator = page.locator('.list > .component');
await expect(locator).toContainClass(['inactive', 'active', 'inactive']);
```

### param: LocatorAssertions.toContainClass.expected
* since: v1.52
- `expected` <[string]|[Array]<[string]>>

A string containing expected class names, separated by spaces, or a list of such strings to assert multiple elements.

### option: LocatorAssertions.toContainClass.timeout = %%-js-assertions-timeout-%%
* since: v1.52

### option: LocatorAssertions.toContainClass.signal = %%-js-assertions-signal-%%
* since: v1.62

### option: LocatorAssertions.toContainClass.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.52

## async method: LocatorAssertions.toContainText
* since: v1.20
* langs:
  - alias-java: containsText

Ensures the [Locator] points to an element that contains the given text. All nested elements will be considered when computing the text content of the element. You can use regular expressions for the value as well.

**Details**

When `expected` parameter is a string, Playwright will normalize whitespaces and line breaks both in the actual text and
in the expected string before matching. When regular expression is used, the actual text is matched as is.

**Usage**

```js
const locator = page.locator('.title');
await expect(locator).toContainText('substring');
await expect(locator).toContainText(/\d messages/);
```

If you pass an array as an expected value, the expectations are:
1. Locator resolves to a list of elements.
1. Elements from a **subset** of this list contain text from the expected array, respectively.
1. The matching subset of elements has the same order as the expected array.
1. Each text value from the expected array is matched by some element from the list.

For example, consider the following list:

```html
<ul>
  <li>Item Text 1</li>
  <li>Item Text 2</li>
  <li>Item Text 3</li>
</ul>
```

Let's see how we can use the assertion:

```js
// ✓ Contains the right items in the right order
await expect(page.locator('ul > li')).toContainText(['Text 1', 'Text 3']);

// ✖ Wrong order
await expect(page.locator('ul > li')).toContainText(['Text 3', 'Text 2']);

// ✖ No item contains this text
await expect(page.locator('ul > li')).toContainText(['Some 33']);

// ✖ Locator points to the outer list element, not to the list items
await expect(page.locator('ul')).toContainText(['Text 3']);
```

### param: LocatorAssertions.toContainText.expected
* since: v1.18
* langs: js
- `expected` <[string]|[RegExp]|[Array]<[string]|[RegExp]>>

Expected substring or RegExp or a list of those.

### param: LocatorAssertions.toContainText.expected
* since: v1.18
* langs: python
- `expected` <[string]|[RegExp]|[Array]<[string]>|[Array]<[RegExp]>|[Array]<[string]|[RegExp]>>

Expected substring or RegExp or a list of those.

### param: LocatorAssertions.toContainText.expected
* since: v1.18
* langs: java, csharp
- `expected` <[string]|[RegExp]|[Array]<[string]>|[Array]<[RegExp]>>

Expected substring or RegExp or a list of those.

### option: LocatorAssertions.toContainText.ignoreCase = %%-assertions-ignore-case-%%
* since: v1.23

### option: LocatorAssertions.toContainText.useInnerText
* since: v1.18
- `useInnerText` <[boolean]>

Whether to use `element.innerText` instead of `element.textContent` when retrieving DOM node text.

### option: LocatorAssertions.toContainText.timeout = %%-js-assertions-timeout-%%
* since: v1.18

### option: LocatorAssertions.toContainText.signal = %%-js-assertions-signal-%%
* since: v1.62

### option: LocatorAssertions.toContainText.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.18

## async method: LocatorAssertions.toHaveAccessibleDescription
* since: v1.44
* langs:
  - alias-java: hasAccessibleDescription

Ensures the [Locator] points to an element with a given [accessible description](https://w3c.github.io/accname/#dfn-accessible-description).

**Usage**

```js
const locator = page.getByTestId('save-button');
await expect(locator).toHaveAccessibleDescription('Save results to disk');
```

### param: LocatorAssertions.toHaveAccessibleDescription.description
* since: v1.44
- `description` <[string]|[RegExp]>

Expected accessible description.

### option: LocatorAssertions.toHaveAccessibleDescription.timeout = %%-js-assertions-timeout-%%
* since: v1.44

### option: LocatorAssertions.toHaveAccessibleDescription.signal = %%-js-assertions-signal-%%
* since: v1.62

### option: LocatorAssertions.toHaveAccessibleDescription.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.44

### option: LocatorAssertions.toHaveAccessibleDescription.ignoreCase = %%-assertions-ignore-case-%%
* since: v1.44

## async method: LocatorAssertions.toHaveAccessibleErrorMessage
* since: v1.50
* langs:
  - alias-java: hasAccessibleErrorMessage

Ensures the [Locator] points to an element with a given [aria errormessage](https://w3c.github.io/aria/#aria-errormessage).

**Usage**

```js
const locator = page.getByTestId('username-input');
await expect(locator).toHaveAccessibleErrorMessage('Username is required.');
```

### param: LocatorAssertions.toHaveAccessibleErrorMessage.errorMessage
* since: v1.50
- `errorMessage` <[string]|[RegExp]>

Expected accessible error message.

### option: LocatorAssertions.toHaveAccessibleErrorMessage.timeout = %%-js-assertions-timeout-%%
* since: v1.50

### option: LocatorAssertions.toHaveAccessibleErrorMessage.signal = %%-js-assertions-signal-%%
* since: v1.62

### option: LocatorAssertions.toHaveAccessibleErrorMessage.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.50

### option: LocatorAssertions.toHaveAccessibleErrorMessage.ignoreCase = %%-assertions-ignore-case-%%
* since: v1.50

## async method: LocatorAssertions.toHaveAccessibleName
* since: v1.44
* langs:
  - alias-java: hasAccessibleName

Ensures the [Locator] points to an element with a given [accessible name](https://w3c.github.io/accname/#dfn-accessible-name).

**Usage**

```js
const locator = page.getByTestId('save-button');
await expect(locator).toHaveAccessibleName('Save to disk');
```

### param: LocatorAssertions.toHaveAccessibleName.name
* since: v1.44
- `name` <[string]|[RegExp]>

Expected accessible name.

### option: LocatorAssertions.toHaveAccessibleName.timeout = %%-js-assertions-timeout-%%
* since: v1.44

### option: LocatorAssertions.toHaveAccessibleName.signal = %%-js-assertions-signal-%%
* since: v1.62

### option: LocatorAssertions.toHaveAccessibleName.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.44

### option: LocatorAssertions.toHaveAccessibleName.ignoreCase = %%-assertions-ignore-case-%%
* since: v1.44

## async method: LocatorAssertions.toHaveAttribute
* since: v1.20
* langs:
  - alias-java: hasAttribute

Ensures the [Locator] points to an element with given attribute.

**Usage**

```js
const locator = page.locator('input');
await expect(locator).toHaveAttribute('type', 'text');
```

### param: LocatorAssertions.toHaveAttribute.name
* since: v1.18
- `name` <[string]>

Attribute name.

### param: LocatorAssertions.toHaveAttribute.value
* since: v1.18
- `value` <[string]|[RegExp]>

Expected attribute value.

### param: LocatorAssertions.toHaveAttribute.value
* since: v1.62
* langs: python
- `value` ?<[string]|[RegExp]>

Expected attribute value. If not specified, the assertion verifies that the attribute is present.

### option: LocatorAssertions.toHaveAttribute.timeout = %%-js-assertions-timeout-%%
* since: v1.18

### option: LocatorAssertions.toHaveAttribute.signal = %%-js-assertions-signal-%%
* since: v1.62

### option: LocatorAssertions.toHaveAttribute.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.18

### option: LocatorAssertions.toHaveAttribute.ignoreCase = %%-assertions-ignore-case-%%
* since: v1.40

## async method: LocatorAssertions.toHaveAttribute#2
* since: v1.39
* langs: js

Ensures the [Locator] points to an element with given attribute. The method will assert attribute
presence.

```js
const locator = page.locator('input');
// Assert attribute existence.
await expect(locator).toHaveAttribute('disabled');
await expect(locator).not.toHaveAttribute('open');
```

### param: LocatorAssertions.toHaveAttribute#2.name
* since: v1.39
- `name` <[string]>

Attribute name.

### option: LocatorAssertions.toHaveAttribute#2.timeout = %%-js-assertions-timeout-%%
* since: v1.39

### option: LocatorAssertions.toHaveAttribute#2.signal = %%-js-assertions-signal-%%
* since: v1.62

## async method: LocatorAssertions.toHaveClass
* since: v1.20
* langs:
  - alias-java: hasClass

Ensures the [Locator] points to an element with given CSS classes. When a string is provided, it must fully match the element's `class` attribute. To match individual classes use `LocatorAssertions.toContainClass()`.

**Usage**

```html
<div class='middle selected row' id='component'></div>
```

```js
const locator = page.locator('#component');
await expect(locator).toHaveClass('middle selected row');
await expect(locator).toHaveClass(/(^|\s)selected(\s|$)/);
```

When an array is passed, the method asserts that the list of elements located matches the corresponding list of expected class values. Each element's class attribute is matched against the corresponding string or regular expression in the array:

```js
const locator = page.locator('.list > .component');
await expect(locator).toHaveClass(['component', 'component selected', 'component']);
```

### param: LocatorAssertions.toHaveClass.expected
* since: v1.18
* langs: js
- `expected` <[string]|[RegExp]|[Array]<[string]|[RegExp]>>

Expected class or RegExp or a list of those.

### param: LocatorAssertions.toHaveClass.expected
* since: v1.18
* langs: python
- `expected` <[string]|[RegExp]|[Array]<[string]>|[Array]<[RegExp]>|[Array]<[string]|[RegExp]>>

Expected class or RegExp or a list of those.

### param: LocatorAssertions.toHaveClass.expected
* since: v1.18
* langs: java, csharp
- `expected` <[string]|[RegExp]|[Array]<[string]>|[Array]<[RegExp]>>

Expected class or RegExp or a list of those.

### option: LocatorAssertions.toHaveClass.timeout = %%-js-assertions-timeout-%%
* since: v1.18

### option: LocatorAssertions.toHaveClass.signal = %%-js-assertions-signal-%%
* since: v1.62

### option: LocatorAssertions.toHaveClass.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.18

## async method: LocatorAssertions.toHaveCount
* since: v1.20
* langs:
  - alias-java: hasCount

Ensures the [Locator] resolves to an exact number of DOM nodes.

**Usage**

```js
const list = page.locator('list > .component');
await expect(list).toHaveCount(3);
```

### param: LocatorAssertions.toHaveCount.count
* since: v1.18
- `count` <[int]>

Expected count.

### option: LocatorAssertions.toHaveCount.timeout = %%-js-assertions-timeout-%%
* since: v1.18

### option: LocatorAssertions.toHaveCount.signal = %%-js-assertions-signal-%%
* since: v1.62

### option: LocatorAssertions.toHaveCount.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.18

## async method: LocatorAssertions.toHaveCSS
* since: v1.20
* langs:
  - alias-java: hasCSS

Ensures the [Locator] resolves to an element with the given computed CSS style.

**Usage**

```js
const locator = page.getByRole('button');
await expect(locator).toHaveCSS('display', 'flex');
```

### param: LocatorAssertions.toHaveCSS.name
* since: v1.18
- `name` <[string]>

CSS property name.

### param: LocatorAssertions.toHaveCSS.value
* since: v1.18
- `value` <[string]|[RegExp]>

CSS property value.

### option: LocatorAssertions.toHaveCSS.pseudo
* since: v1.60
- `pseudo` <[PseudoElement]<"before"|"after">>

Pseudo-element to read computed styles from.

### option: LocatorAssertions.toHaveCSS.timeout = %%-js-assertions-timeout-%%
* since: v1.18

### option: LocatorAssertions.toHaveCSS.signal = %%-js-assertions-signal-%%
* since: v1.62

### option: LocatorAssertions.toHaveCSS.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.18

## async method: LocatorAssertions.toHaveId
* since: v1.20
* langs:
  - alias-java: hasId

Ensures the [Locator] points to an element with the given DOM Node ID.

**Usage**

```js
const locator = page.getByRole('textbox');
await expect(locator).toHaveId('lastname');
```

### param: LocatorAssertions.toHaveId.id
* since: v1.18
- `id` <[string]|[RegExp]>

Element id.

### option: LocatorAssertions.toHaveId.timeout = %%-js-assertions-timeout-%%
* since: v1.18

### option: LocatorAssertions.toHaveId.signal = %%-js-assertions-signal-%%
* since: v1.62

### option: LocatorAssertions.toHaveId.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.18

## async method: LocatorAssertions.toHaveJSProperty
* since: v1.20
* langs:
  - alias-java: hasJSProperty

Ensures the [Locator] points to an element with given JavaScript property. Note that this property can be
of a primitive type as well as a plain serializable JavaScript object.

**Usage**

```js
const locator = page.locator('.component');
await expect(locator).toHaveJSProperty('loaded', true);
```

### param: LocatorAssertions.toHaveJSProperty.name
* since: v1.18
- `name` <[string]>

Property name.

### param: LocatorAssertions.toHaveJSProperty.value
* since: v1.18
- `value` <[any]>

Property value.

### option: LocatorAssertions.toHaveJSProperty.timeout = %%-js-assertions-timeout-%%
* since: v1.18

### option: LocatorAssertions.toHaveJSProperty.signal = %%-js-assertions-signal-%%
* since: v1.62

### option: LocatorAssertions.toHaveJSProperty.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.18

## async method: LocatorAssertions.toHaveRole
* since: v1.44
* langs:
  - alias-java: hasRole

Ensures the [Locator] points to an element with a given [ARIA role](https://www.w3.org/TR/wai-aria-1.2/#roles).

Note that role is matched as a string, disregarding the ARIA role hierarchy. For example, asserting  a superclass role `"checkbox"` on an element with a subclass role `"switch"` will fail.

**Usage**

```js
const locator = page.getByTestId('save-button');
await expect(locator).toHaveRole('button');
```

### param: LocatorAssertions.toHaveRole.role = %%-get-by-role-to-have-role-role-%%
* since: v1.44

### option: LocatorAssertions.toHaveRole.timeout = %%-js-assertions-timeout-%%
* since: v1.44

### option: LocatorAssertions.toHaveRole.signal = %%-js-assertions-signal-%%
* since: v1.62

### option: LocatorAssertions.toHaveRole.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.44

## async method: LocatorAssertions.toHaveScreenshot#1
* since: v1.23
* langs: js

This function will wait until two consecutive locator screenshots
yield the same result, and then compare the last screenshot with the expectation.

**Usage**

```js
const locator = page.getByRole('button');
await expect(locator).toHaveScreenshot('image.png');

// Store the snapshot in the WebP format.
await expect(locator).toHaveScreenshot('image.webp');
```

Note that screenshot assertions only work with Playwright test runner.

### param: LocatorAssertions.toHaveScreenshot#1.name
* since: v1.23
- `name` <[string]|[Array]<[string]>>

Snapshot name. Must have a `.png` or `.webp` extension, the screenshot is captured in the corresponding format. Both formats are lossless.

### option: LocatorAssertions.toHaveScreenshot#1.timeout = %%-js-assertions-timeout-%%
* since: v1.23

### option: LocatorAssertions.toHaveScreenshot#1.signal = %%-js-assertions-signal-%%
* since: v1.62

### option: LocatorAssertions.toHaveScreenshot#1.animations = %%-screenshot-option-animations-default-disabled-%%
* since: v1.23

### option: LocatorAssertions.toHaveScreenshot#1.caret = %%-screenshot-option-caret-%%
* since: v1.23

### option: LocatorAssertions.toHaveScreenshot#1.mask = %%-screenshot-option-mask-%%
* since: v1.23

### option: LocatorAssertions.toHaveScreenshot#1.maskColor = %%-screenshot-option-mask-color-%%
* since: v1.35

### option: LocatorAssertions.toHaveScreenshot#1.stylePath = %%-screenshot-option-style-path-%%
* since: v1.41

### option: LocatorAssertions.toHaveScreenshot#1.omitBackground = %%-screenshot-option-omit-background-%%
* since: v1.23

### option: LocatorAssertions.toHaveScreenshot#1.scale = %%-screenshot-option-scale-default-css-%%
* since: v1.23

### option: LocatorAssertions.toHaveScreenshot#1.maxDiffPixels = %%-assertions-max-diff-pixels-%%
* since: v1.23

### option: LocatorAssertions.toHaveScreenshot#1.maxDiffPixelRatio = %%-assertions-max-diff-pixel-ratio-%%
* since: v1.23

### option: LocatorAssertions.toHaveScreenshot#1.threshold = %%-assertions-threshold-%%
* since: v1.23

## async method: LocatorAssertions.toHaveScreenshot#2
* since: v1.23
* langs: js

This function will wait until two consecutive locator screenshots
yield the same result, and then compare the last screenshot with the expectation.

The snapshot is stored in the PNG format. To store it in the WebP format instead, pass a snapshot name with the `.webp` extension.

**Usage**

```js
const locator = page.getByRole('button');
await expect(locator).toHaveScreenshot();
```

Note that screenshot assertions only work with Playwright test runner.

### option: LocatorAssertions.toHaveScreenshot#2.timeout = %%-js-assertions-timeout-%%
* since: v1.23

### option: LocatorAssertions.toHaveScreenshot#2.signal = %%-js-assertions-signal-%%
* since: v1.62

### option: LocatorAssertions.toHaveScreenshot#2.animations = %%-screenshot-option-animations-default-disabled-%%
* since: v1.23

### option: LocatorAssertions.toHaveScreenshot#2.caret = %%-screenshot-option-caret-%%
* since: v1.23

### option: LocatorAssertions.toHaveScreenshot#2.mask = %%-screenshot-option-mask-%%
* since: v1.23

### option: LocatorAssertions.toHaveScreenshot#2.maskColor = %%-screenshot-option-mask-color-%%
* since: v1.35

### option: LocatorAssertions.toHaveScreenshot#2.stylePath = %%-screenshot-option-style-path-%%
* since: v1.41

### option: LocatorAssertions.toHaveScreenshot#2.omitBackground = %%-screenshot-option-omit-background-%%
* since: v1.23

### option: LocatorAssertions.toHaveScreenshot#2.scale = %%-screenshot-option-scale-default-css-%%
* since: v1.23

### option: LocatorAssertions.toHaveScreenshot#2.maxDiffPixels = %%-assertions-max-diff-pixels-%%
* since: v1.23

### option: LocatorAssertions.toHaveScreenshot#2.maxDiffPixelRatio = %%-assertions-max-diff-pixel-ratio-%%
* since: v1.23

### option: LocatorAssertions.toHaveScreenshot#2.threshold = %%-assertions-threshold-%%
* since: v1.23

## async method: LocatorAssertions.toHaveText
* since: v1.20
* langs:
  - alias-java: hasText

Ensures the [Locator] points to an element with the given text. All nested elements will be considered when computing the text content of the element. You can use regular expressions for the value as well.

**Details**

When `expected` parameter is a string, Playwright will normalize whitespaces and line breaks both in the actual text and
in the expected string before matching. When regular expression is used, the actual text is matched as is.

**Usage**

```js
const locator = page.locator('.title');
await expect(locator).toHaveText(/Welcome, Test User/);
await expect(locator).toHaveText(/Welcome, .*/);
```

If you pass an array as an expected value, the expectations are:
1. Locator resolves to a list of elements.
1. The number of elements equals the number of expected values in the array.
1. Elements from the list have text matching expected array values, one by one, in order.

For example, consider the following list:

```html
<ul>
  <li>Text 1</li>
  <li>Text 2</li>
  <li>Text 3</li>
</ul>
```

Let's see how we can use the assertion:

```js
// ✓ Has the right items in the right order
await expect(page.locator('ul > li')).toHaveText(['Text 1', 'Text 2', 'Text 3']);

// ✖ Wrong order
await expect(page.locator('ul > li')).toHaveText(['Text 3', 'Text 2', 'Text 1']);

// ✖ Last item does not match
await expect(page.locator('ul > li')).toHaveText(['Text 1', 'Text 2', 'Text']);

// ✖ Locator points to the outer list element, not to the list items
await expect(page.locator('ul')).toHaveText(['Text 1', 'Text 2', 'Text 3']);
```

### param: LocatorAssertions.toHaveText.expected
* since: v1.18
* langs: js
- `expected` <[string]|[RegExp]|[Array]<[string]|[RegExp]>>

Expected string or RegExp or a list of those.

### param: LocatorAssertions.toHaveText.expected
* since: v1.18
* langs: python
- `expected` <[string]|[RegExp]|[Array]<[string]>|[Array]<[RegExp]>|[Array]<[string]|[RegExp]>>

Expected string or RegExp or a list of those.

### param: LocatorAssertions.toHaveText.expected
* since: v1.18
* langs: java, csharp
- `expected` <[string]|[RegExp]|[Array]<[string]>|[Array]<[RegExp]>>

Expected string or RegExp or a list of those.

### option: LocatorAssertions.toHaveText.ignoreCase = %%-assertions-ignore-case-%%
* since: v1.23

### option: LocatorAssertions.toHaveText.useInnerText
* since: v1.18
- `useInnerText` <[boolean]>

Whether to use `element.innerText` instead of `element.textContent` when retrieving DOM node text.

### option: LocatorAssertions.toHaveText.timeout = %%-js-assertions-timeout-%%
* since: v1.18

### option: LocatorAssertions.toHaveText.signal = %%-js-assertions-signal-%%
* since: v1.62

### option: LocatorAssertions.toHaveText.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.18

## async method: LocatorAssertions.toHaveValue
* since: v1.20
* langs:
  - alias-java: hasValue

Ensures the [Locator] points to an element with the given input value. You can use regular expressions for the value as well.

**Usage**

```js
const locator = page.locator('input[type=number]');
await expect(locator).toHaveValue(/[0-9]/);
```

### param: LocatorAssertions.toHaveValue.value
* since: v1.18
- `value` <[string]|[RegExp]>

Expected value.

### option: LocatorAssertions.toHaveValue.timeout = %%-js-assertions-timeout-%%
* since: v1.18

### option: LocatorAssertions.toHaveValue.signal = %%-js-assertions-signal-%%
* since: v1.62

### option: LocatorAssertions.toHaveValue.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.18

## async method: LocatorAssertions.toHaveValues
* since: v1.23
* langs:
  - alias-java: hasValues

Ensures the [Locator] points to multi-select/combobox (i.e. a `select` with the `multiple` attribute) and the specified values are selected.

**Usage**

For example, given the following element:

```html
<select id="favorite-colors" multiple>
  <option value="R">Red</option>
  <option value="G">Green</option>
  <option value="B">Blue</option>
</select>
```

```js
const locator = page.locator('id=favorite-colors');
await locator.selectOption(['R', 'G']);
await expect(locator).toHaveValues([/R/, /G/]);
```

### param: LocatorAssertions.toHaveValues.values
* since: v1.23
* langs: js
- `values` <[Array]<[string]|[RegExp]>>

Expected options currently selected.

### param: LocatorAssertions.toHaveValues.values
* since: v1.23
* langs: python
- `values` <[Array]<[string]>|[Array]<[RegExp]>|[Array]<[string]|[RegExp]>>

Expected options currently selected.

### param: LocatorAssertions.toHaveValues.values
* since: v1.23
* langs: java, csharp
- `values` <[Array]<[string]>|[Array]<[RegExp]>>

Expected options currently selected.

### option: LocatorAssertions.toHaveValues.timeout = %%-js-assertions-timeout-%%
* since: v1.23

### option: LocatorAssertions.toHaveValues.signal = %%-js-assertions-signal-%%
* since: v1.62

### option: LocatorAssertions.toHaveValues.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.23

## async method: LocatorAssertions.toMatchAriaSnapshot
* since: v1.49
* langs:
  - alias-java: matchesAriaSnapshot

Asserts that the target element matches the given [accessibility snapshot](../aria-snapshots.md).

**Usage**

```js
await page.goto('https://demo.playwright.dev/todomvc/');
await expect(page.locator('body')).toMatchAriaSnapshot(`
  - heading "todos"
  - textbox "What needs to be done?"
`);
```

### param: LocatorAssertions.toMatchAriaSnapshot.expected
* since: v1.49
- `expected` <string>

### option: LocatorAssertions.toMatchAriaSnapshot.timeout = %%-js-assertions-timeout-%%
* since: v1.49

### option: LocatorAssertions.toMatchAriaSnapshot.signal = %%-js-assertions-signal-%%
* since: v1.62

### option: LocatorAssertions.toMatchAriaSnapshot.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.49

## async method: LocatorAssertions.toMatchAriaSnapshot#2
* since: v1.50
* langs: js

Asserts that the target element matches the given [accessibility snapshot](../aria-snapshots.md).

Snapshot is stored in a separate `.aria.yml` file in a location configured by `expect.toMatchAriaSnapshot.pathTemplate` and/or `snapshotPathTemplate` properties in the configuration file.

**Usage**

```js
await expect(page.locator('body')).toMatchAriaSnapshot();
await expect(page.locator('body')).toMatchAriaSnapshot({ name: 'body.aria.yml' });
```

### option: LocatorAssertions.toMatchAriaSnapshot#2.name
* since: v1.50
* langs: js
- `name` <[string]>

Name of the snapshot to store in the snapshot folder corresponding to this test.
Generates sequential names if not specified.

### option: LocatorAssertions.toMatchAriaSnapshot#2.timeout = %%-js-assertions-timeout-%%
* since: v1.50

### option: LocatorAssertions.toMatchAriaSnapshot#2.signal = %%-js-assertions-signal-%%
* since: v1.62

### option: LocatorAssertions.toMatchAriaSnapshot#2.timeout = %%-csharp-java-python-assertions-timeout-%%
* since: v1.50
