# Azure Search Setup & Configuration

## Requirments

* Install [Postman](https://www.getpostman.com/)

## Postman Setup

1. In Postman create the following global (or envronment specific) variables
  - `KwiltDocDbConnectionString` : The connection string for the DocumentDB where file (photo) data will be stored
  - `KwiltSearchAccountName` : The Azure Search search instance name
  - `KwiltSearchAdminKey` : The primary admin key for your Azure Search instance

## Azure Search Setup

1. Run `Create Data Source` to configure your Azure Search to include your DocumentDB Data Source
  * Note: You can remove this data source by running `Delete Data Source`
1. Run `Create Index` to create the search index (rules about which fields are searchable, returnable, filterable etc.).
  * Note: The file `search-files-index.json` in this repository should always contain the latest index definition. Make changes to this file and copy it's contents into the body for `Create Index` in Postman.
1. Run `Create Indexer` to create the indexer that pulles data from the Data Source and assigns it the above index


## Sample Searches

* Once the indexer has successfully run you can start running sample queries found in the `002 - Searches` section of the Postman collection.