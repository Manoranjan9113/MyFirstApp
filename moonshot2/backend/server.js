const express = require('express');
// const mongoose = require('mongoose');
// const UserSignInModel = require('./models/SignIn');
const bcrypt = require('bcrypt');
const cors = require('cors');
// require('./db/dbConnection');
const app = express();
const mysql = require('mysql');
const { generateAuthToken, validateAuthToken } = require('./middleware');
const dotenv = require('dotenv'); // Import dotenv

app.use(express.json());
app.use(cors());
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database');
});

app.post('/createSign', async(req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);       
  const query = `INSERT INTO users (username, password) VALUES ('${email}', '${hashedPassword}')`;
  db.query(query, (err, result) => {
      if (err) {
          console.error('Error executing query:', err);
          res.status(500).send({ message: 'Error creating user' });
          return;
      }
      res.send({ message: 'User Created Successfully'});
  });
});

app.post('/checkUser', (req, res) => {
  const { username, password } = req.body;

  const query = `SELECT * FROM users WHERE username = '${username}'`;
  // res.send(query)
  db.query(query, (err, result) => {
      if (err) {
          console.error('Error executing query:', err);
          res.status(500).send({ message: 'An error occurred while checking the credentials' });
          return;
      }
  
      // Check if the result is empty or has a length of 0
      if (!result || result.length === 0) {
          res.status(401).send({ message: 'Credentials Are Wrong' });
          return;
      }

      bcrypt.compare(password, result[0].password, (err, isPasswordValid) => {
          if (err) {
              console.error('Error comparing passwords:', err);
              res.status(500).send({ message: 'An error occurred while checking the credentials' });
              return;
          }

          if (!isPasswordValid) {
              res.status(401).send({ message: 'Credentials Are Wrong' });
              return;
          }

          const token = generateAuthToken(username);
          res.send({ message: 'User Checked Successfully', token: token });
      });
  });
});

app.get('/getdrdwnItems', (req, res) => {
  const query = 'SELECT DISTINCT Gender, Age FROM employee_list';
  db.query(query, (err, result) => {
      if (err) {
          console.error('Error executing query:', err);
          res.status(500).send({ message: 'An error occurred while fetching dropdown items' });
          return;
      }
      res.send(result);
  });
});

// app.get('/getChartData', (req, res) => {
//   const query = 'SELECT *FROM employee_list';
//   db.query(query, (err, result) => {
//       if (err) {
//           console.error('Error executing query:', err);
//           res.status(500).send({ message: 'An error occurred while fetching dropdown items' });
//           return;
//       }
//       res.send(result);
//   });
// });
app.get("/verifyToken", validateAuthToken(), (req, res) => {
  res.status(200).send({ message: "Token is valid" });
});


app.get("/getChartData", validateAuthToken(), (req, res) => {
  const { gender, age, startDate, endDate } = req.query;

  let query = "SELECT * FROM employee_list WHERE 1=1"; // Default query to fetch all data

  if (gender) query += ` AND Gender = '${gender}'`;
  if (age) query += ` AND Age = '${age}'`;
  if (startDate) query += ` AND STR_TO_DATE(Day, '%d/%m/%Y') >= '${startDate}'`;
  if (endDate) query += ` AND STR_TO_DATE(Day, '%d/%m/%Y') <= '${endDate}'`;

  db.query(query, (err, result) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).send("Error fetching chart data");
    } else {
      res.json(result);
    }
  });
});


// Start the server
app.listen(3001, () => {
  console.log('Server started on port 3001');
});
