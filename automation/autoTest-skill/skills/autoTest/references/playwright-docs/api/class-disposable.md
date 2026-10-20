# class: Disposable
* since: v1.59
* langs: js

[Disposable] is returned from various methods to allow undoing the corresponding action. For example,
`Page.addInitScript()` returns a [Disposable] that can be used to remove the init script.

## async method: Disposable.dispose
* since: v1.59

Removes the associated resource. For example, removes the init script installed via
`Page.addInitScript()` or `BrowserContext.addInitScript()`.
