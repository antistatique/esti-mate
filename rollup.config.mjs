import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';

export default [
  {
    input: 'src/content/index.js',
    output: {
      file: 'dist/content.js',
      format: 'iife',  // Individual bundle in IIFE format
    },
    plugins: [
      resolve(),
      commonjs(),
    ],
  },
  {
    input: 'src/background/index.js',
    output: {
      file: 'dist/background.js',
      format: 'iife',  // Individual bundle in IIFE format
    },
    plugins: [
      resolve(),
      commonjs(),
    ],
  },
  {
    input: 'src/options/options.js',
    output: {
      file: 'dist/options.js',
      format: 'iife',  // Individual bundle in IIFE format
    },
    plugins: [
      resolve(),
      commonjs(),
    ],
  },
  {
    // A configuration to handle copying static assets
    input: 'src/dummy.js',  // Dummy input just to trigger the plugin
    output: {
      file: 'dist/dummy.js',  // This output is ignored, dummy output
      format: 'iife',  // Dummy format, will not be used
    },
    plugins: [
      copy({
        targets: [
          { src: 'manifest.json', dest: 'dist' },
          { src: 'src/options/index.html', dest: 'dist', rename: 'options.html' },
          { src: 'src/options/options.css', dest: 'dist', rename: 'options.css' },
          { src: 'src/content/content.css', dest: 'dist', rename: 'content.css' },
          { src: 'assets/*', dest: 'dist/assets' },
        ],
        // Copy after each rebuild so CSS/assets are always fresh in dist
        hook: 'writeBundle',
        watch: [
          'manifest.json',
          'src/options/index.html',
          'src/options/options.css',
          'src/content/content.css',
          'assets/**'
        ],
      }),
    ],
  }
];
