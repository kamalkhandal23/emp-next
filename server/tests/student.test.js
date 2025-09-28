// student.test.js
const request = require('supertest');
const app = require('../index'); // Main express app

describe('Student Endpoints', () => {
  it('should enroll a student', async () => {
    const res = await request(app).post('/api/student/enroll').send({name: 'Test'});
    expect(res.statusCode).toEqual(201);
  });
});
