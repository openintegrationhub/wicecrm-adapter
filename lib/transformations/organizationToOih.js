/* eslint max-len: 'off' */

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

module.exports.organizationToOih = (msg) => {
  if (Object.keys(msg).length === 0 && msg.constructor === Object) {
    return msg;
  }

  const expression = {
    metadata: {
      recordUid: msg.metadata.recordUid,
    },
    data: {
      name: msg.data.name,
      addresses: [],
      contactData: [],
    },
  };

  if (msg.data.phone) {
    expression.data.contactData.push({
      type: 'phone',
      value: msg.data.phone,
    });
  }

  if (msg.data.fax) {
    expression.data.contactData.push({
      type: 'fax',
      value: msg.data.fax,
    });
  }

  if (msg.data.email) {
    expression.data.contactData.push({
      type: 'email',
      value: msg.data.email,
    });
  }

  const address = {
    ...(msg.data.street && { street: msg.data.street }),
    ...(msg.data.street_number && { streetNumber: String(msg.data.street_number) }),
    ...(msg.data.zip_code && { zipcode: String(msg.data.zip_code) }),
    ...(msg.data.town && { city: msg.data.town }),
    ...(msg.data.state && { region: msg.data.state }),
    ...(msg.data.country && { country: msg.data.country }),
    ...(msg.data.country_symbol && { countryCode: msg.data.country_symbol }),
  };

  if (Object.keys(address).length > 0) {
    expression.data.addresses.push(address);
  }
  return expression;
};
