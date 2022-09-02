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

const { transform } = require('@openintegrationhub/ferryman');
const { addNoteToTicket } = require('./../utils/helpers');
const { ticketFromOih } = require('../transformations/ticketFromOih');

/**
 * This method will be called from elastic.io platform providing following data
 *
 * @param msg incoming message object that contains ``body`` with payload
 * @param cfg configuration that is account information and configuration field values
 */

async function processAction(msg, cfg) {
  try {
    if (cfg.devMode) {
      console.log('Message received:');
      console.log(JSON.stringify(msg));
    }

    const { oihUid, recordUid } = msg.metadata;

    if (!recordUid) {
      console.error('No ticket ID specified to add note to, aborting...');
      return this.emit('end');
    }

    const transformedMsg = transform(msg, cfg, ticketFromOih);

    if (cfg.devMode) {
      console.log('Transformed message:');
      console.log(JSON.stringify(transformedMsg));
    }

    /** The following block creates the meta object.
   *  This meta object stores information which are
   *  later needed in order to make the hub and spoke architecture work properly
   */
    const oihMeta = {
      oihUid,
    };

    const reply = await addNoteToTicket(transformedMsg, cfg);
    oihMeta.recordUid = reply.ticket_rowid;

    this.emit('data', { metadata: oihMeta });
  } catch (e) {
    console.log('Oops! Error occurred');
    this.emit('error', e);
  }
}

module.exports = {
  process: processAction,
};