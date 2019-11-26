/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB;

module.exports = function (app) { 
  // To fix deprecation warnings from connection to db added {useUnifiedTopology: true }.  
  MongoClient.connect(CONNECTION_STRING, {useUnifiedTopology: true }, function(err, client){ 
    if(err)  throw err;
    console.log('Successful database connection!');
    
    // From Stackflow: The callback now returns the client, which has a function called db(dbname) that you must invoke to get the db. 
    var db = client.db('library');
    
    app.route('/api/books')
    .get(function(req, res) {
      db.collection("books").find({}).toArray(function(err, docs){
        if(err) throw err;
        res.json(docs);
      });      
    })
    
    .post(function(req, res) { 
      var title = req.body.title;
      if(!title){
        res.json({error: "Failed POST. Missing book title."});
      }else{
        db.collection("books").insertOne({title: title, comments: [], commentcount: 0}, function(err, docs) {
          if(err) throw err;
          res.json(docs.ops[0]);
        });
      }      
    })
    
    .delete(function(req, res) { 
      db.collection("books").deleteMany({}, function(err, docs) { 
        if(err) throw err;
        // Could be more precise with the return document in case of an empty database. Improve.
        res.json({message: "Complete delete successful"}); 
      });
      
    });
    
    
    app.route('/api/books/:id')
    .get(function(req, res) {
      var bookid = req.params.id;
      if(ObjectId.isValid(bookid)){
        db.collection("books").findOne({_id: ObjectId(bookid)}, function(err, docs) {
          if(err) throw err;
          if(docs) {
            res.json(docs);
          }else{
            res.json({error: "No book exists."});
          }
        });
      }else{
        res.json({error: "No book exists."});
      }      
    })
    
    .post(function(req, res) {
      var bookid = req.params.id;
      var comment = req.body.comment;
      if(ObjectId.isValid(bookid)){
        if(req.body.comment){
          db.collection("books").findOneAndUpdate({_id: ObjectId(bookid)}, {$push: {comments: comment}, $inc: {commentcount: 1}},
          {returnOriginal: false}, function(err, docs){
            if(err) throw err;
            res.json(docs.value);
          });          
        }else{
          res.json({err: "POST failed. No comment submitted."});
        }
      }else{
        res.json({error: "No book exists."});
      }      
    })
    
    .delete(function(req, res) {
      var bookid = req.params.id;
      if(ObjectId.isValid(bookid)){
        db.collection("books").deleteOne({_id: ObjectId(bookid)}, function(err, doc){
          if(err) throw err;
          if(doc.deletedCount > 0) {
            res.send("Delete successful");
          }else{
            res.send("Delete book fail.");
          }            
        });
      }else{
        res.json({error: "No book exists."});
      }      
    });
    
    //404 Not Found Middleware
    // Moved from server.js to here, otherwise issues running the tests or the routes. Info found on FCC forum, but no explanation.  
    app.use(function(req, res, next) {
    res.status(404)
      .type('text')
      .send('Not Found');
    });
  
  });  
};
