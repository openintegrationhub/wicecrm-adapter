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
const { chanceToOih } = require('../transformations/chanceToOih');
const { getChances } = require('./../utils/helpers');

/**
 * This method will be called from elastic.io platform providing following data
 *
 * @param msg incoming message object that contains ``body`` with payload
 * @param cfg configuration that is account information and configuration field values
 * @param snapshot saves the current state of integration step for the future reference
 */
async function processTrigger(msg, cfg, snapshot = {}) {
  try {
    snapshot.lastUpdated = snapshot.lastUpdated || 0;
    snapshot.lastUpdatedYear = snapshot.lastUpdatedYear || 2000;
    snapshot.lastUpdatedMonth = snapshot.lastUpdatedMonth || 1;
    console.log(`Last Updated: ${snapshot.lastUpdated} - ${snapshot.lastUpdatedMonth} ${snapshot.lastUpdatedYear}`);

    const chances = await getChances(cfg, snapshot);

    const oihMeta = {};

    console.log(`Found ${chances.length} new chances.`);

    if (chances.length > 0) {
      chances.forEach((elem) => {
        const newElement = {};
        oihMeta.recordUid = elem.rowid;
        newElement.metadata = oihMeta;
        newElement.data = elem;
        const transformedElement = transform(newElement, cfg, chanceToOih);

        console.log('Chance', transformedElement);

        this.emit('data', transformedElement);
      });
      snapshot.lastUpdated = Date.parse(chances[chances.length - 1].last_update);
      const now = new Date();
      snapshot.lastUpdatedMonth = now.getMonth();
      snapshot.lastUpdatedYear = now.getFullYear();
      console.log(`New snapshot: ${snapshot.lastUpdated} - ${snapshot.lastUpdatedMonth} ${snapshot.lastUpdatedYear}`);
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
