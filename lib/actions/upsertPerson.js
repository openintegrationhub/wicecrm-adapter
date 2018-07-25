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

"use strict";

const Q = require('q');
const request = require('request-promise');
const { messages } = require('elasticio-node');
const { createSession } = require('./../utils/wice');

exports.process = processAction;

/**
 * This method will be called from elastic.io platform providing following data
 *
 * @param msg incoming message object that contains ``body`` with payload
 * @param cfg configuration that is account information and configuration field values
 */
function processAction(msg, cfg) {
  const self = this;
  let reply = [];

  const options = {
    method: 'POST',
    uri: 'https://oihwice.wice-net.de/plugin/wp_elasticio_backend/json',
    headers: {
      'X-API-KEY': cfg.apikey
    }
  };

  msg.body.same_contactperson = 'auto';

  async function checkForExistingPerson(person, cookie) {
    let existingRowid = 0;
    try {
      options.form = {
        method: 'get_all_persons',
        cookie,
        ext_search_do: 1,
        name: person.name
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

  async function createOrUpdatePerson(existingRowid, cookie) {
    try {
      if (existingRowid == 0) {
        console.log('Creating person ...');
        const input = JSON.stringify(msg.body);
        options.form = {
          method: 'insert_contact',
          data: input,
          cookie
        };
        const person = await request.post(options);
        return JSON.parse(person);
      } else {
        console.log('Updating person ...');
        msg.body.rowid = existingRowid;
        options.form = {
          method: 'update_contact',
          data: JSON.stringify(msg.body),
          cookie
        };
        const person = await request.post(options);
        return JSON.parse(person);
      }
    } catch (e) {
      throw new Error(e);
    }
  }

  async function executeRequest() {
    try {
      const cookie = await createSession(cfg);
      const existingRowid = await checkForExistingPerson(msg.body, cookie);
      reply = await createOrUpdatePerson(existingRowid, cookie);
    } catch (e) {
      throw new Error(e);
    }
  }

  function emitData() {
    const data = messages.newMessageWithBody(reply);
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
    .then(executeRequest)
    .then(emitData)
    .fail(emitError)
    .done(emitEnd);
}
