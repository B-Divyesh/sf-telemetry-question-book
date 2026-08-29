const { migrateLegacyPayloads } = require('../lib/store');

migrateLegacyPayloads()
  .then(({ removed, migrated }) => console.log(`Migrated ${migrated} active and removed ${removed} expired legacy snapshot payloads.`))
  .catch((error) => {
    console.error(`Legacy snapshot cleanup failed: ${error.message}`);
    process.exitCode = 1;
  });
