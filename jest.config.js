// // --------------- 1st version

// jest.config.js
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
 }


// // --------------- 2nd version

// // jest.config.ts
// import type { Config } from "@jest/types"

// const config: Config.InitialOptions = {
//   preset: "ts-jest",
//   testEnvironment: "node",
//   verbose: true,
//   automock: true,
// };

// export default config;


// // --------------- 3rd version
// import type { Config } from '@jest/types';

// const config: Config.InitialOptions = {
//   moduleFileExtensions: ['ts', 'tsx', 'js'],
//   moduleNameMapper: {
//     '^(.*)\\.js$': '$1',
//   },
//   testEnvironment: 'jest-environment-node',
//   transformIgnorePatterns: [
//     'node_modules/(?!aggregate-error|clean-stack|escape-string-regexp|indent-string|p-map)',
//   ],
// };

// module.exports = config;