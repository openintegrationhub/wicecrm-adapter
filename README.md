# wice-adapter

[Wice CRM](https://wice.de/) is a CRM Software which offers different modules for address management, tasks management, project management, calendars and a knowledge base for knowledge management. The software could be used to manage sales opportunities and offers too. In addition, [Wice CRM](https://wice.de/) offers the possibility to manage and create invoices, open items and incoming payments.

This **adapter** connects [Wice CRM](https://wice.de/) which with third-party applications. With this **adapter** you are able to create different application flows. It supports **"Triggers"** (e.g. ``getPersonsPolling``, ``getOrganizationsPolling``) as well as **"Actions"** (e.g. ``upsertPerson``, ``upsertArticle``, ``updatePersonsOrganization``, etc.), therefore with this **adapter** you could both read and fetch data from [Wice CRM](https://wice.de/) and write and save data in [Wice CRM](https://wice.de/).

## Before you begin

Before you can use the component you **must be a registered Wice CRM user**. Please visit the home page of [Wice CRM](https://wice.de/) to sign up.
> Any attempt to reach [Wice CRM](https://wice.de/) endpoints without registration will not be successful

After you are already registered in [Wice CRM](https://wice.de/) you have to generate your **API Key**.
> For activation you **have to be logged in**, then click of ``Admin`` and under ```Plugins``` click of ``Client API Backend``. Once you are in click the button ``Create new`` to generate your API key.

Once the activation is done you have an access to **API Key** which is required for an authentication when you make a request to Wice CRM.

## Actions and triggers
The connector supports the following **actions** and **triggers**:

#### Triggers:
  - Get persons - polling (```getPersonsPolling.js```)
  - Get organizations - polling (```getOrganizationsPolling.js```)

  All triggers are of type '*polling'* which means that the **trigger** will be scheduled to execute periodically. It will fetch only these objects from the database that have been modified or created since the previous execution. Then it will emit one message per object that changes or is added since the last polling interval. For this case at the very beginning we just create an empty `snapshot` object. Later on we attach ``lastUpdated`` to it. At the end the entire object should be emitted as the message body.

#### Actions:
  - Upsert person (```upsertPerson.js```)
  - Upsert organization(```upsertOrganization.js```)

  > **NOTE:** As mentioned before, to perform an action or call a trigger you have to be a registered [Wice CRM](https://wice.de/) user and you have to pass your **API Key** when you send a request.

  In each trigger and action, before sending a request we create a session in [Wice CRM](https://wice.de/) via calling the function ```createSession()``` from ```wice.js``` file, which is located in directory **utils**. This function returns a cookie which is used when we send a request to [Wice CRM](https://wice.de/)

##### Get persons

Get persons trigger (```getPersonsPolling.js```) performs a request which fetches all new and updated persons saved by a user in [Wice CRM](https://wice.de/).

##### Get organizations

Get organizations trigger (```getOrganizationsPolling.js```) performs a request which fetches all new and updated organizations saved by a user in [Wice CRM](https://wice.de/).

##### Upsert person

Upsert person action (``upsertPerson.js``) updates an existing person if it already exists. Otherwise creates a new one. At this point of time the function accepts as required parameters ``name`` and ``firstname``, but of course you can also pass other parameters like ``email``, ``phone``, ``salutation``, ``title``, etc.

##### Upsert organization

Upsert organization action (``upsertOrganization.js``) updates an existing organization if it already exists. Otherwise creates a new one. This function accepts as required parameter only ``name``, but if you wish you can also pass ``town``, ``street``, ``street_number``, ``zip_code``, ``country``etc.

## Integrated Transformations

As of version 2.0.0, transformations to and from the OIH contact master data model are integrated into the relevant actions/triggers by default. This means that it is no longer necessary to run a separate Wice CRM Transformer in flows containing this Adapter.

If you would like to use the old behaviour without integrated transformations, simply set `skipTransformation: true` in the `fields` object of your flow configuration. Alternatively, you can also inject a valid, stringified JSONata expression in the `customMapping` key of the `fields` object, which will be used instead of the integrated transformation.

***

## License

Apache-2.0 © [Wice GmbH](https://wice.de/)
