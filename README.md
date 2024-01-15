# Boilerplate for node.js

Boilerplate for Node.js server based on koa.js framework
Main feature is use one schema for:
- validation requests
- build swagger documentation
- create router

This template use next packages:
- jest
- swagger
- koa.js

## Swagger documentation

- You can open swagger documentation on /docs endpoint
- To add a new endpoint, include it in the Swagger schema located at `schemas/swagger.yaml`,
following a style similar to the `/ping` endpoint.
Additionally, create a new controller for the endpoint.
This controller will handle the business logic, generate Swagger documentation, 
and seamlessly connect to a new router, all based on a single schema.
- For correct work validation in `schemas/components/parameters.yaml` and `schemas/components/requestBodies.yaml`
should use $ref with component level (e.g. `../components/schemas.yaml#example`)
