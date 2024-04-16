const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const  connectDB = require("./utils/db")


const app = express();
app.use(bodyParser.json());

connectDB();



// To Register

app.post('/register', (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }
    const id = Math.floor(Math.random() * 1000).toString();
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = { id, name, email, password: hashedPassword };
    users.push(user);
    res.json({ message: 'Registration successful', data: { ...user, password: undefined } });
});


// To Login

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(user => user.email === email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const accessToken = jwt.sign({ userId: user.id }, 'secretkey');
    res.json({ message: 'Login successful', data: { accessToken, user: { ...user, password: undefined } } });
});


// To Create Post

app.post('/posts', authenticateToken, (req, res) => {
    const { title, body } = req.body;
    const user = getUserFromToken(req);
    const id = Math.floor(Math.random() * 1000).toString();
    const post = { id, title, body, user };
    posts.push(post);
    res.json({ message: 'Post created', data: post });
});


// To Update Post

app.patch('/posts/:postId', authenticateToken, (req, res) => {
    const { title, body } = req.body;
    const postId = req.params.postId;
    const post = posts.find(post => post.id === postId);
    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }
    if (post.user.id !== getUserFromToken(req).id) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    if (title) post.title = title;
    if (body) post.body = body;
    res.json({ message: 'Post updated successfully', data: post });
});



// To Get all posts

app.get('/posts', authenticateToken, (req, res) => {
    const { limit, page, order, orderBy } = req.query;
    // Retrieve posts based on query parameters
    res.json({ message: 'All posts', data: posts });
});


// To Get a post

app.get('/posts/:postId', authenticateToken, (req, res) => {
    const postId = req.params.postId;
    const post = posts.find(post => post.id === postId);
    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }
    res.json({ message: 'Post', data: post });
});


// To Delete a post

app.delete('/posts/:postId', authenticateToken, (req, res) => {
    const postId = req.params.postId;
    const postIndex = posts.findIndex(post => post.id === postId);
    if (postIndex === -1) {
        return res.status(404).json({ message: 'Post not found' });
    }
    if (posts[postIndex].user.id !== getUserFromToken(req).id) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    posts.splice(postIndex, 1);
    res.json({ message: 'Post deleted successfully' });
});


// Middleware to authenticate token

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    jwt.verify(token, 'secretkey', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        req.user = user;
        next();
    });
}


// The Helper function to get user from token

function getUserFromToken(req) {
    const userId = req.user && req.user.userId;
    return users.find(user => user.id === userId);
}

// Server listening on port 4000

app.listen(4000, () => {
    console.log('Server is running on port 4000');
});


