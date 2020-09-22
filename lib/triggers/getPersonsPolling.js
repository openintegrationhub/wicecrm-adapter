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

const { getPersons, newMessage } = require('./../utils/helpers');

/**
 * This method will be called from elastic.io platform providing following data
 *
 * @param msg incoming message object that contains ``body`` with payload
 * @param cfg configuration that is account information and configuration field values
 * @param snapshot saves the current state of integration step for the future reference
 */
async function processTrigger(msg, cfg, snapshot = {}) {
  try {
    const { applicationUid, domainId, schema } = cfg;

    // Set the snapshot if it is not provided
    snapshot.lastUpdated = snapshot.lastUpdated || (new Date(0)).toISOString();
    console.log(`Last Updated: ${snapshot.lastUpdated}`);

    const contacts = await getPersons(cfg, snapshot);
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
        this.emit('data', newMessage(newElement));
      });
      snapshot.lastUpdated = contacts[contacts.length - 1].last_update;
      console.log(`New snapshot: ${snapshot.lastUpdated}`);
      this.emit('snapshot', snapshot);
    } else {
      this.emit('snapshot', snapshot);
    }
  } catch (e) {
    console.log(`ERROR: ${e}`);
    this.emit('error', e);
  }
}

exports.process = processTrigger;
