[![CircleCI](https://circleci.com/gh/andrejbaran/webpack-run-loader.svg?style=svg)](https://circleci.com/gh/andrejbaran/webpack-run-loader)
[![codecov](https://codecov.io/gh/andrejbaran/webpack-run-loader/branch/master/graph/badge.svg)](https://codecov.io/gh/andrejbaran/webpack-run-loader)
# Info
A webpack loader that executes function exported by previous loader and exports or returns the result.
It is a mix of [apply-loader](https://github.com/mogelbrod/apply-loader) and [extract-loader](https://github.com/peerigon/extract-loader). See [Options](#options) for more details.

# Installation

```shell
npm i webpack-run-loader
yarn add webpack-run-loader
```

# Options
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
## context: Function
Function that returns context that will be exposed as `this` while running the exported function.
This might be useful when you want to return the result of the function (`export false`) and youknow the exported function is using `this` and you need to provide it.
### Signature
`(loaderContext) => any` where `loaderContext` is webpack's loader [context](https://webpack.js.org/api/loaders/#the-loader-context)
### Example
```js
{
    loader: "webpack-run-loader",
    options: {
        context: (ctx) => {
            return ...;
        }
    }
}
```

## args: Array
Array of arguments passed to exported function when executing it.

## export: boolean
Specifies whether the loader exports or returns the result of exported function.
Default is `false`.
 * `true` makes `webpack-run-loader` behave the same way as `apply-loader`.
 * `false` makes `webpack-run-loader`behave the same way as `extract-loader` with the exception, that it extracts the result of the function call instead of the source of the module.

Usually you want to set export to `true` if you need to further process the result in other loaders and you want to set it to `false` if you want to extract the result into a file (e.g. with [file-loader](https://github.com/webpack-contrib/file-loader))
 
## stringify: boolean
Specifies whether the exported function result will be ran through `JSON.stringify` or not. 
Default is `false`.
