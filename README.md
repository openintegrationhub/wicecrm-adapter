# elasticio-wice-component
> [Wice CRM](https://wice.de/) Node.js component for [elastic.io platform](http://www.elastic.io "elastic.io platform")

[Wice CRM](https://wice.de/) is a CRM(customer relationship management) Software which offers different modules for address management, tasks management, project management, calendars and a knowledge base for knowledge management. The software could be used to manage sales opportunities and offers too. In addition, [Wice CRM](https://wice.de/) offers the possibility to manage and create invoices, open items and incoming payments.

This is a connector(*component*) which connects [Wice CRM](https://wice.de/) with [elastic.io platform](http://www.elastic.io "elastic.io platform"). With this connector you are able to create different flows on [elastic.io](http://www.elastic.io "elastic.io platform"). The component supports **"Triggers"** (e.g. ``getPersons``, ``getOrganizations``) as well as **"Actions"** (e.g. ``updatePerson``, ``createOrganization``, ``updatePersonsOrganization``, etc.), therefore with this component you could both read and fetch data from [Wice CRM](https://wice.de/) and write and save data in [Wice CRM](https://wice.de/) via [elastic.io platform](http://www.elastic.io "elastic.io platform").

## Before you begin

Before you can use the component you **must be a registered Wice CRM user**. Please visit the home page of [Wice CRM](https://wice.de/) to sign up.
> Any attempt to reach [Wice CRM](https://wice.de/) endpoints without registration will not be successful

After you are already registered in [Wice CRM](https://wice.de/) you have to generate your **API Key**.
> For activation you **have to be logged in**, then click of ``Admin`` and under ```Plugins``` click of ``Wice elastic.io backend``. Once you are in click the button ``Create new`` to generate your API key.

Once the activation is done you have an access to **API Key** which is required for an authentication when you make a request to Wice CRM.

## Actions and triggers
The connector supports the following **actions** and **triggers**:

#### Triggers:
  - Get persons (```getPersonsPolling.js```)
  - Get organizations (```getOrganizationsPolling.js```)
  - Get articles(```getArticlesPolling.js```)
  - Get organizations (```getOrganizationsPolling.js```)
  - Get deleted persons (```getDeletedPersonsPolling.js```)
  - Get deleted organizations (```getDeletedOrganizationsPolling.js```)

#### Actions:
  - Create person (```createPerson.js```)
  - Create organization(```createOrganization.js```)
  - Create article(```createArticle.js```)
  - Update person (```updatePerson.js```)
  - Update organization (```updateOrganization.js```)  
  - Update article (```updateArticle.js```)  
  - Delete person (```deletePerson.js```)
  - Delete organization (```deleteOrganization.js```)
  - Delete article (```deleteArticle.js```)
  - Get person by id (```getPersonPolling.js```)
  - Get organization by id (```getOrganizationPolling.js```)
  - Get article by id (```getArticlePolling.js```)

  > **NOTE:** As mentioned before, to perform an action or call a trigger you have to be a registered [Wice CRM](https://wice.de/) user and you have to pass your **API Key** when you send a request.

  In each trigger and action, before sending a request we create a session in [Wice CRM](https://wice.de/) via calling the function ```createSession()``` from ```wice.js``` file, which is located in directory **utils**. This function returns a cookie which is used when we send a request to [Wice CRM](https://wice.de/)

##### Get persons

Get persons trigger (```getPersonsPolling.js```) performs a request which fetch all persons saved by a user in [Wice CRM](https://wice.de/). The response consist of an **array of objects** with all persons and their attributes.

##### Get organizations

Get organizations trigger (```getOrganizationsPolling.js```) performs a request which fetch all organizations saved by a user in [Wice CRM](https://wice.de/). The response consist of an **array of objects** with all organizations and their attributes.

##### Get articles

Get articles trigger (```getArticlesPolling.js```) performs a request which fetch all articles saved by a user in [Wice CRM](https://wice.de/). The response consist of an **array of objects** with all articles and their attributes.

##### Get person

Get person action (```getPersonPolling.js```) performs a request which gets a user by id from [Wice CRM](https://wice.de/). The response is an object.

##### Get organization

Get organization action (```getOrganizationPolling.js```) performs a request which gets an organization by id from [Wice CRM](https://wice.de/). The response is an object.

##### Get article

Get article action (```getArticlePolling.js```) performs a request which gets an article by id from [Wice CRM](https://wice.de/). The response is an object.

##### Get deleted persons

Get deleted persons trigger (```getDeletedPersonsPolling.js```) performs a request which gets all deleted/deactivated persons by a user in [Wice CRM](https://wice.de/). The response consist of an **array of objects** with all persons and their attributes.

##### Get deleted organizations

Get deleted organizations trigger (```getDeletedOrganizationsPolling.js```) performs a request which gets all deleted organizations by a user in [Wice CRM](https://wice.de/). The response consist of an **array of objects** with all organizations and their attributes.

##### Create person

Create person action (``createPerson.js``) creates a person in [Wice CRM](https://wice.de/). At this point of time the function accepts as required parameters ``name`` and ``firstname``, but of course you can also pass other parameters like ``email``, ``phone``, ``salutation``, ``title``, etc.

##### Create organization

Create organization action (``createOrganization.js``) creates a new organization in [Wice CRM](https://wice.de/). This function accepts as required parameter only ``name``, but if you wish you can also pass ``town``, ``street``, ``street_number``, ``zip_code``, ``country``etc.

##### Create article

Create article action (``createArticle.js``) creates a new article in [Wice CRM](https://wice.de/). This function accepts as required parameter ``description``, but if you wish you can also pass ``number``, ``sales_price``, ``purchase_price``, ``in_stock``, ``unit``etc.

##### Update person

Update person action (``updatePerson.js``) updates a specific person in [Wice CRM](https://wice.de/). The function accepts as required parameter ``rowid`` of the person and respectively the values of the properties which you want to update.

##### Update organization

Update organization action (``updateOrganization.js``) updates a specific organization in [Wice CRM](https://wice.de/). The function accepts as required parameter ``rowid`` of the organization  and respectively the values of the properties which you want to update.

##### Update article

Update article action (``updateOrganization.js``) updates a specific article in [Wice CRM](https://wice.de/). The function accepts as required parameter ``rowid`` of the article  and respectively the values of the properties which you want to update.

##### Delete person

Delete person action (``deletePerson.js``) deletes a person in [Wice CRM](https://wice.de/). The required parameter which must be passed is ``rowid`` of the person which you want to delete.

>**NOTE**: We do ***NOT*** really delete the person from our database, we just set a value in field ``deactivated`` to ``1`` which actually  marks the person as ***deactivated*** .

##### Delete organization

Delete organization action (``deleteOrganization.js``) deletes an organization in [Wice CRM](https://wice.de/). The required parameter which must be passed is ``rowid`` of the organization which you want to delete.

##### Delete article

Delete article action (``deleteArticle.js``) deletes an article in [Wice CRM](https://wice.de/). The required parameter which must be passed is ``rowid`` of the article which you want to delete.

***

## License

Apache-2.0 © [Wice GmbH](https://wice.de/)
