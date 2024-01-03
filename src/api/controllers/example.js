// eslint-disable-next-line no-unused-vars
function getExample(app) {
  return (ctx) => {
    const { id } = ctx.params;

    ctx.body = {
      id,
      name: 'Example model',
      status: 'active',
    };
  };
}

// eslint-disable-next-line no-unused-vars
function createExample(app) {
  return (ctx) => {
    ctx.body = ctx.request.body
  };
}

// eslint-disable-next-line no-unused-vars
function deleteExample(app) {
  return (ctx) => {
    const { id } = ctx.params;

    ctx.body = {
      id,
      method: ctx.request.method,
    }
  };
}

// eslint-disable-next-line no-unused-vars
function updateExample(app) {
  return (ctx) => {
    const { id } = ctx.params;

    ctx.body = {
      id,
      method: ctx.request.method,
      body: ctx.request.body,
    }
  };
}

// eslint-disable-next-line no-unused-vars
function partialUpdateExample(app) {
  return (ctx) => {
    const { id } = ctx.params;

    ctx.body = {
      id,
      method: ctx.request.method,
      body: ctx.request.body,
    }
  };
}

// eslint-disable-next-line no-unused-vars
function getAllExamples(app) {
  return (ctx) => {
    const { page, perPage, filter } = ctx.query;

    ctx.body = [{
      page,
      method: ctx.request.method,
      perPage,
      filter,
    }];
  };
}

module.exports = {
  getExample,
  getAllExamples,
  createExample,
  deleteExample,
  updateExample,
  partialUpdateExample,
};
