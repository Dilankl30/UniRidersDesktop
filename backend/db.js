const sql = require('mssql');

const config = {
  user: 'sa',
  password: 'sql123', // o la que uses
  server: 'localhost\\SQLDEVELOPER', // o '.\\SQLDEVELOPER'
  database: 'UniRiders',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};


const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('✅ Conectado a SQL Server');
    return pool;
  })
  .catch(err => console.log('❌ Error al conectar con SQL Server:', err));

module.exports = {
  sql, poolPromise
};