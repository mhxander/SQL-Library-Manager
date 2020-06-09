const express = require('express');
const router = express.Router();
const Book = require('../models').Book;
const {Op} = require('../models').Sequelize;

/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      return next(error);
    }
  }
}

//Search functionality
router.post('/search', asyncHandler(async(req,res) => {
  search = true;
  const books = await Book.findAll({
    where: {
      [Op.or]: {
        title: 
        {
          [Op.like]: `%${req.body.search}%`
        },
        author:
        {
          [Op.like]: `%${req.body.search}%`
        },
        genre:
        {
          [Op.like]: `%${req.body.search}%`
        },
        year:
        {
          [Op.like]: `%${req.body.search}%`
        }
      }
    }
  });
  res.render('book/index', {books});
}))

//GET FULL BOOK LISTING, WITH PAGINATION.
/* GET books listing, with Pagination. */
router.get('/pag/:pag', asyncHandler(async(req, res) =>{
  let booksPerPage = 10;
  const books = await Book.findAll({order: [["title", "ASC"]]});
  const pages = books.length/booksPerPage
  const start = (parseInt(req.params.pag) * booksPerPage) - booksPerPage
  const finish = start + booksPerPage
  if(start + 1>books.length){
    res.render('book/book-notfound')
  } else if(isNaN(req.params.pag)){
    res.render('book/book-notfound')
  }else{
  const pagBooks = books.slice(start, finish);
  res.render('book/index', {books: pagBooks, pages})
  }
}))  

//Redirect /books to show pagination
router.get('/', asyncHandler(async(req, res) => {
res.redirect("/books/pag/1")
}));


//CREATING A NEW BOOK
/* Create a new book form. */
router.get('/new', (req, res) => {
  res.render("book/new-book", { book: {}, title: "New Book" });
});

/* POST create book. */
router.post('/new', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect("/books");
  } catch (error) {
    if(error.name === "SequelizeValidationError") { // checking the error
      book = await Book.build(req.body);
      res.render("book/new-book", { book, errors: error.errors })
    } else {
      error.status(500);
      throw error;
    }  
  }
}));


//EDIT A CURRENT BOOK
//Edit form
router.get('/:id', asyncHandler(async(req, res)=>{
  const book = await Book.findByPk(req.params.id);
  if(book){
    res.render('book/update-book', {book})
  } else {
    throw error;
  }
}));

/* Update the books info. */
router.post('/:id/edit', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if(book) {
      await book.update(req.body);
      res.redirect("/books"); 
    } else {
      res.status(405);
      throw error;
    }
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id; // make sure correct book gets updated
      res.render("book/update-book", {book, errors: error.errors, title: "Edit Book"})
    } else {
      throw error;
    }
  }
}));

//DELETE A BOOK
/* Delete individual book. */
router.post('/:id/delete', asyncHandler(async (req ,res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    await book.destroy();
    res.redirect("/books");
  } else {
    res.sendStatus(404);
  }

}));

module.exports = router;