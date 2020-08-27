/* eslint no-unused-expressions: "off" */

const { expect } = require('chai');
const { createSession } = require('./../lib/utils/wice');
const { configOptions } = require('./seed/seed');

describe('Test utils', async () => {
  it('should create a session', async () => {
    const session = await createSession(configOptions);
    expect(session).to.be.a('string').that.have.lengthOf(32);
  });

  it('should not create cookie and session', async () => {
    const session = await createSession({ url: 'https://oihwice.wice-net.de' });
    expect(session).to.be.undefined;
  });
});
