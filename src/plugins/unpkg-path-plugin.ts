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

        if (args.path.includes('./') || args.path.includes('../')) {
          return {
            namespace: 'a',
            path: new URL(args.path, args.importer + '/').href
          }
        }

        return {
          namespace: 'a',
          path: `https://unpkg.com/${args.path}`
        }
      })
      //we provide the package to be loaded then return control to esbuild
      build.onLoad({ filter: /.*/ }, async (args: any) => {
        console.log('onLoad', args)

        if (args.path === 'index.js') {
          return {
            loader: 'jsx',
            contents: `
            const message = require('medium-test-pkg');
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
