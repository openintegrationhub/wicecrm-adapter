/* eslint no-param-reassign: "off" */
/* eslint array-callback-return: "off" */
/* eslint no-unused-expressions: "off" */

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
 * @param snapshot saves the current state of integration step for the future reference
 */
function processTrigger(msg, cfg, snapshot = {}) {
  const self = this;
  // const appUid = process.env.AppUid;
  const iamToken = (msg.body.meta !== undefined && msg.body.meta.iamToken !== undefined) ? msg.body.meta.iamToken : undefined;
  let organizations = [];

  // Set the snapshot if it is not provided
  snapshot.lastUpdated = snapshot.lastUpdated || (new Date(0)).toISOString();
  console.log(`Last Updated: ${snapshot.lastUpdated}`);

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

  async function fetchAll(options) {
    try {
      const result = [];
      const organizationsResponse = await request.get(options);
      const organizationsObj = JSON.parse(organizationsResponse);

      if (organizationsObj.loop_addresses === undefined) return result;

      organizationsObj.loop_addresses.filter((organization) => {
        const currentOrganization = customOrganization(organization);
        currentOrganization.last_update > snapshot.lastUpdated && result.push(currentOrganization);
      });

      result.sort((a, b) => Date.parse(a.last_update) - Date.parse(b.last_update));
      return result;
    } catch (e) {
      throw new Error(e);
    }
  }


  async function getOrganizations() {
    try {
      const cookie = await createSession(cfg);
      const options = {
        uri: `https://oihwice.wice-net.de/plugin/wp_wice_client_api_backend/json?method=get_all_companies&full_list=1&cookie=${cookie}`,
        headers: { 'X-API-KEY': cfg.apikey },
      };
      organizations = await fetchAll(options);

      if (!organizations || !Array.isArray(organizations)) return `Expected records array. Instead received: ${JSON.stringify(organizations)}`;

      return organizations;
    } catch (e) {
      throw new Error(e);
    }
  }

  async function emitData() {
    const getApplicationUidOptions = {
      uri: `http://component-repository.openintegrationhub.com/components/${process.env.ELASTICIO_COMP_ID}`,
      json: true,
      headers: {
        Authorization: `Bearer ${iamToken}`,
      },
    };

    let applicationUid;
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
      iamToken: (iamToken !== undefined && iamToken !== null) ? iamToken : undefined,
    };
    console.log(`Found ${organizations.length} new records.`);

    if (organizations.length > 0) {
      organizations.forEach((elem) => {
        const newElement = {};
        oihMeta.recordUid = elem.rowid;
        delete elem.rowid;
        newElement.meta = oihMeta;
        newElement.data = elem;
        self.emit('data', messages.newMessageWithBody(newElement));
      });
      snapshot.lastUpdated = organizations[organizations.length - 1].last_update;
      console.log(`New snapshot: ${snapshot.lastUpdated}`);
      self.emit('snapshot', snapshot);
    } else {
      self.emit('snapshot', snapshot);
    }
  }

  function emitError(e) {
    console.log(`ERROR: ${e}`);
    self.emit('error', e);
  }

  function emitEnd() {
    console.log('Finished execution');
    self.emit('end');
  }

  Q()
    .then(getOrganizations)
    .then(emitData)
    .fail(emitError)
    .done(emitEnd);
}

exports.process = processTrigger;
