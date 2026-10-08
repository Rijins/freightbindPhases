// Jest configuration for the FreightBind backend.
//
// The backend is CommonJS plain JavaScript. Tests live in tests/ and must
// not require a live MongoDB or a .env file — pure logic and mocked model
// units only (see tests/README.md). This keeps `npm test` runnable in CI
// without a database.

/** @type {import('jest').Config} */
const config = {
    testEnvironment: "node",
    testMatch: ["**/tests/**/*.test.js"],
    testPathIgnorePatterns: ["/node_modules/"],
    clearMocks: true,
    collectCoverageFrom: ["services/**/*.js", "helpers/**/*.js", "sockets/**/*.js"],
};

module.exports = config;