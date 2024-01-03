const request = require('supertest');

describe('[GET] /api/ping Ping API', () => {
  it('Should return PONG in response', async () => {
    const response = await request(global.server)
      .get('/api/ping')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(typeof response.body).toBe('object');
    expect(response.body).toEqual({
      message: 'Pong',
    });
  });
});