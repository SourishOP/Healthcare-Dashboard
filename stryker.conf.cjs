/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
module.exports = {
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress'],
  testRunner: 'vitest',
  coverageAnalysis: 'perTest',
  mutate: [
    'src/contexts/**/*.tsx',
    'src/hooks/**/*.ts',
    'src/lib/**/*.ts',
    '!src/**/*.test.*'
  ],
  thresholds: {
    high: 80,
    low: 60,
    break: 50
  }
};
