const pact = require('@pact-foundation/pact-node');
const path = require('path');

const pactBrokerUrl = process.env.PACT_BROKER_BASE_URL;
const pactBrokerToken = process.env.PACT_BROKER_TOKEN;
const consumerVersion = process.env.GIT_COMMIT || '1.0.0';

const opts = {
  pactFilesOrDirs: [path.resolve(__dirname, '../pacts')],
  pactBroker: pactBrokerUrl,
  pactBrokerToken,
  consumerVersion,
  tags: ['dev'],
};

pact
  .publishPacts(opts)
  .then(() => {
    console.log('Pact contract successfully published!');
  })
  .catch((err) => {
    console.error('Pact publication failed:', err);
    process.exit(1);
  });
