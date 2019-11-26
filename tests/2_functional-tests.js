/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);
var id, title;

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function(done){
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({title: 'POST Test Book Title'})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.title, 'POST Test Book Title');
            assert.property(res.body, '_id');
            assert.property(res.body, 'comments');
            assert.property(res.body, 'commentcount');
            assert.equal(res.body.commentcount, 0);
            assert.isArray(res.body.comments);
            id = res.body._id;
            title = res.body.title;
            done();
          });
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, "Failed POST. Missing book title.");
            done();
          });
      });
      
    });


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
        chai.request(server)
          .get('/api/books')
          .query({})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], '_id');
            assert.property(res.body[0], 'title');
            assert.property(res.body[0], 'commentcount')
            done();
          });
      });      
      
    });

    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
          .get('/api/books/fakeID')
          .query({})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, "No book exists.");
            done();
          });
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        chai.request(server)
          .get('/api/books/'+id)
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.property(res.body, 'title'); 
            assert.property(res.body, 'comments');
            assert.property(res.body, 'commentcount');
            assert.isArray(res.body.comments);
            done();
          });        
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        chai.request(server)
        .post('/api/books/'+id)
        .send({comment: "POST Chai test on add comment using bookId"})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body._id, id);
          assert.equal(res.body.title, title);
          assert.equal(res.body.comments[0], "POST Chai test on add comment using bookId");
          assert.equal(res.body.commentcount, 1);
          done();
        });
      }); 
      
      test('Test POST /api/books/[id] with comment and no valid id', function(done) {
        chai.request(server)
        .post('/api/books/fakeID')
        .send({comment: "POST Chai test on add comment with invalid bookId"})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "No book exists.");
          done();
        });
      });
      
    });
    
    suite('DELETE /api/books => delete all books/book object', function(){
            
      test('Test DELETE /api/books/[id] => delete book with valid id', function(done){
        chai.request(server)
        .delete('/api/books/'+id)
        .end(function(err, res){ 
          assert.equal(res.status, 200);
          assert.equal(res.text, "Delete successful");
          done();
        });
      });
      
      test('Test DELETE /api/books/[id] => delete book with invalid id', function(done) {
        chai.request(server)
        .delete('/api/books/fakeID')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "No book exists.");
          done();
        });
      });
      
      test('Test DELETE /api/books => delete all books', function(done) {
        chai.request(server)
        .delete('/api/books')
        .end(function(err, res){ 
          assert.equal(res.status, 200);
          assert.equal(res.body.message,  "Complete delete successful");
          done();
        });
      });
      
    });
  });

});
