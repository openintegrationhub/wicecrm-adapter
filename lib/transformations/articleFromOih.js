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


module.exports.articleFromOih = (msg) => {
  if (Object.keys(msg).length === 0 && msg.constructor === Object) {
    return msg;
  }

  const ticket = {
    number: 'auto',
    description: msg.data.descriptionde || msg.data.description,
    description2: msg.data.description,
    long_description: msg.data.longdescriptionde || msg.data.longdescription,
    long_description2: msg.data.longdescription,
    sales_price: msg.data.salesprice,
    purchase_price: msg.data.purchasepPrice,
    tax: msg.data.taxrate,
    available_for_input: 1,
  };
  return ticket;
};
