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
      operation: msg.operation,
      applicationUid: (msg.metadata.applicationUid !== undefined && msg.metadata.applicationUid !== null) ? msg.metadata.applicationUid : 'appUid not set yet',
      iamToken: (msg.metadata.iamToken !== undefined && msg.metadata.iamToken !== null) ? msg.metadata.iamToken : undefined,
      domainId: (msg.metadata.domainId !== undefined && msg.metadata.domainId !== null) ? msg.metadata.domainId : undefined,
      schema: (msg.metadata.schema !== undefined && msg.metadata.schema !== null) ? msg.metadata.schema : undefined,
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
