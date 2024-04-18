const express = require('express');

//importe les fichiers avec les fonctions pour les routes
const multer = require('../middleware/GuardMulter');
const bookCtrls = require('../controllers/book.controller');
const addAuth = require('../middleware/GuardAuth');

const router = express.Router();


router.get('/', bookCtrls.getAllBooks);
router.get('/bestrating', bookCtrls.getBestBooks);
router.get('/:id', bookCtrls.getBookById);
router.post('/', addAuth, multer, bookCtrls.createNewBook);
router.post('/:id/rating', addAuth, bookCtrls.addNewGrade);
router.put('/:id', addAuth, multer, bookCtrls.updateBook);
router.delete('/:id', addAuth, multer, bookCtrls.deleteBook);

module.exports = router;