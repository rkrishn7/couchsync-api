import settings from '@app/lib/settings';
import mysql from 'mysql';

const connection = mysql.createConnection({
  user: settings.DB_USER,
  password: settings.DB_PASSWORD,
});

const main = () => {
  connection.connect();
  connection.query(`CREATE DATABASE ${settings.DB_NAME}`, (err) => {
    if (err) throw err;
    console.log(`Database ${settings.DB_NAME} created succesfully!`);
  });
  connection.end();
};

main();
