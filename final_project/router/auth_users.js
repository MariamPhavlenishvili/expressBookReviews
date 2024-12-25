const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    {"username": "user1", "password": "pwd123"}
];

const isValid = (username)=>{ 
    const usersWithUsername = users.filter((user) => {
        return user.username === username
    })

    if (usersWithUsername.length === 0) {
        return false
    }

    return true
}

const authenticatedUser = (username,password)=>{ 
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username
    const password = req.body.password

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

     if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 3600 });

        req.session.authorization = {
            accessToken: accessToken,
            username: username
        }
        return res.status(200).send("User successfully logged in");
    } 
    
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
    
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn
    const review = req.body.review
    const username = req.session?.authorization?.username

    if (!username) {
        return res.status(401).json({ message: 'User not logged in.' })
    }

    if (!review) {
        return res.status(400).json({ message: 'Review content is required.' })
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: 'Book not found.' })
    }

    if (!books[isbn].review) {
        books[isbn].review = {}
    }

    if (books[isbn].review[username]) {
        books[isbn].review[username] = review;
        return res.status(200).send('Review updated successfully.')
    }

    books[isbn].review[username] = review;
    return res.status(201).send('Review added successfully.')
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn
    const username = req.session?.authorization.username

    if (!username) {
        return res.status(401).json({ message: 'User not logged in.' })
    }

     if (!books[isbn]) {
        return res.status(404).json({ message: 'Book not found.' })
    }

    if (books[isbn].review?.[username]) {
        delete books[isbn].review[username]
        return res.status(200).send( 'Review deleted successfully')
    }

    return res.status(404).json({ message: 'Review not found for this user.' })
})


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
