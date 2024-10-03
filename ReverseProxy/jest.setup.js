// jest.setup.js

// This will make console.log output visible in test output
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  console.log = jest.fn((...args) => {
    originalConsoleLog('Console.log:', ...args);
  });
  console.error = jest.fn((...args) => {
    originalConsoleError('Console.error:', ...args);
  });
  console.warn = jest.fn((...args) => {
    originalConsoleWarn('Console.warn:', ...args);
  });
});

afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

// You can also add other global setup code here, such as:

// Set a global timeout for all tests (if needed)
jest.setTimeout(120000); // 30 seconds

// Set up global mocks or environment variables
process.env.NODE_ENV = 'test';