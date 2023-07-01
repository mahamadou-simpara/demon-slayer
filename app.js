const path = require('path');
const express = require('express');
const db = require('./data/database')

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

app.use(express.urlencoded({extended: false}));

app.get('/', (req, res)=> {
 res.render('index');
});

app.get('/demons', (req, res) => {
 res.render('demons');
});

app.get('/heroes', (req, res) => {
 res.render('heroes');
});

app.get('/create',async  (req, res) => {
    const characterNature = await db.receiveBd().collection('nature').find().toArray();
    console.log(characterNature);
    res.render('create_character', {
        natures: characterNature
    });
});

app.post('/create', (req, res) =>{
  const data = [
    req.body.name,
    req.body.author,
    req.body.description,
    req.body.nature,
  ];

  console.log(data);
  
    res.redirect('/');
});

db.connect().then(function(){
    
    app.listen(3000, () =>{
     console.log('Server on the port 3000 !');
    });
});


