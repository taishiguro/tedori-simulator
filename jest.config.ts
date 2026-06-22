import type { Config } from 'jest'

const config: Config = {
  testEnvironment: 'node',
  transform: { '^.+\\.tsx?$': ['ts-jest', {}] },
  testMatch: ['**/tests/**/*.test.ts'],
  collectCoverageFrom: ['lib/**/*.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
}
export default config
