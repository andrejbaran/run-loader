[![CircleCI](https://img.shields.io/circleci/project/github/andrejbaran/webpack-run-loader/master.svg)](https://circleci.com/gh/andrejbaran/webpack-run-loader)
[![codecov](https://img.shields.io/codecov/c/github/andrejbaran/webpack-run-loader/master.svg)](https://codecov.io/gh/andrejbaran/webpack-run-loader)
[![Codacy Badge](https://img.shields.io/codacy/grade/9a9ac6f1a2ad4bf68359ff63bf50dc09/master.svg)](https://www.codacy.com/app/andrej.baran/webpack-run-loader?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=andrejbaran/webpack-run-loader&amp;utm_campaign=Badge_Grade)
[![npm](https://img.shields.io/npm/v/webpack-run-loader.svg)](https://www.npmjs.com/package/webpack-run-loader)
![gh-issues-open](https://img.shields.io/github/issues/andrejbaran/webpack-run-loader.svg)
![gh-issues-closed](https://img.shields.io/github/issues-closed/andrejbaran/webpack-run-loader.svg)
![gh-pr-open](https://img.shields.io/github/issues-pr/andrejbaran/webpack-run-loader.svg)
![gh-pr-closed](https://img.shields.io/github/issues-pr-closed/andrejbaran/webpack-run-loader.svg)

## Info
A webpack loader that executes function exported by previous loader and exports or returns the result.
It is a mix of [apply-loader](https://github.com/mogelbrod/apply-loader) and [extract-loader](https://github.com/peerigon/extract-loader). See [Options](#options) for more details.

### Reasoning / Alternatives
You probably can get away with using `apply-loader` with `extract-loader`.
The reason why this loader was made is a specific scenario where a loader exports a function but
also uses imports inside the script (e.g. `pug-loader`). This doesn't play nice with `extract-laoder`
because of the way it replaces imports (as it wasn't meant for this scenario I guess).

## Install

```shell
npm i webpack-run-loader
yarn add webpack-run-loader
```

## Usage
For demonstration purposes let's say a loader uses this script to export a function:
```js
const runtime = require("some-runtime");

module.exports = function(optionalArg) {
    doSomeStuff();

    const context = this.createContext(optionalArg);

    return runtime.yay(context);
}
```
### Options
You can specify loader options the regular way in your webpack config:
```js
{
    ...
    module: {
        ...
        {
            loader: "webpack-run-loader",
            options: {
                ...
            }
        }
    }
    ...
}
```

* [export: boolean](#export)
* [stringify: boolean](#stringify)
* [context: (loaderContext) => any](#context)
* [args: array](#args)

### context: (loaderContext) => any
Function that returns context that will be exposed as `this` while running the exported function.
This might be useful when you want to return the result of the function (`export false`) and you know the exported function is using `this` and you need to provide it.

#### Signature
`(loaderContext) => any` where `loaderContext` is webpack's loader [context](https://webpack.js.org/api/loaders/#the-loader-context)
#### Example
```js
{
    loader: "webpack-run-loader",
    options: {
        context: (ctx) => {
            return {
                // we need to provide createContext in order for the script to work
                createContext(optionalArg) {
                    ....
                }
            };
        }
    }
}
```

### args: Array
Array of arguments passed to exported function when executing it.
#### Example
```js
{
    loader: "webpack-run-loader",
    options: {
        context: (ctx) => {
            return {
                createContext(optionalArg) {
                    // optionalArg will be ourOptionalArg
                    ....
                }
            };
        },
        args: [ourOptionalArg]
    }
}
```

### export: boolean
Specifies whether the loader exports or returns the result of exported function.
Default is `false`.
 * `true` makes `webpack-run-loader` behave the same way as `apply-loader`.
 Note that `args` option isn't fully compatible
 * `false` makes `webpack-run-loader`behave the same way as `extract-loader` with the exception,
 that it extracts the result of the function call instead of the source of the module.

Usually you want to set export to `true` if you need to further process the result in other loaders
and you want to set it to `false` if you want to extract the result into a file (e.g. with [file-loader](https://github.com/webpack-contrib/file-loader))
#### Example (true)
```js
{
    loader: "webpack-run-loader",
    options: {
        context: (ctx) => {
            return {
                createContext(optionalArg) {
                    ....
                }
            };
        },
        export: true
    }
}

// webpack-run-laoder will act as a "pitching" laoder
// and returns a script like the one below, same as apply-loader:

...
var req = require(/* remaining reuest in the loader chain */);
module.exports = (req["default"] || req).apply(/* context */, /* array of args */);

```

#### Example (false)
```js
{
    loader: "webpack-run-loader",
    options: {
        context: (ctx) => {
            return {
                createContext(optionalArg) {
                    ....
                }
            };
        },
        export: false // default
    }
}

// webpack-run-laoder will return the raw result of the exported function.

```

Read more about [loaders](https://webpack.js.org/concepts/loaders/) and [pitching loaders](https://webpack.js.org/api/loaders/#pitching-loader).

## stringify: boolean
Specifies whether the exported function's result will be ran through `JSON.stringify` or not. 
Default is `false`.
