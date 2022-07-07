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

module.exports.personToOih = (msg) => {
  if (Object.keys(msg).length === 0 && msg.constructor === Object) {
    return msg;
  }

  const addresses = [];

  const wiceAddresses = {
    ...(msg.data.private_street && { street: msg.data.private_street }),
    ...(msg.data.private_street_number && { streetNumber: String(msg.data.private_street_number) }),
    ...(msg.data.private_zip_code && { zipcode: String(msg.data.private_zip_code) }),
    ...(msg.data.private_town && { city: msg.data.private_town }),
    ...(msg.data.private_state && { region: msg.data.private_state }),
    ...(msg.data.private_country && { country: msg.data.private_country }),
    ...(msg.data.private_country_symbol && { countryCode: msg.data.private_country_symbol }),
  };

  const wiceContactData = [
    {
      type: 'email',
      value: msg.data.email,
    },
    {
      type: 'mobil',
      value: String(msg.data.private_mobile_phone),
    },
    {
      type: 'mobil',
      value: String(msg.data.mobile_phone),
    },
    {
      type: 'phone',
      value: String(msg.data.phone),
    },
    {
      type: 'fax',
      value: String(msg.data.fax),
    },
  ];

  const contactData = wiceContactData.filter(cd => cd.value && cd.value !== 'undefined');

  if (Object.keys(wiceAddresses).length >= 1) {
    addresses.push(wiceAddresses);
  }

  const relations = [];

  if (msg.data.for_rowid && msg.data.for_rowid !== 0) {
    relations.push(
      {
        label: 'Employer',
        type: 'OrganizationToPerson',
        uids: [String(msg.data.for_rowid)],
      },
    );
  }

  const expression = {
    metadata: {
      recordUid: msg.metadata.recordUid,
    },
    data: {
      firstName: msg.data.firstname,
      lastName: msg.data.name,
      title: msg.data.title,
      jobTitle: msg.data.position,
      photo: msg.data.picture_url,
      addresses,
      contactData,
      relations,
    },
  };
  return expression;
};
