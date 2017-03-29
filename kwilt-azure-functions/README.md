# kwilt-azure-functions
Azure Functions for Kwilt


## Setup

In the [functions App Settings](https://docs.microsoft.com/en-us/azure/azure-functions/functions-how-to-use-azure-function-app-settings) you will need to add the following settings

* `AzureWebJobsStorage`: "Connection string for storage account",
* `ImageResizeMaxWidth`: "Maximum width when resizing photos",
* `OcpApimSubscriptionKey`: "Cognitive Services API Key",
* `KwiltDocumentStore`: "Azure Document DB Connection String",
* `VerboseLogging`: "True/False to enable verbose logging to context.log",
* `SearchServiceName`: "Name of Azure Search Instance",
* `SearchServiceAdminKey`: "Administration key for Azure Search"