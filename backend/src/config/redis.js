const redis = require('redis');

// Railway fournit REDIS_URL automatiquement  
const client = redis.createClient({
  url: process.env.REDIS_URL
});

client.on('error', (err) => {
  console.error('Redis Client Error', err);
});

client.connect();

module.exports = client;