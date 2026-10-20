# class: FormData
* since: v1.18
* langs: java, csharp, python

The [FormData] is used create form data that is sent via [APIRequestContext].

## method: FormData.append
* since: v1.44
- returns: <[FormData]>

Appends a new value onto an existing key inside a FormData object, or adds the key if it
does not already exist. File values can be passed either as `Path` or as `FilePayload`.
Multiple fields with the same name can be added.

The difference between `FormData.set()` and `FormData.append()` is that if the specified key already exists,
`FormData.set()` will overwrite all existing values with the new one, whereas `FormData.append()` will append
the new value onto the end of the existing set of values.

### param: FormData.append.name
* since: v1.44
- `name` <[string]>

Field name.

### param: FormData.append.value
* since: v1.44
- `value` <[string]|[boolean]|[int]|[path]|[Object]>
  * alias: FilePayload
  - `name` <[string]> File name
  - `mimeType` <[string]> File type
  - `buffer` <[Buffer]> File content

Field value.

### param: FormData.append.value
* since: v1.44
* langs: csharp
- `value` <[string]|[boolean]|[int]|[Object]>
  * alias: FilePayload
  - `name` <[string]> File name
  - `mimeType` <[string]> File type
  - `buffer` <[Buffer]> File content

Field value.

## method: FormData.create
* since: v1.18
* langs: java
- returns: <[FormData]>

Creates new instance of [FormData].

## method: FormData.set
* since: v1.18
- returns: <[FormData]>

Sets a field on the form. File values can be passed either as `Path` or as `FilePayload`.

### param: FormData.set.name
* since: v1.18
- `name` <[string]>

Field name.

### param: FormData.set.value
* since: v1.18
- `value` <[string]|[boolean]|[int]|[path]|[Object]>
  * alias: FilePayload
  - `name` <[string]> File name
  - `mimeType` <[string]> File type
  - `buffer` <[Buffer]> File content

Field value.

### param: FormData.set.value
* since: v1.18
* langs: csharp
- `value` <[string]|[boolean]|[int]|[Object]>
  * alias: FilePayload
  - `name` <[string]> File name
  - `mimeType` <[string]> File type
  - `buffer` <[Buffer]> File content

Field value.
