import * as esbuild from 'esbuild-wasm'
import axios from 'axios'

export const unpkgPathPlugin = () => {
  return {
    //mostly for debugging
    name: 'unpkg-path-plugin',
    //
    setup(build: esbuild.PluginBuild) {
      //hijacks esbuild trying to find the packages filepath and allows us to tell it what to look for.
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        console.log('onResolve', args)
        if (args.path === 'index.js') {
          return { path: args.path, namespace: 'a' }
        }

        // else if (args.path === 'tiny-test-pkg') {
        //   return {
        //     path: 'https://unpkg.com/tiny-test-pkg@1.0.0/index.js',
        //     namespace: 'a'
        //   }

        return {
          namespace: 'a',
          path: `https://unkpkg.com/{args.path}`
        }
      })
      //we provide the package to be loaded then return control to esbuild
      build.onLoad({ filter: /.*/ }, async (args: any) => {
        console.log('onLoad', args)

        if (args.path === 'index.js') {
          return {
            loader: 'jsx',
            contents: `
            const message = require('tiny-test-pkg');
            console.log(message);
            `
          }
        }

        const { data } = await axios.get(args.path)
        return {
          loader: 'jsx',
          contents: data
        }
      })
    }
  }
}
