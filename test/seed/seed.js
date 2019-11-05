const configOptions = {
  client_name: 'sandbox',
  username: 'shterion ',
  password: 'd36adb53',
  path: 'https://oihwice.wice-net.de',
  apikey: 'fsuogsi9p1im1gpnhvapjdtx94z46qye',
};

const options = {
  method: 'POST',
  uri: 'https://oihwice.wice-net.de/plugin/wp_wice_client_api_backend/json',
  headers: {
    'X-API-KEY': undefined, // 'fsuogsi9p1im1gpnhvapjdtx94z46qye'
  },
};

const organizations = [{
  body: {
    name: 'Company Ltd.',
    email: 'info@company.com',
  },
},
{
  body: {
    name: 'Test GmbH',
    email: 'info@testgmbh.com',
  },
},
{
  body: {
    name: 'Travel Mates',
    email: 'info@travelmates.com',
  },
},
];

const persons = [{
  body: {
    name: 'Brown',
    firstname: 'Adam',
  },
},
{
  body: {
    name: 'Doe',
    firstname: 'John',
  },
},
{
  body: {
    meta: {
      uid: '123asd',
    },
    data: {
      oihUidEncrypted: '',
      name: 'Kolarovv',
      firstname: 'Sebastian',
      email: 'kolarov@mail.com',
    },
  },
},
];

const articles = [{
  body: {
    description: 'Arduino Nano',
  },
},
{
  body: {
    description: 'Raspberry Pi',
  },
},
];

module.exports = {
  configOptions,
  persons,
  organizations,
  articles,
};
module.exports = {
  options,
  configOptions,
  persons,
  organizations,
  articles,
};
