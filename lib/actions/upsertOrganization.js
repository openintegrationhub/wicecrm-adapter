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
  const oihUid = (msg.body.meta != undefined && msg.body.meta.oihUid != undefined) ? msg.body.meta.oihUid : 'oihUid not set yet';
  const recordUid = (msg.body != undefined && msg.body.meta.uid != undefined) ? msg.body.meta.uid : 'uid not set yet';
  const newElement = {};

  const getApplicationUidOptions = {
    uri: `http://component-repository.openintegrationhub.com/components/${process.env.ELASTICIO_COMP_ID}`,
    json: true,
    headers: {
      Authorization: `Bearer ${iamToken}`,
    },
  };

  // Make request to Component Repository API
  const applicationUidResponse = await request.get(getApplicationUidOptions);

  /** The following block creates the meta object.
   *  This meta object stores information which are later needed in order to make the hub and spoke architecture work properly
   */
  const { applicationUid } = applicationUidResponse.data;

  const oihMeta = {
    applicationUid: (applicationUid != undefined && applicationUid != null) ? applicationUid : 'applicationUid not set yet',
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


async function checkForExistingOrganization(organization, cookie, options) {
  let existingRowid = 0;
  try {
    options.form = {
      method: 'get_all_companies',
      cookie,
      ext_search_do: 1,
      name: organization.body.name,
    };

    const rowid = await request.post(options);
    const rowidObj = JSON.parse(rowid);
    if (rowidObj.loop_addresses) {
      existingRowid = rowidObj.loop_addresses[0].rowid;
      console.log(`Organization already exists ... ROWID: ${existingRowid}`);
    }
    return existingRowid;
  } catch (e) {
    throw new Error(e);
  }
}

async function createOrUpdateOrganization(existingRowid, cookie, options, msg) {
  try {
    if (existingRowid == 0) {
      console.log('Creating organization ...');
      const input = JSON.stringify(msg.body);
      options.form = {
        method: 'insert_company',
        data: input,
        cookie,
      };
      const organization = await request.post(options);
      return JSON.parse(organization);
    }
    console.log('Updating organization ...');
    msg.body.rowid = existingRowid;
    options.form = {
      method: 'update_company',
      data: JSON.stringify(msg.body),
      cookie,
    };
    const organization = await request.post(options);
    return JSON.parse(organization);
  } catch (e) {
    throw new Error(e);
  }
}

async function executeRequest(msg, cfg, options) {
  try {
    const cookie = await createSession(cfg);
    const existingRowid = await checkForExistingOrganization(msg, cookie, options);
    return await createOrUpdateOrganization(existingRowid, cookie, options, msg);
  } catch (e) {
    throw new Error(e);
  }
}

module.exports = {
  process: processAction,
  checkForExistingOrganization,
  createOrUpdateOrganization,
};
