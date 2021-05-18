/* eslint no-await-in-loop: "off" */

const uuid = require('uuid');
const request = require('request-promise');

function addProtocol(url) {
  if (typeof url !== 'string') return url;
  let newUrl = url.toLowerCase().trim();
  if (newUrl.indexOf('https://') !== 0 && newUrl.indexOf('http://') !== 0) {
    newUrl = `https://${newUrl}`;
  }
  return newUrl;
}

async function createSession(cfg) {
  // console.log(`API KEY: ${cfg.apikey}`);
  const options = {
    method: 'POST',
    uri: `${addProtocol(cfg.url)}/pserv/base/json`,
    form: {
      method: 'login',
      mandant_name: cfg.client_name,
      username: cfg.username,
      password: cfg.password,
    },
    headers: { 'X-API-KEY': cfg.apikey },
  };

  try {
    const getCookie = await request.post(options);
    const jsonData = JSON.parse(getCookie);
    if (jsonData && 'cookie' in jsonData) {
      // console.log(`COOKIE: ${jsonData.cookie}`);
      return jsonData.cookie;
    }
    console.log('ERROR-RESPONSE:', jsonData);
    return undefined;
  } catch (e) {
    console.log('Login failed!');
    console.log(`ERROR: ${e}`);
    throw new Error(e);
  }
}


function newMessage(body) {
  const msg = {
    id: uuid.v4(),
    attachments: {},
    body,
    headers: {},
    metadata: {},
  };

  return msg;
}

function customPerson(person) {
  const customUserFormat = {
    rowid: person.rowid,
    for_rowid: person.for_rowid,
    same_contactperson: person.same_contactperson,
    last_update: person.last_update,
    deactivated: person.deactivated,
    name: person.name,
    firstname: person.firstname,
    email: person.email,
    title: person.title,
    salutation: person.salutation,
    birthday: person.birthday,
    private_street: person.private_street,
    private_street_number: person.private_street_number,
    private_zip_code: person.private_zip_code,
    private_town: person.private_town,
    private_state: person.private_state,
    private_country: person.private_country,
    phone: person.phone,
    fax: person.fax,
    private_phone: person.private_phone,
    private_mobile_phone: person.private_mobile_phone,
    private_email: person.private_email,
  };
  return customUserFormat;
}

function customOrganization(organization) {
  const customOrganizaiontFormat = {
    rowid: organization.rowid,
    last_update: organization.last_update,
    name: organization.name,
    email: organization.email,
    phone: organization.phone,
    fax: organization.fax,
    street: organization.street,
    street_number: organization.street_number,
    zip_code: organization.zip_code,
    p_o_box: organization.p_o_box,
    town: organization.town,
    state: organization.state,
    country: organization.country,
  };
  return customOrganizaiontFormat;
}

async function fetchAll(options, mapping, snapshot) {
  try {
    const result = [];
    const response = await request.get(options);

    const responseObj = JSON.parse(response);

    if (responseObj.loop_addresses === undefined) return result;

    responseObj.loop_addresses.forEach((object) => {
      const currentObject = mapping(object);
      if (currentObject.last_update > snapshot.lastUpdated) result.push(currentObject);
    });

    result.sort((a, b) => Date.parse(a.last_update) - Date.parse(b.last_update));
    return result;
  } catch (e) {
    throw new Error(e);
  }
}


async function getPersons(cfg, snapshot) {
  try {
    const cookie = await createSession(cfg);

    if (cookie) {
      const options = {
        method: 'get',
        uri: `${addProtocol(cfg.url)}/plugin/wp_wice_client_api_backend/json?method=get_all_persons&full_list=1&cookie=${cookie}`,
        headers: { 'X-API-KEY': cfg.apikey },
      };

      const contacts = await fetchAll(options, customPerson, snapshot);

      if (!contacts || !Array.isArray(contacts)) return `Expected records array. Instead received: ${JSON.stringify(contacts)}`;

      return contacts;
    }
    return [];
  } catch (e) {
    throw new Error(e);
  }
}

async function getOrganizations(cfg, snapshot) {
  try {
    const cookie = await createSession(cfg);

    if (cookie) {
      const options = {
        uri: `${addProtocol(cfg.url)}/plugin/wp_wice_client_api_backend/json?method=get_all_companies&full_list=1&cookie=${cookie}`,
        headers: { 'X-API-KEY': cfg.apikey },
      };

      const organizations = await fetchAll(options, customOrganization, snapshot);

      if (!organizations || !Array.isArray(organizations)) return `Expected records array. Instead received: ${JSON.stringify(organizations)}`;

      return organizations;
    }
    return [];
  } catch (e) {
    throw new Error(e);
  }
}

async function checkForExistingPerson(person, cookie, options) {
  let existingRowid = 0;
  try {
    if (person.metadata.recordUid) {
      const newOptions = options;
      newOptions.form = {
        method: 'get_person',
        cookie,
        pkey: person.metadata.recordUid,
      };


      const rowid = await request.post(newOptions);

      const rowidObj = JSON.parse(rowid);
      if (rowidObj.address_object) {
        existingRowid = rowidObj.address_object.rowid;
        console.log(`Person already exists ... ROWID: ${existingRowid}`);
      }
    }
    return existingRowid;
  } catch (e) {
    throw new Error(e);
  }
}

async function createOrUpdatePerson(existingRowid, cookie, options, msg) {
  try {
    const newOptions = options;
    const newMsg = msg;
    if (existingRowid === 0) {
      console.log('Creating person ...');

      const input = JSON.stringify(msg.data);
      newOptions.form = {
        method: 'insert_contact',
        data: input,
        cookie,
      };
      const person = await request.post(newOptions);
      return JSON.parse(person);
    }
    console.log('Updating person ...');
    // msg.rowid = existingRowid;
    newMsg.data.rowid = existingRowid;
    newOptions.form = {
      method: 'update_contact',
      // data: JSON.stringify(msg),
      data: JSON.stringify(msg.data),
      cookie,
    };

    const person = await request.post(newOptions);
    return JSON.parse(person);
  } catch (e) {
    throw new Error(e);
  }
}

async function checkForExistingOrganization(organization, cookie, options) {
  let existingRowid = 0;
  try {
    if (organization.metadata.recordUid) {
      const newOptions = options;
      newOptions.form = {
        method: 'get_company',
        cookie,
        pkey: organization.metadata.recordUid,
      };

      const rowid = await request.post(newOptions);
      const rowidObj = JSON.parse(rowid);
      if (rowidObj.address_object) {
        existingRowid = rowidObj.address_object.rowid;
        console.log(`Organization already exists ... ROWID: ${existingRowid}`);
      }
    }
    return existingRowid;
  } catch (e) {
    throw new Error(e);
  }
}

async function createOrUpdateOrganization(existingRowid, cookie, options, msg) {
  try {
    const newOptions = options;
    if (existingRowid === 0) {
      console.log('Creating organization ...');
      const input = JSON.stringify(msg.data);
      newOptions.form = {
        method: 'insert_company',
        data: input,
        cookie,
      };
      const organization = await request.post(newOptions);
      return JSON.parse(organization);
    }
    const newMsg = msg;
    console.log('Updating organization ...');
    newMsg.data.rowid = existingRowid;
    newOptions.form = {
      method: 'update_company',
      data: JSON.stringify(msg.data),
      cookie,
    };
    const organization = await request.post(newOptions);
    return JSON.parse(organization);
  } catch (e) {
    throw new Error(e);
  }
}


async function upsertObject(msg, cfg, type) {
  try {
    let result;
    const options = {
      method: 'POST',
      uri: `${addProtocol(cfg.url)}/plugin/wp_wice_client_api_backend/json`,
      headers: {
        'X-API-KEY': cfg.apikey,
      },
    };

    if (cfg.devMode) {
      console.log('upsertObject: options');
      console.log(JSON.stringify(options));
    }


    const cookie = await createSession(cfg);

    if (cfg.devMode) {
      console.log('Cookie:');
      console.log(JSON.stringify(cookie));
    }

    if (type === 'person') {
      const newMsg = msg;
      newMsg.data.same_contactperson = 'auto';

      const existingRowid = await checkForExistingPerson(newMsg, cookie, options);
      result = await createOrUpdatePerson(existingRowid, cookie, options, msg);
    } else {
      const existingRowid = await checkForExistingOrganization(msg, cookie, options);
      result = await createOrUpdateOrganization(existingRowid, cookie, options, msg);
    }

    if (cfg.devMode) {
      console.log('Result:');
      console.log(JSON.stringify(result));
    }

    return result;
  } catch (e) {
    throw new Error(e);
  }
}


module.exports = {
  createSession, newMessage, getPersons, getOrganizations, upsertObject,
};
