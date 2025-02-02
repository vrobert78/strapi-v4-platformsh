const config = require("platformsh-config").config();
const path = require('path');

let dbRelationship = "pg";

// Strapi default sqlite settings.
let connection = {
  connection: {
    client: 'sqlite',
    connection: {
      filename: path.join(__dirname, '..', process.env.DATABASE_FILENAME || '.tmp/data.db'),
    },
    useNullAsDefault: true,
  },
};

let pool = {};

if (config.isValidPlatform() && !config.inBuild()) {
  // Platform.sh database configuration.
  const credentials = config.credentials(dbRelationship);
  console.log(`Using Platform.sh configuration with relationship ${dbRelationship}.`);

  pool = {
    min: 0,
    max: 10,
    acquireTimeoutMillis: 600000,
    createTimeoutMillis: 30000,
    idleTimeoutMillis: 20000,
    reapIntervalMillis: 20000,
    createRetryIntervalMillis: 200,
  };

  connection = {
    connection: {
      client: "postgres",
      connection: {
        host: credentials.ip,
        port: credentials.port,
        database: credentials.path,
        user: credentials.username,
        password: credentials.password,
        ssl: false
      },
      debug: false,
      pool
    },
  };

} else {
  if (config.isValidPlatform()) {
    // Build hook configuration message.
    console.log('Using default configuration during Platform.sh build hook until relationships are available.');
  } else {
    // Strapi default local configuration.
    console.log('Not in a Platform.sh Environment. Using default local sqlite configuration.');
  }
}

// strapi-api/config/database.js
module.exports = ({ env }) => ( connection );
