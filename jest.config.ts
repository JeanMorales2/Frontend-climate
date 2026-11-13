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
    "!src/app/providers.tsx",
    "!src/components/background/particles.ts",
  ],
  coverageThreshold: { global: { branches: 85, functions: 85, lines: 85, statements: 85 } },
  coveragePathIgnorePatterns: ["node_modules", ".next", "coverage"],
};

export default createJestConfig(config);
