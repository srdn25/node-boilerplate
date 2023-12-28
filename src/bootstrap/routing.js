const fs = require('node:fs');
const path = require('node:path');
const { koaSwagger } = require('koa2-swagger-ui');
const yaml = require('js-yaml');
const Router = require('koa-router');
const serve = require('koa-static');
const controllers = require('../api/controllers');

const swaggerDir = path.join(process.cwd(), 'schemas');

function getEndpointRef(filePath) {
  const file = filePath.replace(/^\.\//, '');
  return yaml.load(fs.readFileSync(path.join(swaggerDir, file), 'utf8'));
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

module.exports = {
  async init(server, app) {
    const router = new Router();
    const spec = yaml.load(fs.readFileSync(path.join(swaggerDir, 'swagger.yaml'), 'utf8'));

    const controllers = prepareControllers(app);

    // share as static swagger doc
    server.use(serve(swaggerDir));

    for (const [path, doc] of Object.entries(spec.paths)) {
      let pathDoc = doc;
      if (doc.$ref) {
        pathDoc = getEndpointRef(doc.$ref);
      }

      for (const [method, description] of Object.entries(pathDoc)) {
        const { controller: docController } = description;
        const [controller, func] = docController.split('.');
        const handler = controllers?.[controller]?.[func];
        if (!handler) {
          app.logger.warn(`Handler for ${path} not found`);
          continue;
        }

        router[method](path, handler);
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
