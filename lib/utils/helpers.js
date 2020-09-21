/* eslint no-await-in-loop: "off" */

const uuid = require('uuid');
const request = require('request-promise');

async function createSession(cfg) {
  // console.log(`API KEY: ${cfg.apikey}`);
  const options = {
    method: 'POST',
    uri: `${cfg.url}/pserv/base/json`,
    form: {
      method: 'login',
      mandant_name: cfg.client_name,
      username: cfg.username,
      password: cfg.password,
    },
    headers: { 'X-API-KEY': cfg.apikey },
  };

  try {
    const getCookie = await request.post(options);
    const { cookie } = JSON.parse(getCookie);
    // console.log(`COOKIE: ${cookie}`);
    return cookie;
  } catch (e) {
    console.log(`ERROR: ${e}`);
    throw new Error(e);
  }


function newMessage(body) {
  const msg = {
    id: uuid.v4(),
    attachments: {},
    body,
    headers: {},
    metadata: {},
  };

  return msg;
}


module.exports = {
  createSession, newMessage,
};
