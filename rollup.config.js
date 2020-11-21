import { terser } from "rollup-plugin-terser";
import typescript from 'rollup-plugin-typescript2';

export default {
    input: './src/index.ts',

    output: [
        {
            file: './dist/patternlock.js',
            format: 'iife',
            name: 'PatternLock'
        },
        {
            file: './dist/patternlock.min.js',
            format: 'iife',
            name: 'PatternLock',
            plugins: [
                terser()
            ]
        },

        {
            file: "./dist/patternlock.esm.js",
            format: "esm",
            name: 'patternlock'
        },
        {
            file: "./dist/patternlock.esm.min.js",
            format: "esm",
            name: 'patternlock',
            plugins: [
                terser()
            ]
        },

        {
            file: "./dist/patternlock.amd.js",
            format: "amd",
            name: 'patternlock'
        },
        {
            file: "./dist/patternlock.amd.min.js",
            format: "amd",
            name: 'patternlock',
            plugins: [
                terser()
            ]
        },

        {
            file: "./dist/patternlock.umd.js",
            format: "umd",
            name: 'patternlock'
        },
        {
            file: "./dist/patternlock.umd.min.js",
            format: "umd",
            name: 'patternlock',
            plugins: [
                terser()
            ]
        }
    ],

    plugins: [
        typescript({
            tsconfig: 'tsconfig.json',
        })
    ]
}