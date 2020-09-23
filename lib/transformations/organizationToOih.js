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
    meta: {
      recordUid: msg.meta.recordUid,
      operation: msg.operation,
      applicationUid: (msg.meta.applicationUid !== undefined && msg.meta.applicationUid !== null) ? msg.meta.applicationUid : 'appUid not set yet',
      iamToken: (msg.meta.iamToken !== undefined && msg.meta.iamToken !== null) ? msg.meta.iamToken : undefined,
      domainId: (msg.meta.domainId !== undefined && msg.meta.domainId !== null) ? msg.meta.domainId : undefined,
      schema: (msg.meta.schema !== undefined && msg.meta.schema !== null) ? msg.meta.schema : undefined,
    },
    data: {
      name: msg.data.name,
      addresses: [],
    },
  };

  const address = {
    ...(msg.data.private_street && { street: msg.data.private_street }),
    ...(msg.data.private_street_number && { streetNumber: String(msg.data.private_street_number) }),
    ...(msg.data.private_zip_code && { zipcode: String(msg.data.private_zip_code) }),
    ...(msg.data.private_town && { city: msg.data.private_town }),
    ...(msg.data.private_state && { region: msg.data.private_state }),
    ...(msg.data.private_country && { country: msg.data.private_country }),
    ...(msg.data.private_country_symbol && { countryCode: msg.data.private_country_symbol }),
  };

  if (Object.keys(address).length > 0) {
    expression.addresses.push(address);
  }
  return expression;
};
