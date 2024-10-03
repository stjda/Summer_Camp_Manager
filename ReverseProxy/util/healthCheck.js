const os = require('os');
const process = require('process');
const { version } = require('../package.json');

// Assume these functions are implemented elsewhere in your application
const checkDatabaseConnection = async () => { /* Implementation */ };
const checkRedisConnection = async () => { /* Implementation */ };
const getActiveConnections = () => { /* Implementation */ };

async function getHealthStatus() {
  const startTime = process.hrtime();
  
  try {
    const dbStatus = await checkDatabaseConnection();
    const redisStatus = await checkRedisConnection();
    const [elapsedSeconds, elapsedNanos] = process.hrtime(startTime);
    const responseTime = elapsedSeconds * 1000 + elapsedNanos / 1000000;

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: version,
      uptime: process.uptime(),
      responseTime: `${responseTime.toFixed(2)}ms`,
      
      system: {
        loadAverage: os.loadavg(),
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem(),
        },
        cpu: {
          cores: os.cpus().length,
          model: os.cpus()[0].model,
        },
      },
      
      process: {
        pid: process.pid,
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
      },
      
      connections: {
        active: getActiveConnections(),
      },
      
      dependencies: {
        database: dbStatus,
        redis: redisStatus,
      },
      
      environment: process.env.NODE_ENV,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    };
  }
}

module.exports = { getHealthStatus };