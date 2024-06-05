import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.json());

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});