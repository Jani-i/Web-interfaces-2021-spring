const express = require('express');
const app = express();
//const port = 4000;
const bodyParser = require('body-parser');
//const multerUpload = multer({ dest: 'uploads'});
//const multer = require('multer');
const cors = require('cors');
const pool = require('./db');
const bcrypt = require('bcryptjs');
const users = require('./services/users');


app.set('port', (process.env.PORT || 80));
app.use(cors());
app.use(bodyParser.json());



const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;

passport.use(new BasicStrategy(
  function(username, password, done) {

    const user = users.getUserByName(username);
    if(user == undefined) {
      // Username not found
      console.log("HTTP Basic username not found");
      return done(null, false, { message: "HTTP Basic username not found" });
    }

    /* Verify password match */
    if(bcrypt.compareSync(password, user.password) == false) {
      // Password does not match
      console.log("HTTP Basic password not matching username");
      return done(null, false, { message: "HTTP Basic password not found" });
    }
    return done(null, user);
  }
));

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
app.post('/items/createItem', passport.authenticate('jwt', { session: false }), (req, res) => {
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
app.delete('/items/deleteItem/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { id } = req.params;

  pool.query("DELETE FROM items WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }

    res.sendStatus(200);
  });
});

//Modify item
app.put('/items/modifyItem/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
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
app.get('/items/category/:category', (req, res) => {
  const {category} = req.params
  
  pool.query(
    "SELECT * FROM items WHERE category = $1",
    [category],
    (error, results) => {
      if (error) {
        throw error;
      }

      res.status(200).json(results.rows);
    }
  );
})

//Find items based on date
app.get('/items/date/:date', (req, res) => {
  const {date} = req.params

  pool.query(
    "SELECT * FROM items WHERE date = $1",
    [date],
    (error, results) => {
      if (error) {
        throw error;
      }

      res.status(200).json(results.rows);
    }
  );
})

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
app.get('/items/location/:location', (req, res) => {
  const { location } = req.params;
  
  pool.query(
    "SELECT * FROM items WHERE location = $1",
    [location],
    (error, results) => {
      if (error) {
        throw error;
      }

      res.status(200).json(results.rows);
    }
  );
})




app.get('/apiKeyGenerate/:userId', (req, res) => {
  const userId = req.params.userId;
  let apiKey = users.getApiKey(userId);
  if(apiKey === false) // user not found
  {
    res.sendStatus(400);
  }
  if(apiKey === null)
  {
    apiKey = users.resetApiKey(userId)
  }
  res.json({
    apiKey
  })
});

function checkForApiKey(req, res, next)
{
  const receivedKey = req.get('X-Api-Key');
  if(receivedKey === undefined) {
    return res.status(400).json({ reason: "X-Api-Key header missing"});
  }

  const user = users.getUserWithApiKey(receivedKey);
  if(user === undefined) {
    return res.status(400).json({ reason: "Incorrect api key"});
  }

  req.user = user;

  // pass the control to the next handler in line
  next();
}

app.get('/apiKeyProtectedResource', checkForApiKey, (req, res) => {
  res.json({
    yourResource: "foo"
  })
});






//Login a user
app.get('/login',
        passport.authenticate('basic', { session: false }),
        (req, res) => {
  res.json({
    yourProtectedResource: "profit"
  });
});

//Register a user
app.post('/login/register',
        (req, res) => {

  if('username' in req.body == false ) {
    res.status(400);
    res.json({status: "Missing username from body"})
    return;
  }
  if('password' in req.body == false ) {
    res.status(400);
    res.json({status: "Missing password from body"})
    return;
  }
  if('email' in req.body == false ) {
    res.status(400);
    res.json({status: "Missing email from body"})
    return;
  }

  const hashedPassword = bcrypt.hashSync(req.body.password, 6);
  console.log(hashedPassword);
  users.addUser(req.body.username, req.body.email, hashedPassword);

  res.status(201).json({ status: "created" });
});




const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy,
      ExtractJwt = require('passport-jwt').ExtractJwt;
let jwtSecretKey = null;
if(process.env.JWTKEY === undefined) {
  jwtSecretKey = require('./jwt-key.json').secret;
} else {
  jwtSecretKey = process.env.JWTKEY;
}


let options = {}


options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();

/* secret signing key. */
options.secretOrKey = jwtSecretKey;

passport.use(new JwtStrategy(options, function(jwt_payload, done) {
  console.log("Processing JWT payload for token content:");
  console.log(jwt_payload);


  const now = Date.now() / 1000;
  if(jwt_payload.exp > now) {
    done(null, jwt_payload.user);
  }
  else {// expired
    done(null, false);
  }
}));

//access protected resource
app.get('/jwtProtectedResource',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    console.log("jwt");
    res.json(
      {
        status: "Successfully accessed protected resource with JWT",
        user: req.user
      }
    );
  }
);

//Get token
app.get('/loginForJWT',
  passport.authenticate('basic', { session: false }),
  (req, res) => {
    const body = {
      id: req.user.id,
      email : req.user.email
    };

    const payload = {
      user : body
    };

    const options = {
      expiresIn: '1d'
    }

    const token = jwt.sign(payload, jwtSecretKey, options);

    return res.json({ token });
})






app.listen(app.get('port'), function() {
  console.log(`Example app listening at`, app.get('port'));
});
/*
app.listen(port, () => {
  console.log(`Server API listening on http://localhost:${port}\n`);
});
*/