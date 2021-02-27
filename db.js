const Pool = require('pg').Pool;

const pool = new Pool ({
    user: 'postgres',
    password: 'Postgresnoot1401',
    host: 'localhost',
    port: 5432,
    database: 'Web-interfaces-2021'
});

module.exports = pool;