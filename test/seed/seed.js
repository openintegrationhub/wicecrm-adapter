/* eslint-disable max-len */

const nock = require('nock');

const configOptions = {
  client_name: 'sandbox',
  username: 'wicecrmAdapterTest',
  password: '123456',
  path: 'https://oihwice.wice-net.de',
  apikey: 'fsuogsi9p1im1gpnhvapjdtx94z46qye',
  url: 'https://oihwice.wice-net.de',
};

const options = {
  method: 'POST',
  uri: 'https://oihwice.wice-net.de/plugin/wp_wice_client_api_backend/json',
  headers: {
    'X-API-KEY': undefined,
  },
};

const organization = {
  metadata: {
    recordUid: '368125',
  },
  data: {
    name: 'Test GmbH',
    email: 'info@testgmbh.com',
  },
};

const person = {
  metadata: {
    recordUid: '433610',
  },
  data: {
    name: 'Kolarovv',
    firstname: 'Sebastian',
    email: 'kolarov@mail.com',
  },
};

const createSessionSuccess = nock('https://oihwice.wice-net.de/pserv/base/json', {
  reqheaders: {
    'x-api-key': 'fsuogsi9p1im1gpnhvapjdtx94z46qye',
    host: 'oihwice.wice-net.de',
    'content-type': 'application/x-www-form-urlencoded',
    'content-length': 77,
  },
})
  .post('', 'method=login&mandant_name=sandbox&username=wicecrmAdapterTest&password=123456')
  .reply(200, { cookie: '01234567890123456789012345678912' }).persist();


const createSessionFailed = nock('https://oihwice.wice-net.de/pserv/base/json', {
  reqheaders: {
    host: 'oihwice.wice-net.de',
    'content-type': 'application/x-www-form-urlencoded',
    'content-length': 12,
  },
})
  .post('', 'method=login')
  .reply(200, { error: 'Denied' });


const upsertPersonCheck = nock('https://oihwice.wice-net.de/plugin/wp_wice_client_api_backend/json', {
  reqheaders: {
    'x-api-key': 'fsuogsi9p1im1gpnhvapjdtx94z46qye',
    host: 'oihwice.wice-net.de',
    'content-type': 'application/x-www-form-urlencoded',
    'content-length': 69,
  },
})
  .post('', 'method=get_person&cookie=01234567890123456789012345678912&pkey=433610')
  .reply(200, {});


const upsertPersonSuccess = nock('https://oihwice.wice-net.de/plugin/wp_wice_client_api_backend/json', {
  reqheaders: {
    'x-api-key': 'fsuogsi9p1im1gpnhvapjdtx94z46qye',
    host: 'oihwice.wice-net.de',
    'content-type': 'application/x-www-form-urlencoded',
    'content-length': 217,
  },
})
  .post('', 'method=insert_contact&data=%7B%22name%22%3A%22Kolarovv%22%2C%22firstname%22%3A%22Sebastian%22%2C%22email%22%3A%22kolarov%40mail.com%22%2C%22same_contactperson%22%3A%22auto%22%7D&cookie=01234567890123456789012345678912')
  .reply(200, { rowid: 1 });


const upsertOrganizationCheck = nock('https://oihwice.wice-net.de/plugin/wp_wice_client_api_backend/json', {
  reqheaders: {
    'x-api-key': 'fsuogsi9p1im1gpnhvapjdtx94z46qye',
    host: 'oihwice.wice-net.de',
    'content-type': 'application/x-www-form-urlencoded',
    'content-length': 70,
  },
})
  .post('', 'method=get_company&cookie=01234567890123456789012345678912&pkey=368125')
  .reply(200, {});


const upsertOrganizationSuccess = nock('https://oihwice.wice-net.de/plugin/wp_wice_client_api_backend/json', {
  reqheaders: {
    'x-api-key': 'fsuogsi9p1im1gpnhvapjdtx94z46qye',
    host: 'oihwice.wice-net.de',
    'content-type': 'application/x-www-form-urlencoded',
    'content-length': 145,
  },
})
  .post('', 'method=insert_company&data=%7B%22name%22%3A%22Test%20GmbH%22%2C%22email%22%3A%22info%40testgmbh.com%22%7D&cookie=01234567890123456789012345678912')
  .reply(200, { rowid: 1 });

//
const upsertPersonCheckV2 = nock('https://oihwice.wice-net.de/plugin/wp_wice_client_api_backend/json',
  {
    query: {
      cookie: '01234567890123456789012345678912',
      method: 'get_contact',
      rowid: '433610',
    },
  })
  .get('')
  .reply(200, {});


const upsertPersonSuccessV2 = nock('https://oihwice.wice-net.de/plugin/wp_wice_client_api_backend/json', {
  query: {
    cookie: '01234567890123456789012345678912',
    method: 'insert_contact',
  },
})
  .post('', person)
  .reply(200, { rowid: 1 });

const upsertOrganizationCheckV2 = nock('https://oihwice.wice-net.de/plugin/wp_wice_client_api_backend/json?cookie=01234567890123456789012345678912&method=get_company', {
  reqheaders: {
    'x-api-key': 'fsuogsi9p1im1gpnhvapjdtx94z46qye',
    host: 'oihwice.wice-net.de',
    'content-type': 'application/x-www-form-urlencoded',
    'content-length': 70,
  },
})
  .get('', '')
  .reply(200, {});


const upsertOrganizationSuccessV2 = nock('https://oihwice.wice-net.de/plugin/wp_wice_client_api_backend/json?cookie=01234567890123456789012345678912&method=insert_company', {
  reqheaders: {
    'x-api-key': 'fsuogsi9p1im1gpnhvapjdtx94z46qye',
    host: 'oihwice.wice-net.de',
    'content-type': 'application/x-www-form-urlencoded',
    'content-length': 145,
  },
})
  .post('', 'data=%7B%22name%22%3A%22Test%20GmbH%22%2C%22email%22%3A%22info%40testgmbh.com%22%7D')
  .reply(200, { rowid: 1 });

// ///

const today = (new Date()).toISOString();

const getPersonsSuccess = nock('https://oihwice.wice-net.de/plugin/wp_wice_client_api_backend/json', {
  reqheaders: {
    'X-API-KEY': 'fsuogsi9p1im1gpnhvapjdtx94z46qye',
    host: 'oihwice.wice-net.de',
  },
})
  .get('')
  .query({
    method: 'get_all_persons',
    full_list: 1,
    cookie: '01234567890123456789012345678912',
  })
  .reply(200, { loop_addresses: [{ rowid: '007', firstname: 'James', last_update: today }] });


const getOrganizationsSuccess = nock('https://oihwice.wice-net.de/plugin/wp_wice_client_api_backend/json', {
  reqheaders: {
    'X-API-KEY': 'fsuogsi9p1im1gpnhvapjdtx94z46qye',
    host: 'oihwice.wice-net.de',
  },
})
  .get('')
  .query({
    method: 'get_all_companies',
    full_list: 1,
    cookie: '01234567890123456789012345678912',
  })
  .reply(200, { loop_addresses: [{ rowid: 2, name: 'Some Corp.', last_update: today }] });


module.exports = {
  configOptions,
  person,
  organization,
  options,
  createSessionSuccess,
  createSessionFailed,
  upsertPersonCheck,
  upsertOrganizationCheck,
  upsertPersonSuccess,
  upsertOrganizationSuccess,
  upsertPersonCheckV2,
  upsertOrganizationCheckV2,
  upsertPersonSuccessV2,
  upsertOrganizationSuccessV2,
  getPersonsSuccess,
  getOrganizationsSuccess,
};
