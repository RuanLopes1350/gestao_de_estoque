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
  },
  // Configuração específica para testes de integração
  setupFilesAfterEnv: [],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/seeds/**",
    "!src/docs/**",
    "!src/test/**"
  ],
  coverageReporters: [
    "text",
    "lcov",
    "html"
  ],
  // Separar testes unitários e de integração
  projects: [
    {
      displayName: "unit",
      testMatch: [
        "<rootDir>/tests/**/*.test.js",
        "!<rootDir>/tests/integration/**"
      ],
      testEnvironment: "node"
    },
    {
      displayName: "integration", 
      testMatch: [
        "<rootDir>/tests/integration/**/*.test.js"
      ],
      testEnvironment: "node",
      maxWorkers: 1
    }
  ]
};