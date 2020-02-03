const express = require('express');
const router  = express.Router();

const Author = require('../models/author')
const Book = require('../models/book')

router.post('/reviews/add', (req, res, next) => {
  const { user, comments } = req.body;
  Book.update(
    {
      _id: req.query.book_id
    },
    {
      $push: { reviews: { user, comments } }
    }
  )
    .then(book => {
      res.redirect('/books');
    })
    .catch(error => {
      console.log(error);
    });
});

router.post('/book/:id/delete', (req, res, next) => {

  Book.findByIdAndRemove(req.params.id)
    .then(book => {
      res.redirect('/books');
    })
    .catch(err => console.log(err));
});

router.get('/book/:id', (req, res, next) => {
  const bookId = req.params.id;
  if (!/^[0-9a-fA-F]{24}$/.test(bookId)) {
    return res.status(404).render('not-found');
  }

  Book.findOne({ _id: bookId })
    .populate('author')
    .then(book => {
      if (!book) {
        return res.status(404).render('not-found');
      }
      res.render('book-detail', { book });
    })
    .catch(next);
});

router.get('/authors/add', (req, res, next) => {
  res.render('author-add');
});

router.post('/authors/add', (req, res, next) => {
  const { name, lastName, nationality, birthday, pictureUrl } = req.body;
  const newAuthor = new Author({ name, lastName, nationality, birthday, pictureUrl });
  newAuthor
    .save()
    .then(book => {
      res.redirect('/books');
    })
    .catch(error => {
      console.log(error);
    });
});

router.get('/books/edit', (req, res, next) => {
  Book.findOne({_id: req.query.book_id})
  .populate('author')
  .then((book) => {

    Author.find()
      .then( availableAuthors => {
        const newAvailableAuthors =  availableAuthors.filter(
          oneAuthor => !oneAuthor._id.equals(book.author[0]._id)
        )
        res.render("book-edit", {book, newAvailableAuthors})
      })
      .catch(error => console.log(error))
  })
  .catch((error) => {
    console.log(error);
  })
});

router.post('/books/edit', (req, res, next) => {
  const { title, author, description, rating } = req.body;
  Book.update({_id: req.query.book_id}, { $set: {title, author, description, rating }})
  .then((book) => {
    res.redirect('/books');
  })
  .catch((error) => {
    console.log(error);
  })
});

router.get('/books/add', (req, res, next) => {
  Author.find()
  .then(availableAuthors => {
    console.log(availableAuthors)
    res.render("book-add", {availableAuthors});

  })
  .catch(err => console.log(err))
});

router.post('/books/add', (req, res, next) => {
  const { title, author, description, rating } = req.body;
  const newBook = new Book({ title, author, description, rating})
  newBook.save()
  .then((book) => {
    console.log(book)
    res.redirect('/books')
  })
  .catch((error) => {
    console.log(error);
  })
});

router.get('/books', (req, res, next) => {
  Book.find()
    .then(allTheBooksFromDB => {
      // console.log('Retrieved books from DB:', allTheBooksFromDB);
      res.render('books', { books: allTheBooksFromDB });
    })
    .catch(error => {
      console.log('Error while getting the books from the DB: ', error);
    })
});

router.get('/authors', (req, res) => {
  Author.find()
  .then(authorsFromDb => {
    console.log(`Authors form DB: ${authorsFromDb}`)
    res.render('authors', {authors: authorsFromDb})
  })
  .catch(err => console.log(err))
})

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('index');
});

module.exports = router;
