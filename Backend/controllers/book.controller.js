const Book = require('../models/book.model');

//utilise FileSystem
const fs = require('fs');

exports.getAllBooks = async (req, res, next) => {  
    try {
        const books = await Book.find();
        return res.status(200).json(books);
    }    
    catch (error) {
        return res.status(400).json(error);
    }
}

exports.getBookById = async (req, res, next) => {
    try {
        const book = await Book.findOne({_id: req.params.id});
        return res.status(200).json(book);
    }
    catch (error) {
        return res.status(400).json(error);
    }
}

exports.getBestBooks = async (req, res, next) =>{
    try {
        const bestBooks = await Book.find().sort({averageRating: -1}).limit(3);
        return res.status(200).json(bestBooks);
    }
    catch (error) {
        return res.status(404).json(error);
    } 
}

exports.createNewBook = async (req, res, next) => {
    const receivedBookObject = JSON.parse(req.body.book);
    const nextYear = new Date().getFullYear()+1;
    if (receivedBookObject.title.length >= 100 || receivedBookObject.author.length >= 50 || receivedBookObject.genre.length >= 50){
        return res.status(400).json({message: "Texte trop long. Veuillez raccourcir"})
    }
    if (receivedBookObject.year > nextYear){
        return res.status(400).json({message: "Veuillez renseigner une annee a 4 chiffres"})
    }
    try {
        console.log(req.file)  
        const bookToCreate = new Book({
            ...receivedBookObject,
            userId: req.auth.userId,
            imageUrl:`${req.protocol}://${req.get('host')}/images/${req.file.filename}`
            });
        await bookToCreate.save();
        return res.status(201).json({message: 'Livre ajoute avec succes'});
    }
     catch (error) {
        return res.status(400).json(error);
    }
}

const calcAverage = (book) => {
    const grades = book.ratings.map(ratings => ratings.grade);
    const result = grades.reduce( (accumulator, currentValue) => accumulator + currentValue) / grades.length;
    return result.toFixed(1);
}

exports.addNewGrade = async (req, res, next) => {
    try{
        if(req.body.rating > 5 || req.body.rating < 0) {
            return res.status(400).json({message : 'note maximale depassee'});
        }
        const bookRateToUpdate = await Book.findOne({_id: req.params.id, "ratings.userId" : {$nin: req.auth.userId}});
        if (bookRateToUpdate) {
        bookRateToUpdate.ratings.push({userId : req.auth.userId, grade: req.body.rating});
        bookRateToUpdate.averageRating = calcAverage(bookRateToUpdate);
        await bookRateToUpdate.save();
        return res.status(201).json(bookRateToUpdate);
        } else {
            return res.status(403).json({message: 'vote impossible'})
        }
    }
    catch (error) {
        return res.status(400).json(error);
    }
}

const deleteBookImg = async (book) => {
    const fileNameToDelete = book.imageUrl.split('images/')[1];
    await fs.unlink(`./images/${fileNameToDelete}`, (error) => {
        if(error){
            console.log(error, fileNameToDelete);
        }
    });
}


exports.updateBook = async (req, res, next) => {
    try{
        const nextYear = new Date().getFullYear()+1;
        const bookToUpdate = await Book.findOne({_id: req.params.id});
        let jsonBookForUpdate = req.body;

        if(req.auth.userId !== bookToUpdate.userId) {
            return res.status(403).json({message: "Forbidden"})
        }
     
        if (jsonBookForUpdate.title.length >= 100 || jsonBookForUpdate.author.length >= 50 || jsonBookForUpdate.genre.length >= 50){
            return res.status(400).json({message: "Texte trop long. Veuillez raccourcir"})
        }
        if (jsonBookForUpdate.year > nextYear){
            return res.status(400).json({message: "Veuillez renseigner une annee a 4 chiffres"})
        }

        if(req.file != undefined) {
            jsonBookForUpdate = JSON.parse(req.body.book);
            await deleteBookImg(bookToUpdate);
            jsonBookForUpdate.imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
        }

        // jsonBookForUpdate.userId = req.auth.userId;
        await Book.updateOne({_id: req.params.id}, {...jsonBookForUpdate, _id:req.params.id});
        return res.status(200).json({message: 'livre modifie avec succes'});
    }
    catch (error){
        return res.status(400).json(error);
    }
}

exports.deleteBook = async (req, res, next) => {
    try {
        const bookToDelete = await Book.findOne({_id: req.params.id});
        if(req.auth.userId !== bookToUpdate.userId) {
            return res.status(403).json({message: "Forbidden"})
        }
        await deleteBookImg(bookToDelete);
        await Book.deleteOne({_id: req.params.id});
        return res.status(204).json({message : 'livre supprime avec succes'});
    }
    catch (error) {
        return res.status(404).json(error);
    }
}

