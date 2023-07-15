const path = require('path');
const express = require('express');
const db = require('./data/database');
const multer = require('multer');
const { ObjectId } = require('mongodb');
const { isNull } = require('util');


const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.json);


const objectId = new ObjectId();
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
  console.log(id);
  const comments = await db.receiveBd().collection('comments').find().toArray();
  const data = await db.receiveBd().collection('characters').findOne({_id: id});
  // console.log(result);
 res.join({data: data, comments: comments});
})

app.post('/view/:id/comments',async (req, res) => {
  // const id = new ObjectId(req.params.id);
  const id = req.params.id;

  
  await db.receiveBd().collection('comments').insertOne({
    title: req.body.name, comment: req.body.comment, id: req.body.id
  });
  // console.log(result);
 res.redirect(`/view/${id}`);
})


db.connect().then(function(){
    
    app.listen(3000, () =>{
     console.log('Server on the port 3000 !');
    });
});


