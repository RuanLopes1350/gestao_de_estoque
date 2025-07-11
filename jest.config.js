export default {
  transform: {
    "^.+\\.js$": "babel-jest"
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "/tests-exemplo/"
  ],
  testEnvironment: "node",
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  }
};