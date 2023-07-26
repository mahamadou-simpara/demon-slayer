const path = require('path');
const express = require('express');
const db = require('./data/database');
const multer = require('multer');
const { ObjectId } = require('mongodb');
const { log } = require('util');
const bcrypt = require('bcrypt');
const session = require('express-session');
const mongoDBStore = require('connect-mongodb-session')

 


const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

app.use(express.json());

//
const Sessionstore = mongoDBStore(session);

const store = new Sessionstore({
 uri: 'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.9.1',
 databaseName: 'demon_slayer_CRUD',
 collection: 'sessions',
})

//

app.use(session({
  secret: 'Secret database',
  saveUninitialized: false,
  resave: false,
  store: store
}))



const objectId = new ObjectId();
//
const storagehandler = multer.diskStorage({
  destination: function(res, file, cb){
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '_' + file.originalname);// this method will store the file with its real name and extension, The Date.now() is there just to help us assigning new value unique
  }
});

const upload = multer({storage: storagehandler});
app.use('/uploads', express.static('uploads'));

app.use(express.urlencoded({extended: false}));

app.get('/', (req, res)=> {
 res.render('index');
});

app.get('/demons',async (req, res) => {
  const demons = await db.receiveBd().collection('characters').find({nature: 'Demon'}).toArray();
  // console.log(demons);
 res.render('demons', {demons: demons});
});

app.get('/heroes',async (req, res) => {
  const heroes = await db.receiveBd().collection('characters').find({nature: 'Hero'}).toArray();
  // console.log(heroes);
 res.render('heroes', {heroes: heroes});
});

app.get('/create',async  (req, res) => {
    const characterNature = await db.receiveBd().collection('nature').find().toArray();
    // console.log(characterNature);
    res.render('create_character', {
        natures: characterNature
    });
});

app.post('/create', upload.single('image'),async (req, res) =>{
  const data = [
    req.file,
    req.body.name,
    req.body.author,
    req.body.description,
    req.body.nature,
  ];
  console.log(data);
  const result = await db.receiveBd().collection('characters').insertOne({
    img: req.file.path, name: req.body.name, author: req.body.author, desc: req.body.description, nature: req.body.nature, date: new Date()
  });

  // console.log(result);
    res.redirect('/');
});

app.get('/view/:id',async (req, res) =>{
  const id = new ObjectId(req.params.id);
  const data = await db.receiveBd().collection('characters').findOne({_id: id});
  // const comments = await db.receiveBd().collection('comments').find().toArray();
  // console.log(data);
  res.render('view_character', {
    data: data, comments: null
  })
});

app.post('/delete',async (req, res) =>{
  const deleteId = new ObjectId(req.body.delete);
 

   await db.receiveBd().collection('characters').deleteOne({_id: deleteId})
   res.redirect('/demons');
});

app.post('/deletehero',async (req, res) =>{
  const deleteId = new ObjectId(req.body.delete);
 
   await db.receiveBd().collection('characters').deleteOne({_id: deleteId})
   res.redirect('/heroes');
});

app.get('/update/:id',async (req, res) =>{
  const id = new ObjectId(req.params.id);
  const data = await db.receiveBd().collection('characters').findOne({_id: id});

 res.render('update', {data: data});
});

app.post('/update/:id', upload.single('image'),async (req, res) =>{
  const updateID = new ObjectId(req.params.id);

  // console.log(req.file.path);
 
  const result = await db.receiveBd().collection('characters').updateOne({_id: updateID}, {$set: { img: req.file.path, name: req.body.name, author: req.body.author, desc: req.body.description }})
  // console.log(result);
   res.redirect('/');
});

app.get('/view/:id/comments',async (req, res) => {
  const id = new ObjectId(req.params.id);
  const commentId = req.params.id
  console.log(id);
  const comments = await db.receiveBd().collection('comments').find({id: commentId}).toArray();
  // const data = await db.receiveBd().collection('characters').findOne({_id: id});
  // console.log(result);
  res.json(comments);
});



app.post('/view/:id/comments',async (req, res) => {
  // const id = new ObjectId(req.params.id);
  const id = req.params.id;
  console.log(req.body);


await db.receiveBd().collection('comments').insertOne({
  name: req.body.name, comment: req.body.comment, id: req.params.id
  });
  // console.log(result);
res.redirect(`/view/${id}`);
})



///// Sign-in functionality 


app.get('/sign-up', function(req, res){
 
   res.render('sign-up');
});
app.get('/sign-in', function(req, res){
 
  res.render('sign-in');
});


app.post('/sign-up',upload.single('image'), async function(req, res){

  
  const userData = req.body;
  const userPicture = req.file;
  const enteredEmail = userData.email;
  const enteredconfirmEmail = userData['confirm-email'];
  const enteredpassword = userData.password;

  if(!userPicture ||
     !enteredEmail ||
     !enteredconfirmEmail ||
     enteredpassword.trim().length < 5 ||
     enteredEmail !== enteredconfirmEmail
    ){
      console.log('Incorrect Input !');
      return res.redirect('/sign-up');
    }
    const database = await db.receiveBd().collection('users').findOne({email: enteredEmail});
   
   
    if(database){
      console.log("Existing Email");
      return res.redirect('/sign-up');
    }


    const passwordHashed = await bcrypt.hash(enteredpassword, 12);

  const user = {
    email: enteredEmail,
    confirmEmail: enteredconfirmEmail,
    password: passwordHashed,
    userImg: userPicture.path,
    date: new Date()
  }

  console.log(user);

  const result = await db.receiveBd().collection('users').insertOne(user);

 
  res.redirect('/sign-in');
})
app.post('/sign-in',upload.single('image'),async function(req, res){

  const userData = req.body;
  const enteredEmail = userData.email;
  const enteredPassword = userData.password;
  

  const database = await db.receiveBd().collection('users').findOne({email: enteredEmail});
  if(!database){
    console.log('Email not found, please Sign-up');
    return res.redirect('/sign-in')
  }

  console.log(database);

  const passwordCheck = await bcrypt.compare(enteredPassword, database.enteredpassword);

  if(!passwordCheck){
    console.log('Incorrect password !');

    return res.redirect('/sign-in')

  }



 res.redirect('/');
})



db.connect().then(function(){
    
    app.listen(3000, () =>{
     console.log('Server on the port 3000 !');
    });
});


