/* eslint max-len: 'off' */
/* eslint camelcase: 'off' */
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

// const jsonata = require('jsonata');

module.exports.organizationFromOih = (msg) => {
  if (Object.keys(msg.body).length === 0 && msg.body.constructor === Object) {
    return msg.body;
  }

  let email;
  let mobile_phone;
  let phone;
  let private_street;
  let private_street_number;
  let private_town;
  let private_country;
  let private_zip_code;

  if (msg.body.data.contactData) {
    const foundEmail = msg.body.data.contactData.find(cd => cd.type === 'email');
    if (foundEmail) email = foundEmail.value;

    const foundMobile = msg.body.data.contactData.find(cd => (cd.type === 'mobil' || cd.type === 'mobile'));
    if (foundMobile) mobile_phone = foundMobile.value;

    const foundPhone = msg.body.data.contactData.find(cd => cd.type === 'phone');
    if (foundPhone) phone = foundPhone.value;
  }

  if (msg.body.data.addresses) {
    const foundAddress = msg.body.data.addresses.find(adr => adr.description === 'primary');

    if (foundAddress) {
      private_street = foundAddress.street;
      private_street_number = foundAddress.streetNumber;
      private_town = foundAddress.city;
      private_country = foundAddress.country;
      private_zip_code = foundAddress.zipCode;
    }
  }


  const expression = {
    meta: {
      operation: msg.body.operation,
      oihUid: msg.body.meta.oihUid ? msg.body.meta.oihUid : '',
      applicationUid: msg.body.meta.applicationUid ? msg.body.meta.applicationUid : '',
      iamToken: msg.body.meta.iamToken ? msg.body.meta.iamToken : undefined,
      recordUid: msg.body.meta.recordUid,
    },
    data: {
      name: msg.body.data.name,
      email,
      mobile_phone,
      phone,
      private_street,
      private_street_number,
      private_town,
      private_country,
      private_zip_code,
    },
  };

  return expression;
};
