const configOptions = {
  client_name: 'sandbox',
  username: 'wicecrmAdapterTest',
  password: 'd36adb53',
  path: 'https://oihwice.wice-net.de',
  apikey: 'fsuogsi9p1im1gpnhvapjdtx94z46qye',
  url: 'https://oihwice.wice-net.de',
};

const options = {
  method: 'POST',
  uri: 'https://oihwice.wice-net.de/plugin/wp_wice_client_api_backend/json',
  headers: {
    'X-API-KEY': undefined, // 'fsuogsi9p1im1gpnhvapjdtx94z46qye'
  },
};

const organization = {
  metadata: {
    recordUid: '368125',
  },
  data: {
    name: 'Test GmbH',
    email: 'info@testgmbh.com',
  },
};

const person = {
  metadata: {
    recordUid: '433610',
  },
  data: {
    name: 'Kolarovv',
    firstname: 'Sebastian',
    email: 'kolarov@mail.com',
  },
};


module.exports = {
  configOptions,
  person,
  organization,
  options,
};
