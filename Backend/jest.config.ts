import type { Config } from 'jest'

const config: Config = {
  testEnvironment: "node",
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[tj]s?(x)"
  ],
  testPathIgnorePatterns: [
    "\\\\node_modules\\\\"
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  roots: [
    "./src"
  ],
  preset: 'ts-jest',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  passWithNoTests: true,
}

export default config