export default {
  transform: {
    "^.+\\.js$": "babel-jest"
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "/tests/"
  ]
};