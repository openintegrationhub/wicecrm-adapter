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
const { newMessage, upsertObject } = require('./../utils/helpers');
const { organizationFromOih } = require('../transformations/organizationFromOih');

/**
 * This method will be called from elastic.io platform providing following data
 *
 * @param msg incoming message object that contains ``body`` with payload
 * @param cfg configuration that is account information and configuration field values
 */
async function processAction(msg, cfg) {
  try {
    const transformedMsg = transform(msg, cfg, organizationFromOih);
    const oihUid = (transformedMsg.meta !== undefined && transformedMsg.meta.oihUid !== undefined)
      ? transformedMsg.meta.oihUid : undefined;
    const recordUid = (transformedMsg !== undefined && transformedMsg.meta.recordUid !== undefined)
      ? transformedMsg.meta.recordUid : undefined;
    const applicationUid = (transformedMsg.meta !== undefined && transformedMsg.meta.applicationUid !== undefined)
      ? transformedMsg.meta.applicationUid : undefined;


    /** The following block creates the meta object.
   *  This meta object stores information which are
   *  later needed in order to make the hub and spoke architecture work properly
   */
    const oihMeta = {
      applicationUid,
      oihUid,
      recordUid,
    };

    const reply = await upsertObject(transformedMsg, cfg, 'organization');
    oihMeta.recordUid = reply.rowid;
    const response = {
      meta: oihMeta,
      data: reply,
    };

    const data = newMessage(response);
    this.emit('data', data);
  } catch (e) {
    console.log('Oops! Error occurred');
    this.emit('error', e);
  }
}

module.exports = {
  process: processAction,
};
