const { expect } = require('chai');
const { createSession } = require('./../lib/utils/wice');
const {
  organizations, persons, articles, configOptions, options,
} = require('./seed/seed');
const { checkForExistingPerson, createOrUpdatePerson } = require('./../lib/actions/upsertPerson');
const { checkForExistingOrganization, createOrUpdateOrganization } = require('./../lib/actions/upsertOrganization');
const { checkForExistingArticle, createOrUpdateArticle } = require('./../lib/actions/upsertArticle');

describe('Test actions', () => {
  it('should create or update a person', async () => {
    const cookie = await createSession(configOptions);
    const person = persons[2];
    const existningPersonRowid = await checkForExistingPerson(person, cookie, options);
    const newUser = await createOrUpdatePerson(existningPersonRowid, cookie, options, person);
    expect(cookie).to.have.lengthOf(32);
    expect(newUser).to.be.an('object');
    expect(newUser).to.have.property('rowid');
  });

  it('should create or update an organization', async () => {
    const cookie = await createSession(configOptions);
    const organization = organizations[1];
    const existningOrgnizationRowid = await checkForExistingOrganization(organization, cookie, options);
    const newOrganization = await createOrUpdateOrganization(existningOrgnizationRowid, cookie, options, organization);
    expect(cookie).to.have.lengthOf(32);
    expect(newOrganization).to.be.an('object');
    expect(newOrganization).to.have.property('rowid');
  });

  it('should create or update an article', async () => {
    const cookie = await createSession(configOptions);
    const article = articles[0];
    const existningArticleRowid = await checkForExistingArticle(article, cookie, options);
    const newArticle = await createOrUpdateArticle(existningArticleRowid, cookie, options, article);
    expect(cookie).to.have.lengthOf(32);
    expect(newArticle).to.be.an('object');
    expect(newArticle).to.have.property('rowid');
  });
});
