const { randomUUID, randomInt } = require('node:crypto');
const request = require('supertest');

describe('[GET] /api/example Example API', () => {
  it('/api/example/{id} Should return id from request', async () => {
    const id = randomUUID();

    const response = await request(global.server)
      .get(`/api/example/${id}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(typeof response.body).toBe('object');
    expect(response.body).toEqual({
      id,
      name: response.body.name,
      status: response.body.status,
    });
  });

  it('/api/example Should return the filter, page, perPage from request', async () => {
    const page = randomInt(150);
    const perPage = randomInt(150);
    const filter = 'status=active';

    const queryParams = new URLSearchParams({
      page,
      perPage,
      filter,
    });

    const response = await request(global.server)
      .get(`/api/example?${queryParams}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(typeof response.body[0]).toBe('object');
    expect(response.body.length).toBe(1);
    expect(response.body).toEqual([{
      page,
      perPage,
      filter,
      method: 'GET'
    }]);
  });
});

describe('[POST] /api/example Example API', () => {
  it('Should return body from request', async () => {
    const id = randomUUID();

    const requestBody = {
      name: id,
      status: 'activeTest',
    };

    const response = await request(global.server)
      .post('/api/example')
      .send(requestBody)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(typeof response.body).toBe('object');
    expect(response.body).toEqual(requestBody);
  });
});

describe('[DELETE] /api/example/{id} Example API', () => {
  it('Should return ID from request and request method', async () => {
    const id = randomUUID();

    const response = await request(global.server)
      .delete(`/api/example/${id}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(typeof response.body).toBe('object');
    expect(response.body).toEqual({
      id,
      method: 'DELETE',
    });
  });
});

describe('[PUT] /api/example/{id} Example API', () => {
  it('Should return ID, body from request and request method', async () => {
    const id = randomUUID();
    const requestId = randomUUID();

    const requestBody = {
      name: requestId,
      status: 'disabled test',
    };

    const response = await request(global.server)
      .put(`/api/example/${id}`)
      .send(requestBody)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(typeof response.body).toBe('object');
    expect(response.body).toEqual({
      id,
      method: 'PUT',
      body: requestBody,
    });
  });
});

describe('[PATCH] /api/example/{id} Example API', () => {
  it('Should return ID, body from request and request method', async () => {
    const id = randomUUID();
    const requestId = randomUUID();

    const requestBody = {
      name: requestId,
      status: 'disabled test',
    };

    const response = await request(global.server)
      .patch(`/api/example/${id}`)
      .send(requestBody)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(typeof response.body).toBe('object');
    expect(response.body).toEqual({
      id,
      method: 'PATCH',
      body: requestBody,
    });
  });
});
