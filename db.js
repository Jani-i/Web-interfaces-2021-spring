const Pool = require('pg').Pool;

const pool = new Pool ({
    user: 'postgres',
    password: 'Postgresnoot1401',
    host: 'https://web-interfaces-2021.herokuapp.com/',
    port: 5432,
    database: 'Web-interfaces-2021'
});

module.exports = pool;