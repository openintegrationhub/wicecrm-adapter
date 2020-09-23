/* eslint no-unused-expressions: "off" */

const { expect } = require('chai');
const {
  createSession, upsertObject, getPersons, getOrganizations,
} = require('./../lib/utils/helpers');
const { configOptions, person, organization } = require('./seed/seed');

describe('Test utils', async () => {
  it('should create a session', async () => {
    const session = await createSession(configOptions);
    expect(session).to.be.a('string').that.have.lengthOf(32);
  });

  it('should not create cookie and session', async () => {
    const session = await createSession({ url: 'https://oihwice.wice-net.de' });
    expect(session).to.be.undefined;
  });

  it('should upsert a person', async () => {
    const newPerson = await upsertObject(person, configOptions, 'person');
    expect(newPerson).to.be.an('object');
    expect(newPerson).to.have.property('rowid');
  });

  it('should upsert an organization', async () => {
    const newOrganization = await upsertObject(organization, configOptions, 'organization');
    expect(newOrganization).to.be.an('object');
    expect(newOrganization).to.have.property('rowid');
  });

  it('should get all persons', async () => {
    const allPersons = await getPersons(configOptions, { lastUpdated: (new Date(0)).toISOString() });
    expect(allPersons).to.be.an.array;
    expect(allPersons[0]).to.have.property('rowid');
    expect(allPersons[0]).to.have.property('firstname');
  });

  it('should get all organizations', async () => {
    const allOrganizations = await getOrganizations(configOptions, { lastUpdated: (new Date(0)).toISOString() });
    expect(allOrganizations).to.be.an.array;
    expect(allOrganizations[0]).to.have.property('rowid');
  });
});
