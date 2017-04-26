const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const settings = require('./settings');

// Configuration de Express
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connection à MongoDB
MongoClient.connect(settings.url, (error, db) => {
    if (error) {
        console.error(error);
        return;
    }
    console.log("Connected to MongoDB");
    app.db = db;
    app.pollsCollection = db.collection('polls');
    app.listen(3000, () => {
        console.log('Listening on port 3000');
    });
});

// Lister les sondages
app.get('/polls', (req, res) => {
    app.pollsCollection.find({}).toArray((error, polls) => {
        if (error) {
            console.error(error);
            return res.sendStatus(500);
        }
        res.send(polls);
    });
});

// Récupérer un sondage
app.get('/polls/:id', (req, res) => {
    const id = new ObjectID(req.params.id);
    app.pollsCollection.findOne({ _id: id }, (error, poll) => {
        if (error) {
            return res.status(404).send(error.message);
        }
        res.send(poll);
    });
});

// Créer un sondage
app.post('/polls', (req, res) => {
    //const question = req.body.question;
    //const answers = req.body.answers;
    const { question, answers } = req.body;

    // On vérifie si question est une chaîne de caractères
    if (typeof (question) !== 'string') {
        return res.sendStatus(400);
    }
    // On vérifie si answers est une liste de chaînes de caractères
    if (!Array.isArray(answers) || answers.some(a => typeof (a) !== 'string') ||
        answers.length < 2) {
        return res.sendStatus(400);
    }

    app.pollsCollection.insert({
        question, answers,
        votes: []
    }, (error, result) => {
        if (error) {
            console.error(error);
            return res.sendStatus(500);
        }
        res.status(201).send(result.ops[0]);
    });
});

// Voter pour une réponse d'un sondage
app.post('/polls/:id/votes', (req, res) => {
    const id = new ObjectID(req.params.id);
    const answer = parseInt(req.body.answer, 10);
    app.pollsCollection.findOne({ _id: id }, (error, poll) => {
        if (error) {
            return res.status(404).send(error.message);
        }

        if (!(answer in poll.answers)) {
            return res.sendStatus(400);
        }

        app.pollsCollection.update(
            { _id: id },
            { $push: { votes: answer } },
            (error, result) => {
                if (error) {
                    return res.status(500).send(error.message);
                }
                res.status(201).send([...poll.votes, answer]);
            }
        )
    });
});