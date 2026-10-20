# class: FullProject
* since: v1.10
* langs: js

Runtime representation of the test project configuration. It is accessible in the tests via `TestInfo.project` and `WorkerInfo.project` and is passed to the test reporters. To see the format of the project in the Playwright configuration file please see [TestProject] instead.

## property: FullProject.dependencies
* since: v1.31
- type: <[Array]<[string]>>

See `TestProject.dependencies`.

## property: FullProject.grep
* since: v1.10
- type: <[RegExp]|[Array]<[RegExp]>>

See `TestProject.grep`.

## property: FullProject.grepInvert
* since: v1.10
- type: <[null]|[RegExp]|[Array]<[RegExp]>>

See `TestProject.grepInvert`.

## property: FullProject.ignoreSnapshots
* since: v1.59
- type: <[boolean]>

See `TestProject.ignoreSnapshots`.

## property: FullProject.metadata
* since: v1.10
- type: <[Metadata]>

See `TestProject.metadata`.

## property: FullProject.name
* since: v1.10
- type: <[string]>

See `TestProject.name`.

## property: FullProject.snapshotDir
* since: v1.10
- type: <[string]>

See `TestProject.snapshotDir`.

## property: FullProject.outputDir
* since: v1.10
- type: <[string]>

See `TestProject.outputDir`.

## property: FullProject.repeatEach
* since: v1.10
- type: <[int]>

See `TestProject.repeatEach`.

## property: FullProject.retries
* since: v1.10
- type: <[int]>

See `TestProject.retries`.

## property: FullProject.teardown
* since: v1.34
- type: ?<[string]>

See `TestProject.teardown`.

## property: FullProject.testDir
* since: v1.10
- type: <[string]>

See `TestProject.testDir`.

## property: FullProject.testIgnore
* since: v1.10
- type: <[string]|[RegExp]|[Array]<[string]|[RegExp]>>

See `TestProject.testIgnore`.

## property: FullProject.testMatch
* since: v1.10
- type: <[string]|[RegExp]|[Array]<[string]|[RegExp]>>

See `TestProject.testMatch`.

## property: FullProject.timeout
* since: v1.10
- type: <[int]>

See `TestProject.timeout`.

## property: FullProject.use
* since: v1.10
- type: <[Fixtures]>

See `TestProject.use`.
