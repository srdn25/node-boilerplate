const fs = require('node:fs');
const path = require('node:path');
const { koaSwagger } = require('koa2-swagger-ui');
const Ajv = require('ajv');
const yaml = require('js-yaml');
const Router = require('koa-router');
const serve = require('koa-static');
const controllers = require('../api/controllers');
const ValidationError = require('../utils/error/Validation');
const { omit } = require('../utils/helper');

const ajv = new Ajv({
  useDefaults: true,
  coerceTypes: true,
});

const swaggerDir = path.join(process.cwd(), 'schemas');

function prepareSwaggerSchemaPathString(filePath) {
  return filePath.replace(/^\.+\//, '');
}

function loadSwaggerRef(filePath) {
  return yaml.load(fs.readFileSync(path.join(swaggerDir, filePath), 'utf8'));
}

function prepareMethods(controller, app) {
  return Object.fromEntries(Object.entries(controller)
    .map(([ name, func ]) => {
      const controllerMethod = func(app);

      const decorator = (ctx) => {
        return controllerMethod(ctx);
      };

      return [ name, decorator ];
    }));
}

function prepareControllers(app) {
  return Object.fromEntries(Object.entries(controllers)
    .map(([ name, controller ]) => {
      const handlers = prepareMethods(controller, app);
      return [ name, handlers ];
    }));
}

function getControllerAndMethod(operationId) {
  return operationId.split('.');
}

function transformPathForKoa(inputPath) {
  const regex = /\{([^}]+)\}/g;

  return inputPath.replace(regex, (match, capture) => `:${capture}`);
}

function loadSwaggerSchemas (parameterArray) {
  return parameterArray.map((parameter) => {
    const ref = parameter['$ref'];
    if (!ref) {
      return parameter;
    }
    const [path, pointer] = ref.split('#');
    const schema = loadSwaggerRef(prepareSwaggerSchemaPathString(path));

    for (const [key, props] of Object.entries(schema)) {
      const ref = props['$ref'];
      if (ref) {
        schema[key] = loadSwaggerSchemas(Array.isArray(props) ? props : [props]);
      }
    }

    return pointer ? resolveSwaggerSchemaPointer(schema, pointer) : schema;
  })
}

function resolveSwaggerSchemaPointer (schema, pointer) {
  const parts = pointer.split('/');

  return parts.reduce((result, part) => {
    let obj = result[part];
    if (obj['$ref']) {
      [obj] = loadSwaggerSchemas([obj]);
    }
    return obj;
  }, schema);
}

function prepareValidation(parameters, requestBody) {
  const schema = {
    type: 'object',
    properties: {
      request: {
        type: 'object',
        properties: {
          body: {
            type: 'object',
            required: [],
            properties: {},
            additionalProperties: false,
          }
        },
      },
      params: {
        type: 'object',
        properties: {},
        required: [],
        additionalProperties: false,
      },
      query: {
        type: 'object',
        properties: {},
        required: [],
        additionalProperties: false,
      },
    },
  };

  function processProperty(property, target) {
    if (property.required) {
      target.required.push(property.name);
    }
    target.properties[property.name] = omit(
      property,
      ['name', 'in', 'description', 'example', 'required']
    );
  }

  if (parameters) {
    const loadedSchema = loadSwaggerSchemas(parameters);
    for (const property of loadedSchema) {
      const target = property.in === 'query' ? schema.properties.query : schema.properties.params;
      processProperty(property, target);
    }
  }

  if (requestBody) {
    const body = requestBody?.content?.['application/json']?.schema;
    if (body) {
      const [loadedSchema] = loadSwaggerSchemas([body]);
      if (loadedSchema) {
        for (const [name, property] of Object.entries(loadedSchema[0].properties)) {
          property.name = name;
          processProperty(property, schema.properties.request.properties.body);
        }
      }
    }
  }

  return (ctx, next) => {
    const isValidRequest = ajv.compile(schema);
    if (isValidRequest(ctx)) {
      return next();
    }

    throw new ValidationError({
      errors: isValidRequest.errors,
    });
  }
}

module.exports = {
  init(server, app) {
    const router = new Router();
    const spec = yaml.load(fs.readFileSync(path.join(swaggerDir, 'swagger.yaml'), 'utf8'));

    const controllers = prepareControllers(app);

    // share as static swagger doc
    server.use(serve(swaggerDir));

    for (const [path, doc] of Object.entries(spec.paths)) {
      let pathDoc = doc;
      if (doc.$ref) {
        const filePath = prepareSwaggerSchemaPathString(doc.$ref);
        pathDoc = loadSwaggerRef(filePath);
      }

      for (const [method, description] of Object.entries(pathDoc)) {
        // eslint-disable-next-line no-unused-vars
        const { operationId, parameters, requestBody } = description;

        const validation = prepareValidation(parameters, requestBody);

        const [controller, func] = getControllerAndMethod(operationId);
        const handler = controllers?.[controller]?.[func];
        if (!handler) {
          app.logger.warn(`Handler for [${method.toUpperCase()}] ${path} not found`);
          continue;
        }

        router[method](transformPathForKoa(path), validation, handler);
      }
    }

    server
      .use(router.routes())
      .use(router.allowedMethods());

    server.use(koaSwagger({
      routePrefix: '/docs',
      swaggerOptions: {
        spec,
      },
    }));
  }
};
