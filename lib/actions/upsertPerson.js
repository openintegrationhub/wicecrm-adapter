/**
 * Copyright 2018 Wice GmbH

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

const Q = require('q');
const request = require('request-promise');
const { messages } = require('elasticio-node');
const { createSession } = require('./../utils/wice');

/**
 * This method will be called from elastic.io platform providing following data
 *
 * @param msg incoming message object that contains ``body`` with payload
 * @param cfg configuration that is account information and configuration field values
 */

async function processAction(msg, cfg) {
  const self = this;
  const oihUid = (msg.body.meta !== undefined && msg.body.meta.oihUid !== undefined) ? msg.body.meta.oihUid : 'oihUid not set yet';
  const recordUid = (msg.body !== undefined && msg.body.meta.uid !== undefined) ? msg.body.meta.uid : 'uid not set yet';
  const newElement = {};
  const iamToken = (msg.body.meta !== undefined && msg.body.meta.iamToken !== undefined) ? msg.body.meta.iamToken : undefined;
  let applicationUid;

  console.error('META: ', msg.body.meta);

  const getApplicationUidOptions = {
    uri: `http://component-repository.openintegrationhub.com/components/${process.env.ELASTICIO_COMP_ID}`,
    json: true,
    headers: {
      Authorization: `Bearer ${iamToken}`,
    },
    simple: false
  };

  // Make request to Component Repository API
  if (iamToken) {
    const applicationUidResponse = await request.get(getApplicationUidOptions);
    applicationUid = applicationUidResponse.data.applicationUid; // eslint-disable-line
  }

  /** The following block creates the meta object.
   *  This meta object stores information which are later needed in order to make the hub and spoke architecture work properly
   */

  const oihMeta = {
    applicationUid: (applicationUid !== undefined && applicationUid !== null) ? applicationUid : 'applicationUid not set yet',
    oihUid,
    recordUid,
  };

  const options = {
    method: 'POST',
    uri: 'https://oihwice.wice-net.de/plugin/wp_wice_client_api_backend/json',
    headers: {
      'X-API-KEY': cfg.apikey,
    },
  };

  msg.body.data.same_contactperson = 'auto';

  async function emitData() {
    const reply = await executeRequest(msg, cfg, options);

    oihMeta.recordUid = reply.rowid;
    const response = {
      meta: oihMeta,
      data: reply,
    };

    const data = messages.newMessageWithBody(response);
    self.emit('data', data);
  }

  function emitError(e) {
    console.log('Oops! Error occurred');
    self.emit('error', e);
  }

  function emitEnd() {
    console.log('Finished execution');
    self.emit('end');
  }

  Q()
    .then(emitData)
    .fail(emitError)
    .done(emitEnd);
}

async function checkForExistingPerson(person, cookie, options) {
  let existingRowid = 0;
  try {
    options.form = {
      method: 'get_all_persons',
      cookie,
      ext_search_do: 1,
      // name: person.body.name,
      name: person.body.data.name,
    };

    const rowid = await request.post(options);
    const rowidObj = JSON.parse(rowid);
    if (rowidObj.loop_addresses) {
      existingRowid = rowidObj.loop_addresses[0].rowid;
      console.log(`Person already exists ... ROWID: ${existingRowid}`);
    }
    return existingRowid;
  } catch (e) {
    throw new Error(e);
  }
}

async function createOrUpdatePerson(existingRowid, cookie, options, msg) {
  try {
    if (existingRowid === 0) {
      console.log('Creating person ...');
      // const input = JSON.stringify(msg.body);
      const input = JSON.stringify(msg.body.data);
      options.form = {
        method: 'insert_contact',
        data: input,
        cookie,
      };
      const person = await request.post(options);
      return JSON.parse(person);
    }
    console.log('Updating person ...');
    // msg.body.rowid = existingRowid;
    msg.body.data.rowid = existingRowid;
    options.form = {
      method: 'update_contact',
      // data: JSON.stringify(msg.body),
      data: JSON.stringify(msg.body.data),
      cookie,
    };

    const person = await request.post(options);
    return JSON.parse(person);
  } catch (e) {
    throw new Error(e);
  }
}

async function executeRequest(msg, cfg, options) {
  try {
    const cookie = await createSession(cfg);
    const existingRowid = await checkForExistingPerson(msg, cookie, options);
    const result = await createOrUpdatePerson(existingRowid, cookie, options, msg);
    return result;
  } catch (e) {
    throw new Error(e);
  }
}

module.exports = {
  process: processAction,
  checkForExistingPerson,
  createOrUpdatePerson,
};
