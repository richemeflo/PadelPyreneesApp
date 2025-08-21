import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^\\.\\./ui/(.*)$': '<rootDir>/src/components/ui/__mocks__/index.ts',
    '^.+\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.jest.json'
    }
  }
};

export default config;
