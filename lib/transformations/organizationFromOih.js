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
  if (Object.keys(msg).length === 0 && msg.constructor === Object) {
    return msg;
  }

  let email;
  let mobile_phone;
  let phone;
  let private_street;
  let private_street_number;
  let private_town;
  let private_country;
  let private_zip_code;

  if (msg.data.contactData) {
    const foundEmail = msg.data.contactData.find(cd => cd.type === 'email');
    if (foundEmail) email = foundEmail.value;

    const foundMobile = msg.data.contactData.find(cd => (cd.type === 'mobil' || cd.type === 'mobile'));
    if (foundMobile) mobile_phone = foundMobile.value;

    const foundPhone = msg.data.contactData.find(cd => cd.type === 'phone');
    if (foundPhone) phone = foundPhone.value;
  }

  if (msg.data.addresses) {
    const foundAddress = msg.data.addresses.find(adr => adr.description === 'primary');

    if (foundAddress) {
      private_street = foundAddress.street;
      private_street_number = foundAddress.streetNumber;
      private_town = foundAddress.city;
      private_country = foundAddress.country;
      private_zip_code = foundAddress.zipCode;
    }
  }


  const expression = {
    metadata: {
      operation: msg.operation,
      oihUid: msg.metadata.oihUid ? msg.metadata.oihUid : '',
      applicationUid: msg.metadata.applicationUid ? msg.metadata.applicationUid : '',
      iamToken: msg.metadata.iamToken ? msg.metadata.iamToken : undefined,
      recordUid: msg.metadata.recordUid,
    },
    data: {
      name: msg.data.name,
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
