import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });
const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.test.{ts,tsx}",
    "!src/types/**",
    "!src/app/layout.tsx",
    "!src/**/index.ts",
  ],
  coverageThreshold: { global: { branches: 97, functions: 97, lines: 97, statements: 97 } },
  coveragePathIgnorePatterns: ["node_modules", ".next", "coverage"],
  modulePathIgnorePatterns: ["<rootDir>/.next/"],
};

export default createJestConfig(config);
