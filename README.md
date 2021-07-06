# lerna-link-deps
> Symlink *all instances* of a dependency within a [Lerna](https://lerna.js.org) multi-package project.

As an example of *not* using this library, you'd have to manually run `npm link pkg` for *each* of these:
* `/project/packages/A/node_modules/pkg`
* `/project/packages/B/node_modules/pkg`
* `/project/packages/C/node_modules/another-pkg/node_modules/pkg`


## Installation
[Node.js](https://nodejs.org) `>= 14` is required. Type this at the command line:
```shell
npm install -g lerna-link-deps
```

(Of course, it's recommended to *not* install globally and instead wrap your usage in [npm scripts](https://docs.npmjs.com/misc/scripts/)).


## Usage
```shell
lerna-link-deps --pkgName=pkg --pkgDir=../pkg-repo
```
```shell
lerna-link-deps --help
```
