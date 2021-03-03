const Pool = require('pg').Pool;
//require("dotenv").config();
/*
const devConfig = {
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    port: process.env.PG_PORT,
};


const proConfig = process.env.DATABASE_URL; //heroku addons

const pool = new Pool({
  connectionString:
    process.env.NODE_ENV === proConfig 
})
*/




const pool = new Pool({
  user: "cijjsoxqkvzcam",
  password: "69ccede74963990a7710f70e2ee872777d816b2394d16c62558842e4e8fcb649",
  host: "ec2-54-74-156-137.eu-west-1.compute.amazonaws.com",
  database: "d534epu70a8o16",
  port: 5432,
})

module.exports = pool;