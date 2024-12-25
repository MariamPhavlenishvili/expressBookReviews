const express = require('express');
let BooksApi = require("./booksdb.js");
// let books = require("./booksdb.js");
let axios = require('axios');
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (!isValid(username)) {
            users.push({ "username": username, "password": password})
            return res.status(200).json({message: "User succesfully registered"})
        }

        return res.status(404).json({message: "User already exists!"});
    }

    return res.status(404).json({message: "username or password is not provided!"});
});

// Get the book list available in the shop
public_users.get('/',async function (req, res) {
    BooksApi.then((books) => {
        return res.status(200).json(books); 
    })
    // return res.status(200).json(books); 
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
  const isbn = Number(req.params.isbn)

  BooksApi.then((books) => {
    if (books[isbn]) {
        return res.status(200).send(books[isbn])
      }
      return res.status(404).json({message: "Book not found with the given ISBN."});
  })

//   if (books[isbn]) {
//     return res.status(200).send(books[isbn])
//   }
//   return res.status(404).json({message: "Book not found with the given ISBN."});
 });
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author.trim() 

    BooksApi.then((books) => {
        const authorBooks = Object.values(books).filter(book => {
            return book.author.trim().toLowerCase() === author.toLowerCase()
          });
        
          if (authorBooks.length > 0) {
            return res.status(200).json(authorBooks)
          } else {
            return res.status(404).json({ message: "Books not found for the given author." })
          }
    })
  
    // const authorBooks = Object.values(books).filter(book => {
    //   return book.author.trim().toLowerCase() === author.toLowerCase()
    // });
  
    // if (authorBooks.length > 0) {
    //   return res.status(200).json(authorBooks)
    // } else {
    //   return res.status(404).json({ message: "Books not found for the given author." })
    // }
});
  

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title.trim()

    BooksApi.then((books) => {
        const bookByTitle = Object.values(books).filter(book => {
            return book.title.trim().toLowerCase() === title.toLowerCase()
        }) 
    
        if (bookByTitle.length > 0) {
            res.status(200).json(bookByTitle)
        }
    
        return res.status(404).json({message: "Book not found with the given Title"})
    })

    // const bookByTitle = Object.values(books).filter(book => {
    //     return book.title.trim().toLowerCase() === title.toLowerCase()
    // }) 

    // if (bookByTitle.length > 0) {
    //     res.status(200).json(bookByTitle)
    // }

    // return res.status(404).json({message: "Book not found with the given Title"})
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = Number(req.params.isbn)

  if (isbn <= Object.keys(books).length) {
    const review = books[isbn].review

    return res.status(200).json(review)
  } else {
    return res.status(404).json({message: "Review for the book not found"});
  }
});

module.exports.general = public_users;