import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mysql, { RowDataPacket } from 'mysql2';
import dotenv from 'dotenv';

dotenv.config()

const app = express()
const port = 3000

app.use(bodyParser.json())

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

connection.connect(err => {
    if (err) throw err
    console.log('Connected to database')
});

// User registration
app.post('/register', (req: Request, res: Response) => {
    const { username, password } = req.body
    const hashedPassword = bcrypt.hashSync(password, 8)
  
    connection.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
      if (err) return res.status(500).send('Error registering user')
      res.status(200).send('User registered')
    });
});

// User login
app.post('/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
  
    connection.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
      if (err) return res.status(500).send('Error on the server.')
      
      // Cast results to RowDataPacket[]
      const users = results as RowDataPacket[]
      
      if (users.length === 0) return res.status(404).send('No user found.')
  
      const user = users[0]
  
      const passwordIsValid = bcrypt.compareSync(password, user.password)
      if (!passwordIsValid) return res.status(401).send('Password is incorrect.')
  
      const token = jwt.sign({ id: user.id }, 'supersecret', { expiresIn: 86400 })
  
      res.status(200).send({ auth: true, token })
    });
});

// Create a new post
app.post('/posts', (req: Request, res: Response) => {
    const token = req.headers['x-access-token']
    if (!token) return res.status(401).send('No token provided.')
  
    jwt.verify(token as string, 'supersecret', (err: any, decoded: any) => {
      if (err) return res.status(500).send('Failed to authenticate token.')
  
      const { content } = req.body
      connection.query('INSERT INTO posts (user_id, content) VALUES (?, ?)', [decoded.id, content], (err) => {
        if (err) return res.status(500).send('Error creating post')
        res.status(200).send('Post created')
      });
    });
});

// List all posts
app.get('/posts', (req: Request, res: Response) => {
    connection.query('SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id', (err, results) => {
      if (err) return res.status(500).send('Error retrieving posts')
      res.status(200).send(results)
    });
});

// List posts by user
app.get('/posts/user/:id', (req: Request, res: Response) => {
    const userId = req.params.id
    connection.query('SELECT * FROM posts WHERE user_id = ?', [userId], (err, results) => {
      if (err) return res.status(500).send('Error retrieving posts')
      res.status(200).send(results)
    });
});

// Like/Dislike a post
app.post('/posts/:id/interact', (req: Request, res: Response) => {
    const postId = req.params.id
    const { type } = req.body
  
    if (type !== 'like' && type !== 'dislike') return res.status(400).send('Invalid interaction type');
  
    connection.query('INSERT INTO post_interactions (post_id, type) VALUES (?, ?)', [postId, type], (err) => {
      if (err) return res.status(500).send('Error interacting with post')
      res.status(200).send('Interaction recorded');
    });
});

// Get likes and dislikes for a post
app.get('/posts/:id/interactions', (req: Request, res: Response) => {
    const postId = req.params.id
  
    connection.query('SELECT type, COUNT(*) as count FROM post_interactions WHERE post_id = ? GROUP BY type', [postId], (err, results) => {
      if (err) return res.status(500).send('Error retrieving interactions')
      res.status(200).send(results)
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
});