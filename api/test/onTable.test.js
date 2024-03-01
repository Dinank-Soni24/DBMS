const { tableList } = require('../controller/onTable');
// const { connectionUrl } = require('../helper/connection');

// Test for MySQL
test('should return list of tables for MySQL when connection is successful', async () => {
  const req = {
    query: { id: '9f48c5fa-070c-4dba-801e-43a31028fce3' },
  };
  const res = {
    status: jest.fn(() => res),
    json: jest.fn(),
  };

  await tableList(req, res);
  
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({
    table: expect.any(Array),
  });
});

// Test for PostgreSQL
test('should return list of tables for PostgreSQL when connection is successful', async () => {
  const req = {
    query: { id: '9a0c4708-b011-4e07-9566-9044f1a4bceb', schema: null },
  };
  const res = {
    status: jest.fn(() => res),
    json: jest.fn(),
  };

  await tableList(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({
    table: expect.any(Array),
  });
});

// Mock the database connection with an error
test('should return error when connection is not successful', async () => {
  // Mock the request and response objects
  const req = {
    query: { id: '9f48c5fa', schema: 'public' },
  };
  const res = {
    status: jest.fn(() => res),
    json: jest.fn(),
  };

  await tableList(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({
    message: 'Error connecting to database',
    error: expect.any(String),
  });
});
