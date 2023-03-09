const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
   test('Create an issue with every field: POST request to /api/issues/{project}', () => {
     const baseIssue = {'issue_title': 'Test Issue1', "issue_text": "The first test issue",
                        "created_by": "SomeoneHandsome",
                  'assigned_to': "Someone else", "status_text": "In testing"};
        chai.request(server).post('/api/issues/testproject').send(baseIssue).end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.project_name, 'testproject');
          assert.equal(res.body.issue_text, "The first test issue");
        });
    });
    test('Create an issue with only required fields: POST request to /api/issues/{project}', () => {
      const minIssue = {'issue_title': 'Test Issue2', "issue_text": "The second test issue",
                        "created_by": "SomeoneEvenMoreHandsome"};
        chai.request(server).post('/api/issues/testproject').send(minIssue).end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.project_name, 'testproject');
          assert.equal(res.body.issue_text, "The second test issue");
          assert.equal(res.body.created_by, 'SomeoneEvenMoreHandsome');
          assert.isDefined(res.body._id);
          assert.isDefined(res.body.created_on);
        });
    });
    test('Create an issue with missing required fields: POST request to /api/issues/{project}', () => {
        chai.request(server).post('/api/issues/whatever').send({'issue_title': 'Test Issue3'}).end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "required field(s) missing");
        });
    });
    test('View issues on a project: GET request to /api/issues/{project}', () => {
        chai.request(server).get('/api/issues/testproject').end((err, res) => {
          assert.equal(res.status, 200);
          assert.typeOf(res.body, 'array');
        });
    });
    test('View issues on a project with one filter: GET request to /api/issues/{project}', () => {
        chai.request(server).get('/api/issues/testproject?created_by=SomeoneHandsome').end((err, res) => {
          assert.equal(res.status, 200);
          assert.typeOf(res.body, 'array');
          assert.equal(res.body[0].issue_text, 'The first test issue');
        });
    });
    test('View issues on a project with multiple filters: GET request to /api/issues/{project}', () => {
        chai.request(server).get('/api/issues/testproject?created_by=SomeoneHandsome&open=true')
      .end((err, res) => {
          assert.equal(res.status, 200);
          assert.typeOf(res.body, 'array');
          assert.equal(res.body[0].issue_text, 'The first test issue');
        });
    });
    test('Update one field on an issue: PUT request to /api/issues/{project}', () => {
        chai.request(server).put('/api/issues/apitest').send({_id: '6408fadca35c1a524f02cb28',
          assigned_to: 'reAssigned'}).end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, '{"result":"successfully updated","_id":"6408fadca35c1a524f02cb28"}');
        });
    });

    test('Update multiple fields on an issue: PUT request to /api/issues/{project}', () => {
        chai.request(server).put('/api/issues/apitest').send({_id: '6408fadca35c1a524f02cb28',
          assigned_to: 'reAssigned', status_text: 'being tested'}).end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, '{"result":"successfully updated","_id":"6408fadca35c1a524f02cb28"}');
      });
    });
    test('Update an issue with missing _id: PUT request to /api/issues/{project}', () => {
        chai.request(server).put('/api/issues/apitest').send({assigned_to: 'reAssigned', status_text: 'being tested'}).end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, '{"error":"missing _id"}');
      });
    });
    test('Update an issue with no fields to update: PUT request to /api/issues/{project}', () => {
        chai.request(server).put('/api/issues/apitest').send({_id: '6408fadca35c1a524f02cb28'})
      .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, '{"error":"no update field(s) sent","_id":"6408fadca35c1a524f02cb28"}');
        });
    });
    test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', () => {
        chai.request(server).put('/api/issues/apitest').send({_id: 'kaplow!'}).end((err, res) =>{
          assert.equal(res.status, 200);
          assert.equal(res.text, '{"error":"no update field(s) sent","_id":"kaplow!"}');
        });
      });
    test('Delete an issue: DELETE request to /api/issues/{project}', () => {
        chai.request(server).delete('/api/issues/apitest').send({_id: 'kaplow!'}).end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
        });
    });
    test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', () => {
        chai.request(server).delete('/api/issues/apitest').send({_id: 'kaplow!'}).end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, '{"error":"could not delete","_id":"kaplow!"}');
        });
    });
    test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', () => {
        chai.request(server).delete('/api/issues/apitest').send({"created_by": "SomeoneHandsome"})
      .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, '{"error":"missing _id"}');
        });
    });
});
