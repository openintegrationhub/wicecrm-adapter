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

  async function deleteArticle(cookie) {
    const data = JSON.stringify(msg.body);
    const options = {
      method: 'POST',
      uri: 'https://oihwice.wice-net.de/plugin/wp_elasticio_backend/json',
      form: {
        method: 'delete_article',
        cookie,
        data
      },
      headers: {
        'X-API-KEY': cfg.apikey
      }
    };

    try {
      const deletedArticle = await request.post(options);
      return JSON.parse(deletedArticle);
    } catch (e) {
      throw new Error(`No article with ROWID: ${msg.body.rowid} found!`);
    }
  }

  async function executeRequest() {
    try {
      const cookie = await createSession(cfg);
      reply = await deleteArticle(cookie);
      console.log(`Article with ${msg.body.rowid} has been deleted!`);
      return reply;
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
