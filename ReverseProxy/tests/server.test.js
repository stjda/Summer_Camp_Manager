/**
 * Production Server Tests
 */
const request = require('supertest');
const http = require('http');
const https = require('https');
const fs = require('fs');
const {setupServer, createHttpsServer, createMainHttpsServer} = require('../Reverse_Proxy/server');
const loadAllowedOrigins = require('../util/allowedOrigins');
const { setupRenewalProcess } = require('../init_renewal');
const { renewCertificateIfNeeded } = require('../util/certificateHelpers/RenewalFunctions');
const { loadCertificate } = require('../util/CertDBHandler')
const makeHTTPSserver = require('../util/Servers/HTTPSserver');

jest.setTimeout(30000); // timeout to 30 seconds
jest.useFakeTimers();

// Mock Express and its Router
const mockRouter = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  use: jest.fn()
};

jest.mock('express', () => {
  const mockExpress = jest.fn(() => ({
    use: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    listen: jest.fn()
  }));
  mockExpress.json = jest.fn();
  mockExpress.static = jest.fn();
  mockExpress.Router = jest.fn(() => mockRouter);
  return mockExpress;
});

jest.mock('http-proxy-middleware', () => ({
  createProxyMiddleware: jest.fn(() => jest.fn())
}));

jest.mock('../util/healthCheck.js', () => ({
  getHealthStatus: jest.fn()
}));

jest.mock('../util/Servers/logger.js', () => jest.fn());

jest.mock('../util/certificateHelpers/RenewalFunctions', () => ({
  renewCertificateIfNeeded: jest.fn(),
  getCertificateExpirationDate: jest.fn(), 
  shouldRenewCertificate: jest.fn(), 
  obtainCertificateWithRetry: jest.fn(),
}));

jest.mock('../util/CertDBHandler', () => ({
  loadCertificate: jest.fn(),
}));

// Mock the server creation functions
jest.mock('../server', () => ({
  createMainHttpsServer: jest.fn()
}));

jest.mock('../util/Servers/HTTPSserver', () => jest.fn());

jest.mock('https', () => ({
  createServer: jest.fn(() => ({
    listen: jest.fn()
  }))
}));

jest.mock('http', () => ({
  createServer: jest.fn(() => ({
    listen: jest.fn()
  }))
}));

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn()
}));

jest.mock('../util/allowedOrigins', () => jest.fn());

jest.mock('../util/CertDBHandler', () => ({
  loadCertificate: jest.fn()
}));

// Mock controllers
jest.mock('../controllers/index', () => ({
  router: mockRouter
}));

jest.mock('../controllers/api/minioPost', () => ({}));
jest.mock('../controllers/api/minioGet', () => ({}));
jest.mock('../controllers/api/minioDelete', () => ({}));
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
describe('Server', () => {
    let app;
    let server;
    let allowedOrigins;

    beforeAll(async () => {
        console.log('Setting up test environment');
        process.env.NODE_ENV = 'production';
        allowedOrigins = await loadAllowedOrigins();
        console.log('Allowed origins for tests:', allowedOrigins);
        process.env.ALLOWED_ORIGIN = allowedOrigins[0]; // Set the first allowed origin as the test origin
        app = await setupServer();
        server = app.listen(0);
    });

    afterAll(async () => {
        await new Promise((resolve) => server.close(resolve));
    });

    it('should respond to health check', async () => {
        const res = await request(server).get('/health');
        expect(res.statusCode).toBe(200);
    });

    it('should enforce CORS in test environment', async () => {
        console.log('Starting CORS test');
        const res = await request(app)
          .get('/health')
          .set('Origin', 'http://example.com')
          .set('Host', 'localhost');
    
        console.log('CORS test - Request headers:', res.req.getHeaders());
        console.log('CORS test - Response status:', res.status);
        console.log('CORS test - Response body:', res.body);
        console.log('CORS test - Response headers:', res.headers);
    
        expect(res.status).toBe(403);
        expect(res.body).toEqual({ error: 'Not allowed by CORS' });
      });
    
      it('should allow requests from allowed origin', async () => {
        console.log('Starting allowed origin test');
        const res = await request(app)
          .get('/health')
          .set('Origin', 'https://guyycodes.github.io')
          .set('Host', 'localhost');
    
        console.log('Allowed origin test - Request headers:', res.req.getHeaders());
        console.log('Allowed origin test - Response status:', res.status);
        console.log('Allowed origin test - Response body:', res.body);
        console.log('Allowed origin test - Response headers:', res.headers);
    
        expect(res.status).toBe(200);
        expect(res.headers['access-control-allow-origin']).toBe('https://guyycodes.github.io');
      });

    it('should allow requests from allowed origin in production', async () => {
        const res = await request(server)
            .get('/api/test/some-endpoint#2')
            .set('Origin', process.env.ALLOWED_ORIGIN);
        console.log('Test response:', res.status, res.body);
        expect(res.statusCode).not.toBe(403);
    });

    it('should not allow requests from dis-allowed origin in production', async () => {
        const res = await request(server)
            .get('/api/test/some-endpoint#3')
            .set('Origin', "https://dis-allowed-origin.io");
        console.log('Test response:', res.status, res.body);
        expect(res.statusCode).toBe(403);
    });

    it('should handle rate limiting', async () => {
        const requests = Array(101).fill().map(() => request(server).get('/api/test/some-endpoint').set('Origin', 'https://guyycodes.github.io'));
        const responses = await Promise.all(requests);
        const lastResponse = responses[responses.length - 1];
        expect(lastResponse.statusCode).toBe(429);
      });

    it('should handle requests with no origin header', async () => {
        console.log('Starting no origin header test');
        const res = await request(app)
          .get('/health')
          .set('Host', 'localhost');
      
        console.log('No origin header test - Response status:', res.status);
        console.log('No origin header test - Response body:', res.body);
        console.log('No origin header test - Response headers:', res.headers);
      
        expect(res.status).toBe(200);
        expect(res.headers['access-control-allow-origin']).toBeUndefined();
      });

      it('should handle CORS preflight requests', async () => {
        console.log('Starting CORS preflight request test');
        const res = await request(app)
          .options('/health')
          .set('Origin', 'https://guyycodes.github.io')
          .set('Access-Control-Request-Method', 'GET')
          .set('Access-Control-Request-Headers', 'Content-Type');
      
        console.log('CORS preflight test - Response status:', res.status);
        console.log('CORS preflight test - Response headers:', res.headers);
      
        expect(res.status).toBe(200);
        expect(res.headers['access-control-allow-origin']).toBe('https://guyycodes.github.io');
        expect(res.headers['access-control-allow-methods']).toBeDefined();
        expect(res.headers['access-control-allow-headers']).toBeDefined();
      });

      describe('Server HTTPS Configuration', () => {
        let originalNodeEnv;
        let app;
      
        beforeAll(async () => {
          originalNodeEnv = process.env.NODE_ENV;
          process.env.NODE_ENV = 'production';
          
          // Mock certificate loading
          fs.readFileSync.mockImplementation((path) => {
            if (path.includes('private-key.pem')) return 'mock-key';
            if (path.includes('certificate.pem')) return 'mock-cert';
            throw new Error('Unexpected file read');
          });
      
          // Mock https.createServer
          const mockHttpsServer = {
            listen: jest.fn(),
            on: jest.fn()
          };
          https.createServer.mockReturnValue(mockHttpsServer);
      
          // Call setupServer to initialize the app and HTTPS functions
          app = await setupServer();
        });
      
        afterAll(() => {
          process.env.NODE_ENV = originalNodeEnv;
        });
      
        beforeEach(() => {
          jest.clearAllMocks();
        });
      
        it('should correctly configure HTTPS servers', async () => {
          // Trigger HTTPS server creation
          await createHttpsServer();
          await createMainHttpsServer();
      
          // Check if https.createServer was called
          expect(https.createServer).toHaveBeenCalledTimes(2);
      
          // Check the arguments for each call to https.createServer
          const calls = https.createServer.mock.calls;
          calls.forEach(call => {
            const [options, handler] = call;
            expect(options).toEqual({
              key: 'mock-key',
              cert: 'mock-cert'
            });
            // The second argument should be either undefined (for createHttpsServer) 
            // or a function (for createMainHttpsServer)
            expect(handler === undefined || typeof handler === 'function').toBeTruthy();
          });
      
          // Check if error handlers were set up
          const mockServer = https.createServer.mock.results[0].value;
          expect(mockServer.on).toHaveBeenCalledWith('error', expect.any(Function));
      
          // Check if servers were set to listen
          expect(mockServer.listen).toHaveBeenCalledTimes(2);
          expect(mockServer.listen).toHaveBeenCalledWith(443, expect.any(Function));
          expect(mockServer.listen).toHaveBeenCalledWith(expect.any(Number), expect.any(Function));
        });
      });
});
/**
 *  PASS  tests/server.test.js
  Server
    ✓ should respond to health check (18 ms)
    ✓ should enforce CORS in test environment (8 ms)
    ✓ should allow requests from allowed origin (9 ms)
    ✓ should allow requests from allowed origin in production (5 ms)
    ✓ should not allow requests from dis-allowed origin in production (5 ms)
    ✓ should handle rate limiting (132 ms)
    ✓ should handle requests with no origin header (9 ms)
    ✓ should handle CORS preflight requests (5 ms)
 */

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
describe('Server Performance', () => {
    let app;
    let server;
  
    beforeAll(async () => {
      app = await setupServer();
      server = app.listen(0);
    });
  
    afterAll(async () => {
      await new Promise((resolve) => server.close(resolve));
    });
  
    it('should handle multiple requests efficiently and respect rate limits', async () => {
      const numberOfRequests = 50;
      
      const requests = Array(numberOfRequests).fill().map(() => 
        request(server)
          .get('/rate-limited')
          .set('Origin', 'https://guyycodes.github.io')
      );
  
      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const endTime = Date.now();
  
      const totalTime = endTime - startTime;
      const averageTime = totalTime / numberOfRequests;
  
      console.log(`Total time for ${numberOfRequests} requests: ${totalTime}ms`);
      console.log(`Average time per request: ${averageTime}ms`);
  
      const successfulRequests = responses.filter(res => res.status === 200).length;
      const rateLimitedRequests = responses.filter(res => res.status === 429).length;
  
      console.log(`Successful requests: ${successfulRequests}`);
      console.log(`Rate limited requests: ${rateLimitedRequests}`);
  
      expect(successfulRequests).toBeGreaterThan(0);
      expect(rateLimitedRequests).toBeGreaterThan(0);
      expect(successfulRequests + rateLimitedRequests).toBe(numberOfRequests);
      expect(averageTime).toBeLessThan(100);
    });
  });
/**
 *  PASS  tests/server.test.js
Server Performance
  ✓ should handle multiple requests efficiently and respect rate limits (44 ms)
  Test Suites: 1 passed, 1 total
  Tests:       1 passed, 1 total
  Snapshots:   0 total
  Time:        0.742 s, estimated 1 s
  */

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
describe('Server Performance Under High Load', () => {
    let app;
    let server;
    let port;
  
    beforeAll(async () => {
      app = await setupServer();
      server = app.listen(0);
      port = server.address().port;
    });
  
    afterAll(async () => {
      await new Promise((resolve) => server.close(resolve));
    });
  
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
    const makeRequest = () => {
      return new Promise((resolve) => {
        const options = {
          hostname: 'localhost',
          port: port,
          path: '/rate-limited',
          method: 'GET',
          headers: {
            'Origin': 'https://guyycodes.github.io'
          }
        };
  
        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            resolve({ status: res.statusCode, data });
          });
        });
  
        req.on('error', (error) => {
          console.error('Request error:', error.message);
          resolve({ error });
        });
  
        req.end();
      });
    };
  
    it('should handle a high number of requests efficiently and respect rate limits', async () => {
      const totalRequests = 5000;
      const batchSize = 150;
      const delayBetweenBatches = 1100;
  
      const startTime = Date.now();
      let successfulRequests = 0;
      let rateLimitedRequests = 0;
      let errors = 0;
  
      for (let i = 0; i < totalRequests; i += batchSize) {
        const batchPromises = Array(Math.min(batchSize, totalRequests - i)).fill().map(makeRequest);
  
        const batchResponses = await Promise.all(batchPromises);
  
        batchResponses.forEach(res => {
          if (res.error) {
            console.error('Request error:', res.error.message);
            errors++;
          } else if (res.status === 200) {
            successfulRequests++;
          } else if (res.status === 429) {
            rateLimitedRequests++;
          } else {
            console.warn('Unexpected response status:', res.status);
          }
        });
  
        await delay(delayBetweenBatches);
      }
  
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / totalRequests;
  
      console.log(`Total time for ${totalRequests} requests: ${totalTime}ms`);
      console.log(`Average time per request: ${averageTime}ms`);
      console.log(`Successful requests: ${successfulRequests}`);
      console.log(`Rate limited requests: ${rateLimitedRequests}`);
      console.log(`Errors: ${errors}`);
  
      expect(successfulRequests).toBeGreaterThan(0);
      expect(rateLimitedRequests).toBeGreaterThan(0);
      expect(successfulRequests + rateLimitedRequests).toBe(totalRequests);
      expect(errors).toBe(0);
      expect(averageTime).toBeLessThan(100);
    }, 120000);
  });
/**
 * Load Test results: 
✓  Total Requests: 5000
Total Time: 39002ms (about 39 seconds)
Average Time per Request: 7.8004ms
Successful Requests: 3350
Rate Limited Requests: 1650
Errors: 0
 */

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
describe('Server Startup Performance', () => {
let app;
let server;
let port;

afterEach(async () => {
    if (server) {
    await new Promise((resolve) => server.close(resolve));
    }
});

const waitForServerReady = (port) => {
        return new Promise((resolve) => {
        const checkServer = () => {
            http.get(`http://localhost:${port}/health`, (res) => {
            if (res.statusCode === 200) {
                resolve();
            } else {
                setTimeout(checkServer, 10);
            }
            }).on('error', () => {
            setTimeout(checkServer, 10);
            });
        };
        checkServer();
        });
    };

    it('should start up in less than 1 second', async () => {
        const startTime = process.hrtime();

        app = await setupServer();
        server = app.listen(0);
        port = server.address().port;

        await waitForServerReady(port);

        const endTime = process.hrtime(startTime);
        const startupTime = endTime[0] * 1000 + endTime[1] / 1000000; // Convert to milliseconds

        console.log(`Server startup time: ${startupTime.toFixed(2)}ms`);

        expect(startupTime).toBeLessThan(1000); // Expect startup in less than 1 second
    }, 5000); // 5 second timeout

    it('should respond to requests immediately after startup', async () => {
        app = await setupServer();
        server = app.listen(0);
        port = server.address().port;

        await waitForServerReady(port);

        const startTime = process.hrtime();

        const response = await new Promise((resolve) => {
        http.get(`http://localhost:${port}/health`, (res) => {
            let data = '';
            res.on('data', (chunk) => {
            data += chunk;
            });
            res.on('end', () => {
            resolve({ statusCode: res.statusCode, data });
            });
        });
        });

        const endTime = process.hrtime(startTime);
        const responseTime = endTime[0] * 1000 + endTime[1] / 1000000; // Convert to milliseconds

        console.log(`First request response time: ${responseTime.toFixed(2)}ms`);

        expect(response.statusCode).toBe(200);
        expect(responseTime).toBeLessThan(100); // Expect response in less than 100ms
    }, 5000); // 5 second timeout
})
/**
 *  PASS  tests/server.test.js
  Server Startup Performance
    ✓ should start up quickly (51 ms)
    ✓ should respond to requests immediately after startup (20 ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
 */

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
describe('setupRenewalProcess', () => {
  let mainServer, secondServer;
  const mockMainPort = 3000;
  const mockSecondPort = 443;
  const mockDomain = 'example.com';
  const mockRenewalInterval = 1000; // 1 second for testing

  beforeEach(() => {
    console.log = jest.fn();
    console.error = jest.fn();

    mainServer = {
      close: jest.fn(cb => cb()),
      listen: jest.fn((port, cb) => cb())
    };
    secondServer = {
      close: jest.fn(cb => cb()),
      listen: jest.fn((port, cb) => cb())
    };

    renewCertificateIfNeeded.mockResolvedValue(false);
    loadCertificate.mockResolvedValue('mock-cert');
    createMainHttpsServer.mockResolvedValue({
      listen: jest.fn((port, cb) => cb())
    });
    makeHTTPSserver.mockReturnValue({
      listen: jest.fn((port, cb) => cb())
    });

    jest.spyOn(global, 'setInterval');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should set up renewal process and check at specified interval', async () => {
    setupRenewalProcess(mainServer, secondServer, mockRenewalInterval, mockMainPort, mockSecondPort, mockDomain);

    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), mockRenewalInterval);

    // Fast-forward time to trigger the interval
    jest.advanceTimersByTime(mockRenewalInterval);

    // Wait for any potential async operations
    await Promise.resolve();

    expect(renewCertificateIfNeeded).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Certificate renewal process set up'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Checking if certificate renewal is needed'));
  });

  it('should not update servers if certificates are not renewed', async () => {
    renewCertificateIfNeeded.mockResolvedValue(false);
    
    setupRenewalProcess(mainServer, secondServer, mockRenewalInterval, mockMainPort, mockSecondPort, mockDomain);
    
    jest.advanceTimersByTime(mockRenewalInterval);
    await Promise.resolve();
    
    expect(renewCertificateIfNeeded).toHaveBeenCalled();
    expect(loadCertificate).not.toHaveBeenCalled();
    expect(createMainHttpsServer).not.toHaveBeenCalled();
    expect(makeHTTPSserver).not.toHaveBeenCalled();
    expect(mainServer.close).not.toHaveBeenCalled();
    expect(secondServer.close).not.toHaveBeenCalled();
  });
});
/**
 *  PASS  tests/server.test.js
  setupRenewalProcess
    ✓ should set up renewal process and check at specified interval (4 ms)
    ✓ should not update servers if certificates are not renewed (1 ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        0.313 s, estimated 1 s
 */