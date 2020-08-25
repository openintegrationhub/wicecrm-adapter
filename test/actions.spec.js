const { expect } = require('chai');
const { createSession } = require('./../lib/utils/wice');
const {
  organizations, persons, configOptions, options,
} = require('./seed/seed'); // articles,
const { checkForExistingPerson, createOrUpdatePerson } = require('./../lib/actions/upsertPerson');
const { checkForExistingOrganization, createOrUpdateOrganization } = require('./../lib/actions/upsertOrganization');
// const { checkForExistingArticle, createOrUpdateArticle } = require('./../lib/actions/upsertArticle');

describe('Test actions', () => {
  it('should create or update a person', async () => {
    const cookie = await createSession(configOptions);

    const person = persons[2];
    const existingPersonRowid = await checkForExistingPerson(person, cookie, options);

    const newUser = await createOrUpdatePerson(existingPersonRowid, cookie, options, person);

    expect(cookie).to.have.lengthOf(32);
    expect(newUser).to.be.an('object');
    expect(newUser).to.have.property('rowid');
  });

  it('should create or update an organization', async () => {
    const cookie = await createSession(configOptions);
    const organization = organizations[1];
    const existingOrgnizationRowid = await checkForExistingOrganization(organization, cookie, options);
    const newOrganization = await createOrUpdateOrganization(existingOrgnizationRowid, cookie, options, organization);
    expect(cookie).to.have.lengthOf(32);
    expect(newOrganization).to.be.an('object');
    expect(newOrganization).to.have.property('rowid');
  });

  // it('should create or update an article', async () => {
  //   const cookie = await createSession(configOptions);
  //   const article = articles[0];
  //   console.log('article', article);
  //   const existingArticleRowid = await checkForExistingArticle(article, cookie, options);
  //   console.log('existingArticleRowid', existingArticleRowid);
  //   const newArticle = await createOrUpdateArticle(existingArticleRowid, cookie, options, article);
  //   console.log('newArticle', newArticle);
  //   expect(cookie).to.have.lengthOf(32);
  //   expect(newArticle).to.be.an('object');
  //   expect(newArticle).to.have.property('rowid');
  // });
});
