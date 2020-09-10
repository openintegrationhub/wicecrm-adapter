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
  const { applicationUid, domainId, schema } = cfg;
  const self = this;
  let contacts = [];

  // Set the snapshot if it is not provided
  snapshot.lastUpdatedPerson = snapshot.lastUpdatedPerson || (new Date(0)).toISOString();
  snapshot.lastUpdatedOrganization = snapshot.lastUpdatedOrganization || (new Date(0)).toISOString();

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

  async function fetchAll(options, type) {
    try {
      const result = [];
      const response = await request.get(options);
      const responseObj = JSON.parse(response);

      if (responseObj.loop_addresses === undefined) return result;

      if (type === 'person') {
        responseObj.loop_addresses.filter((person) => {
          const currentPerson = customPerson(person);
          currentPerson.last_update > snapshot.lastUpdatedPerson && result.push(currentPerson);
        });

        result.sort((a, b) => Date.parse(a.last_update) - Date.parse(b.last_update));
        snapshot.lastUpdatedPerson = result[result.length - 1].last_update;
      } else {
        responseObj.loop_addresses.filter((organization) => {
          const currentOrganization = customOrganization(organization);
          currentOrganization.last_update > snapshot.lastUpdatedOrganization && result.push(currentOrganization);
        });

        result.sort((a, b) => Date.parse(a.last_update) - Date.parse(b.last_update));
        snapshot.lastUpdatedOrganization = result[result.length - 1].last_update;
      }

      return result;
    } catch (e) {
      throw new Error(e);
    }
  }

  async function getOrganizations() {
    try {
      const cookie = await createSession(cfg);
      const options = {
        uri: `${cfg.url}/plugin/wp_wice_client_api_backend/json?method=get_all_companies&full_list=1&cookie=${cookie}`,
        headers: { 'X-API-KEY': cfg.apikey },
      };
      contacts = contacts.concat(await fetchAll(options, 'organization'));

      if (!contacts || !Array.isArray(contacts)) return `Expected records array. Instead received: ${JSON.stringify(contacts)}`;

      return contacts;
    } catch (e) {
      throw new Error(e);
    }
  }

  async function getPersons() {
    try {
      const cookie = await createSession(cfg);
      const options = {
        uri: `${cfg.url}/plugin/wp_wice_client_api_backend/json?method=get_all_persons&full_list=1&cookie=${cookie}`,
        headers: { 'X-API-KEY': cfg.apikey },
      };

      contacts = contacts.concat(await fetchAll(options, 'person'));
      if (!contacts || !Array.isArray(contacts)) return `Expected records array. Instead received: ${JSON.stringify(contacts)}`;

      return contacts;
    } catch (e) {
      throw new Error(e);
    }
  }

  async function emitData() {
    /** The following block creates the meta object.
     *  This meta object stores information which are later needed in order to make the hub and spoke architecture work properly
     */
    const oihMeta = {
      applicationUid: (applicationUid !== undefined && applicationUid !== null) ? applicationUid : undefined,
      schema: (schema !== undefined && schema !== null) ? schema : undefined,
      domainId: (domainId !== undefined && domainId !== null) ? domainId : undefined,
    };

    console.log(`Found ${contacts.length} new records.`);

    if (contacts.length > 0) {
      contacts.forEach((elem) => {
        const newElement = {};
        oihMeta.recordUid = elem.rowid;
        delete elem.rowid;
        newElement.meta = oihMeta;
        newElement.data = elem;
        self.emit('data', messages.newMessageWithBody(newElement));
      });
      snapshot.lastUpdated = contacts[contacts.length - 1].last_update;

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
    .then(getPersons)
    .then(emitData)
    .fail(emitError)
    .done(emitEnd);
}

exports.process = processTrigger;
