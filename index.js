const express = require('express');
const app = express();
const port = 4000;
const bodyParser = require('body-parser');
//const multerUpload = multer({ dest: 'uploads'});
//const cloudinary = require('cloudinary').v2
//const { CloudinaryStorage } = require('multer-storage-cloudinary');
//const multer = require('multer');
const cors = require('cors');
const pool = require('./db');

//app.set('port', (process.env.PORT || 80));
app.use(cors());
app.use(bodyParser.json());
/*
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: '',
    format: async (req, file) => ['png', 'jpg'], // supports promises as well
    public_id: (req, file) => 'computed-filename-using-request',
  },
});
 */
//const parser = multer({ storage: storage });
/*
app.post('/upload', parser.single('image'), function (req, res) {
  console.log(req.file);
  res.status(201);
  res.json(req.file);
});
*/

app.get('/', (req, res) => {
  res.send('Hello World!')
})

//all items
app.get('/items', (req, res) => {
  pool.query(
    "SELECT id, title, description, category, location, image, price, date, delivery, seller, phone FROM items",
    [],
    (error, results) => {
      if (error) {
        throw error;
      }

      res.status(200).json(results.rows);
    })
});

//Create an item
app.post('/items/createItem', (req, res) => {
  const {title, description, category, location, image, price, date, delivery, seller, phone } = req.body;

  pool.query(
    "INSERT INTO items (title, description, category, location, image, price, date, delivery, seller, phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
    [title, description, category, location, image, price, date, delivery, seller, phone],
    (error, results) => {
      if (error) {
        throw error;
      }

      res.sendStatus(201);
      console.log(results)
    })
});

//Delete an item
app.delete('/items/deleteItem/:id', (req, res) => {
  const { id } = req.params;

  pool.query("DELETE FROM items WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }

    res.sendStatus(200);
  });
});

//Modify item
app.put('/items/modifyItem/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, category, location, image, price, date, delivery, seller, phone } = req.body;

  pool.query(
    "UPDATE items SET title = $1, description = $2, category = $3, location = $4, image = $5, price= $6, date = $7, delivery= $8, seller = $9, phone = $10 WHERE id = $11",
    [title, description, category, location, image, price, date, delivery, seller, phone, id],
    (error, results) => {
      if (error) {
        throw error;
      }

      res.sendStatus(200);
    }
  );
});

//Find items based on category
/*
app.get('/items', (req, res) => {
  res.send('All items')
})

//Find items based on date
app.get('/items', (req, res) => {
  res.send('All items')
})
*/
//Get a single item
app.get('/items/:id', (req, res) => {
  const { id } = req.params;

  pool.query(
    "SELECT * FROM items WHERE id = $1",
    [id],
    (error, results) => {
      if (error) {
        throw error;
      }

      res.status(200).json(results.rows);
    }
  );
})

//Find items based on location
/*
app.get('/items', (req, res) => {
  res.send('All items')
})
*/

//Login to users account
app.post('/login', (req, res) => {
  res.send('Logged in')
});

//Register a user
app.post('/login/register', (req, res) => {
  res.send('Registered')
});

/*
app.listen(app.get('port'), function() {
  console.log(`Example app listening at`, app.get('port'));
});
*/
app.listen(port, () => {
  console.log(`Server API listening on http://localhost:${port}\n`);
});