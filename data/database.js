const mongodb = require('mongodb');

let database;
async function connectToDB (){
    const connect = await mongodb.MongoClient.connect('mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.9.1');
    database = connect.db('demon_slayer_CRUD')
}

function obtainBd (){
 if(!database){
  throw {message: 'Connection to database not establised'}
 }

 return database;
}
module.exports = {
 connect: connectToDB,
 receiveBd : obtainBd
}