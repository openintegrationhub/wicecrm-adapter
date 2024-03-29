/* eslint no-await-in-loop: "off" */
/* eslint max-len: "off" */

// const uuid = require('uuid');
const request = require('request-promise');
const fetch = require('node-fetch');

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
      password: (cfg.passphrase) ? cfg.passphrase : cfg.password,
    },
    headers: {},
  };

  if (cfg.key) {
    options.headers['X-API-KEY'] = cfg.key;
  } else if (cfg.apikey) {
    options.headers['X-API-KEY'] = cfg.apikey;
  }

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

function customTicket(ticket) {
  const customTicketFormat = {
    rowid: ticket.ticket_object.rowid,
    subject: ticket.ticket_object.subject,
    for_rowid: ticket.ticket_object.refer_rowid,
    for_rowid_display: ticket.ticket_object.for_rowid_display,
    employee_assigned: ticket.ticket_object.employee_assigned,
    employee_assigned_name: ticket.ticket_object.employee_name,
    category1: ticket.ticket_object.category1_name,
    category2: ticket.ticket_object.category2_name,
    category3: ticket.ticket_object.category3_name,
    category4: ticket.ticket_object.category4_name,
    status: ticket.ticket_object.status_title,
    last_update: ticket.ticket_object.last_update,
    notes: [],
  };

  for (let i = 0; i < ticket.loop_replies.length; i += 1) {
    customTicketFormat.notes.push({
      text: ticket.loop_replies[i].text,
      date: ticket.loop_replies[i].reply_date,
      time: ticket.loop_replies[i].reply_time,
      author: ticket.loop_replies[i].note_author_fullname,
    });
  }

  return customTicketFormat;
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
    console.error(e);
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
        headers: {},
      };
      if (cfg.key) {
        options.headers['X-API-KEY'] = cfg.key;
      } else if (cfg.apikey) {
        options.headers['X-API-KEY'] = cfg.apikey;
      }

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
        headers: {},
      };
      if (cfg.key) {
        options.headers['X-API-KEY'] = cfg.key;
      } else if (cfg.apikey) {
        options.headers['X-API-KEY'] = cfg.apikey;
      }

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


async function checkForExistingPersonV2(person, options) {
  let existingRowid = 0;
  try {
    if (person.metadata.recordUid) {
      const newOptions = options;
      newOptions.uri = `${newOptions.uri}get_contact`;
      newOptions.data = {
        rowid: person.metadata.recordUid,
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
    console.error(e);
    throw new Error(e);
  }
}

async function createOrUpdateOrganization(existingRowid, cookie, options, msg) {
  try {
    const newOptions = options;
    const newMsg = msg;
    if (existingRowid === 0) {
      console.log('Creating organization ...');

      const input = JSON.stringify(msg.data);
      newOptions.form = {
        method: 'insert_company',
        data: input,
        cookie,
      };
      const person = await request.post(newOptions);
      return JSON.parse(person);
    }
    console.log('Updating organization ...');
    // msg.rowid = existingRowid;
    newMsg.data.rowid = existingRowid;
    newOptions.form = {
      method: 'update_company',
      // data: JSON.stringify(msg),
      data: JSON.stringify(msg.data),
      cookie,
    };

    const organization = await request.post(newOptions);
    return JSON.parse(organization);
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
}

async function createOrUpdatePersonV2(existingRowid, options, msg) {
  try {
    const newOptions = options;
    const newMsg = msg;
    if (existingRowid === 0) {
      console.log('Creating person ...');

      const input = JSON.stringify(msg.data);
      newOptions.uri = `${newOptions.uri}'insert_contact`;
      newOptions.data = input;

      const person = await request.post(newOptions);
      return JSON.parse(person);
    }
    console.log('Updating person ...');
    // msg.rowid = existingRowid;
    newMsg.data.rowid = existingRowid;
    const input = JSON.stringify(msg.data);
    newOptions.uri = `${newOptions.uri}'update_contact`;
    newOptions.data = input;

    const person = await request.post(newOptions);
    return JSON.parse(person);
  } catch (e) {
    console.error(e);
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
    console.error(e);
    throw new Error(e);
  }
}

async function checkForExistingOrganizationV2(organization, options) {
  let existingRowid = 0;
  try {
    if (organization.metadata.recordUid) {
      const newOptions = options;
      newOptions.uri = `${newOptions.uri}get_company`;
      newOptions.data = {
        rowid: organization.metadata.recordUid,
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
    console.error(e);
    throw new Error(e);
  }
}


async function createOrUpdateOrganizationV2(existingRowid, cookie, options, msg) {
  try {
    const newOptions = options;
    if (existingRowid === 0) {
      console.log('Creating organization ...');
      const input = JSON.stringify(msg.data);
      newOptions.uri = `${newOptions.uri}'insert_company`;
      newOptions.data = input;

      const organization = await request.post(newOptions);
      return JSON.parse(organization);
    }
    const newMsg = msg;
    console.log('Updating organization ...');
    newMsg.data.rowid = existingRowid;
    const input = JSON.stringify(msg.data);
    newOptions.uri = `${newOptions.uri}'update_contact`;
    newOptions.data = input;

    const organization = await request.post(newOptions);
    return JSON.parse(organization);
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
}

async function upsertObjectV2(msg, cfg, type) {
  try {
    const newMsg = msg;
    let result;

    const cookie = await createSession(cfg);

    if (cfg.devMode) {
      console.log('Cookie:');
      console.log(JSON.stringify(cookie));
    }

    const options = {
      method: 'POST',
      uri: `${addProtocol(cfg.url)}/plugin/wp_wice_client_api_backend/json?cookie=${cookie}&method=`,
      headers: {},
    };

    if (cfg.devMode) {
      console.log('upsertObject: options');
      console.log(JSON.stringify(options));
    }

    for (let i = 1; i <= 4; i += 1) {
      if (cfg[`category${i}`]) {
        newMsg.data[`address_category${i}`] = cfg[`category${i}`];
      }
    }

    if (type === 'person') {
      newMsg.data.same_contactperson = 'auto';

      const existingRowid = await checkForExistingPersonV2(newMsg, options);
      result = await createOrUpdatePersonV2(existingRowid, options, msg);
    } else {
      const existingRowid = await checkForExistingOrganizationV2(msg, options);
      result = await createOrUpdateOrganizationV2(existingRowid, options, msg);
    }

    if (cfg.devMode) {
      console.log('Result:');
      console.log(JSON.stringify(result));
    }

    return result;
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
}

async function upsertObject(msg, cfg, type) {
  try {
    if (cfg.apiVersion && cfg.apiVersion === '2') {
      return upsertObjectV2(msg, cfg, type);
    }

    const newMsg = msg;
    let result;
    const options = {
      method: 'POST',
      uri: `${addProtocol(cfg.url)}/plugin/wp_wice_client_api_backend/json`,
      headers: {},
    };

    if (cfg.key) {
      options.headers['X-API-KEY'] = cfg.key;
    } else if (cfg.apikey) {
      options.headers['X-API-KEY'] = cfg.apikey;
    }

    if (cfg.devMode) {
      console.log('upsertObject: options');
      console.log(JSON.stringify(options));
    }


    const cookie = await createSession(cfg);

    if (cfg.devMode) {
      console.log('Cookie:');
      console.log(JSON.stringify(cookie));
    }

    for (let i = 1; i <= 4; i += 1) {
      if (cfg[`category${i}`]) {
        newMsg.data[`address_category${i}`] = cfg[`category${i}`];
      }
    }

    if (type === 'person') {
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
    console.error(e);
    throw new Error(e);
  }
}

async function getTickets(cfg, snapshot) {
  try {
    const cookie = await createSession(cfg);

    if (!cookie) {
      console.error('Could not fetch cookie, aborting...');
      return [];
    }

    const options = {
      method: 'GET',
      uri: `${addProtocol(cfg.url)}/pserv/base/json_backend/ticket/mainview`,
      headers: { cookie: `wice_cookie=${cookie}` },
      json: true,
      simple: false,
    };

    const mainview = await request(options);

    const ticketList = mainview.loop_tickets;

    const promises = [];

    for (let i = 0; i < ticketList.length; i += 1) {
      promises.push(
        request({
          method: 'get',
          uri: `${addProtocol(cfg.url)}/pserv/base/json_backend/ticket/detailview/${ticketList[i].ticket_id}`,
          headers: { cookie: `wice_cookie=${cookie}` },
          json: true,
          simple: false,
        }),
      );
    }

    const allTickets = await Promise.all(promises);
    const formattedTickets = [];

    for (let i = 0; i < allTickets.length; i += 1) {
      if (Date.parse(allTickets[i].ticket_object.last_update) > Date.parse(snapshot.lastUpdated)) {
        formattedTickets.push(customTicket(allTickets[i]));
      }
    }

    return formattedTickets;
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
}

async function getChances(cfg, snapshot) {
  try {
    const cookie = await createSession(cfg);

    if (!cookie) {
      console.error('Could not fetch cookie, aborting...');
      return [];
    }

    let fields = [
      'name',
      'article',
      'forecast_order',
      'probability',
      'tax',
      'forecast_chance_multiplied_by_probability',
      'actual_sales_price_total_net',
      'ticket_subject',
      'planned_for_date',
      'actual_sales_date_raw',
      'ticket',
      'username',
    ];

    if (cfg.fields) {
      fields = cfg.fields.replace(/[\s]+/gu, '').split(',');
    }

    if (fields.indexOf('last_update') === -1) fields.push('last_update');

    const startMonth = (snapshot.lastUpdatedMonth) ? snapshot.lastUpdatedMonth : 1;
    const startYear = (snapshot.lastUpdatedYear) ? snapshot.lastUpdatedYear : 2000;
    const now = new Date();
    const endMonth = now.getMonth() + 1;
    const endYear = now.getFullYear();

    const options = {
      method: 'GET',
      uri: `${addProtocol(cfg.url)}/pserv/base/sales?sales_forecast=1&chance_date_start_month=${startMonth}&chance_date_start_year=${startYear}&chance_date_end_month=${endMonth}&chance_date_end_year=${endYear}`,
      headers: { cookie: `wice_cookie=${cookie}` },
      json: true,
      simple: false,
    };
    if (cfg.devMode) {
      console.log(options);
    }
    const result = await request(options);
    if (cfg.devMode) {
      console.log(JSON.stringify(result));
      console.log('result.loop_entries');
      console.log(JSON.stringify(result.loop_entries));
    }

    const cleanEntries = [];
    if (result && result.loop_entries && result.loop_entries.length > 0) {
      result.loop_entries.sort((a, b) => Date.parse(a.last_update) - Date.parse(b.last_update));
      if (cfg.devMode) console.log(result.loop_entries.length, 'chances found');
      for (let i = 0; i < result.loop_entries.length; i += 1) {
        if (Date.parse(result.loop_entries[i].last_update) <= snapshot.lastUpdated) {
          if (cfg.devMode) console.log('Skipping old entry from', result.loop_entries[i].last_update);
          continue; // eslint-disable-line no-continue
        }
        const newChance = {};
        for (let j = 0; j < fields.length; j += 1) {
          if (fields[j] === 'article') {
            const articleData = `${result.loop_entries[i][fields[j]]}`.trim().split('(');
            newChance.articleName = articleData[0].trim();
            newChance.articleId = parseInt(articleData[1], 10);
          } else {
            newChance[fields[j]] = `${result.loop_entries[i][fields[j]]}`;
          }
        }
        cleanEntries.push(newChance);
      }
    } else if (cfg.devMode) console.log('No chances found');

    if (cfg.devMode) console.log('cleanEntries', JSON.stringify(cleanEntries));
    return cleanEntries;
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
}


async function getSales(cfg, snapshot) {
  try {
    const cookie = await createSession(cfg);

    if (!cookie) {
      console.error('Could not fetch cookie, aborting...');
      return [];
    }

    let fields = [
      'name',
      'article',
      'articles_amount',
      'tax',
      'actual_sales_price_total_net',
      'ticket_subject',
      'planned_for_date',
      'actual_sales_date_raw',
      'ticket',
      'username',
      'invoice_no',
      'tax',
      'description',
    ];

    if (cfg.fields) {
      fields = cfg.fields.replace(/[\s]+/gu, '').split(',');
    }

    if (fields.indexOf('last_update') === -1) fields.push('last_update');

    const startMonth = (snapshot.lastUpdatedMonth) ? snapshot.lastUpdatedMonth : 1;
    const startYear = (snapshot.lastUpdatedYear) ? snapshot.lastUpdatedYear : 2000;
    const now = new Date();
    const endMonth = now.getMonth() + 1;
    const endYear = now.getFullYear();

    const options = {
      method: 'GET',
      uri: `${addProtocol(cfg.url)}/pserv/base/sales?sales_forecast=1`
      + `&invoice_date_start_month=${startMonth}&invoice_date_start_year=${startYear}`
      + `&invoice_date_end_month=${endMonth}&invoice_date_end_year=${endYear}`,
      headers: { cookie: `wice_cookie=${cookie}` },
      json: true,
      simple: false,
    };
    if (cfg.devMode) {
      console.log(options);
    }
    const result = await request(options);
    if (cfg.devMode) {
      console.log(JSON.stringify(result));
      console.log('result.loop_entries');
      console.log(JSON.stringify(result.loop_entries));
    }

    const cleanEntries = [];
    if (result && result.loop_entries && result.loop_entries.length > 0) {
      result.loop_entries.sort((a, b) => Date.parse(a.last_update) - Date.parse(b.last_update));
      if (cfg.devMode) console.log(result.loop_entries.length, 'sales found');
      for (let i = 0; i < result.loop_entries.length; i += 1) {
        if (Date.parse(result.loop_entries[i].last_update) <= snapshot.lastUpdated) {
          if (cfg.devMode) console.log('Skipping old entry from', result.loop_entries[i].last_update);
          continue; // eslint-disable-line no-continue
        }
        if (
          !result.loop_entries[i].actual_sales_price_total_raw
          || parseFloat(result.loop_entries[i].actual_sales_price_total_raw) <= 0
        ) {
          if (cfg.devMode) console.log('Skipping entry because it has no sales price', result.loop_entries[i].last_update);
          continue; // eslint-disable-line no-continue
        }

        const newSale = {};
        for (let j = 0; j < fields.length; j += 1) {
          if (fields[j] === 'article') {
            const articleData = `${result.loop_entries[i][fields[j]]}`.trim().split('(');
            newSale.articleName = articleData[0].trim();
            newSale.articleId = parseInt(articleData[1], 10);
          } else {
            newSale[fields[j]] = `${result.loop_entries[i][fields[j]]}`;
          }
        }
        cleanEntries.push(newSale);
      }
    } else if (cfg.devMode) console.log('No sales found');

    if (cfg.devMode) console.log('cleanEntries', JSON.stringify(cleanEntries));
    return cleanEntries;
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
}

async function addNoteToTicket(data, cfg) {
  try {
    const cookie = await createSession(cfg);

    if (!cookie) {
      console.error('Could not fetch cookie, aborting...');
      return false;
    }

    const options = {
      method: 'POST',
      uri: `${addProtocol(cfg.url)}/pserv/base/json_backend/ticket/save_note`,
      headers: { cookie: `wice_cookie=${cookie}` },
      json: true,
      simple: false,
      data,
    };

    const response = await request(options);

    return response.body;
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
}

async function createTicket(data, cfg) {
  try {
    const cookie = await createSession(cfg);

    if (!cookie) {
      console.error('Could not fetch cookie, aborting...');
      return false;
    }

    const options = {
      method: 'POST',
      uri: `${addProtocol(cfg.url)}/pserv/base/json_backend/ticket/save_ticket`,
      headers: { cookie: `wice_cookie=${cookie}` },
      json: true,
      simple: false,
      data,
    };

    const response = await request(options);

    return response.body;
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
}

async function createArticle(data, cfg) {
  try {
    const cookie = await createSession(cfg);

    if (!cookie) {
      console.error('Could not fetch cookie, aborting...');
      return false;
    }

    const response = await fetch(`${addProtocol(cfg.url)}/pserv/base/json_backend/article/save_article`,
      {
        method: 'post',
        body: JSON.stringify(data),
        headers: { cookie: `wice_cookie=${cookie}` },
      });


    return await response.json();
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
}


module.exports = {
  createSession, getPersons, getOrganizations, upsertObject, getTickets, addNoteToTicket, createTicket, createArticle, getChances, getSales,
};
