const express = require('express');
const app = express();
//const port = 4000;
const bodyParser = require('body-parser');
//const multerUpload = multer({ dest: 'uploads'});
const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

app.set('port', (process.env.PORT || 80));


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: '',
    format: async (req, file) => ['png', 'jpg'], // supports promises as well
    public_id: (req, file) => 'computed-filename-using-request',
  },
});
 
const parser = multer({ storage: storage });

app.post('/upload', parser.single('image'), function (req, res) {
  console.log(req.file);
  res.status(201);
  res.json(req.file);
});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

//all items
app.get('/items', (req, res) => {
  res.send('All items')
})

//Create an item
app.post('/items/createItem', (req, res) => {
  res.send('item created')
})

//Delete an item
app.delete('/items/deleteItem', (req, res) => {
  res.send('Item deleted')
})

//Modify item
app.put('/items/modifyItem', (req, res) => {
  res.send('Item modified')
})

//Find items based on category
/*app.get('/items', (req, res) => {
  res.send('All items')
})

//Find items based on date
app.get('/items', (req, res) => {
  res.send('All items')
})

//Get a single item
app.get('/items', (req, res) => {
  res.send('All items')
})

//Find items based on location
app.get('/items', (req, res) => {
  res.send('All items')
})*/

//Login to users account
app.post('/login', (req, res) => {
  res.send('Logged in')
})

//Register a user
app.post('/login/register', (req, res) => {
  res.send('Registered')
})


app.listen(app.get('port'), function() {
  console.log(`Example app listening at`, app.get('port'));
})