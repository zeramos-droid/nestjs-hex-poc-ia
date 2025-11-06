module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.dto.ts',
    '!src/**/index.ts',
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/test/',
    '/dist/',
    '.interface.ts$',
    '.dto.ts$',
    '.module.ts$',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 90,
      lines: 95,
      statements: 95,
    },
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/coverage/'],
  setupFilesAfterEnv: ['<rootDir>/test/infrastructure/setup.ts'],
};
