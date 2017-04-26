const express = require('express');
const bodyParser = require('body-parser');
const base64 = require('js-base64').Base64;
const settings = require('./settings');
const authMiddleware = require('./authMiddleware');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const polls = [
  {
    id: 3,
    question: "Question ?",
    answers: ["Réponse 1", "Réponse 2", "Réponse 3"],
    votes: []
  },
  {
    id: 1,
    question: "Question 2 ?",
    answers: ["Réponse 1", "Réponse 2", "Réponse 3"],
    votes: [1, 0, 0, 2, 1, 0, 1, 1]
  }
];


/**
 * Lister les sondages
 */
app.get('/polls', (req, res) => {
  res.send(polls);
});


/**
 * Récupérer un sondage
 */
app.get('/polls/:id', (req, res) => {
  // On extrait le paramètre id et on le transforme en nombre
  const id = parseInt(req.params.id, 10);
  // On cherche le sondage par son id
  const poll = polls.find(p => p.id === id);
  if (typeof (poll) !== 'undefined') {
    // Si un sondage est trouvé, on le renvoie
    res.send(poll);
  } else {
    // Sinon, on envoie une erreur 404
    res.sendStatus(404);
  }
});


/**
 * Créer un sondage
 */
app.post('/polls', authMiddleware, (req, res) => {
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

  // On crée un nouvel identifiant unique, supérieur à tous les autres
  //const id = Math.max.apply(null, polls.map(p => p.id)) + 1;
  const id = polls.reduce((max, p) => max > p.id ? max : p.id, 0) + 1;

  // On crée un nouvel objet sondage
  const poll = {
    id, question, answers,
    votes: []
  };

  // On ajoute le nouveau sondage à la liste
  polls.push(poll);

  // et on le renvoie avec le bon code HTTP
  res.status(201).send(poll);
});


/**
 * Supprimer un sondage
 */
app.delete('/polls/:id', authMiddleware, (req, res) => {
  // On cherche l'index du sondage dans le tableau polls par son id
  const id = parseInt(req.params.id, 10);
  const index = polls.findIndex(p => p.id === id);

  // Si le sondage n'existe pas, erreur 404
  if (index === -1) {
    return res.sendStatus(404);
  }

  // On supprime le sondage de la liste
  polls.splice(index, 1);

  // Code "No Content" (Succès)
  res.sendStatus(204);
});


/**
 * Voter pour une réponse d'un sondage
 */
app.post('/polls/:id/votes', (req, res) => {
  // On récupère le sondage par son id
  const id = parseInt(req.params.id, 10);
  const poll = polls.find(p => p.id === id);

  // On envoie une erreur si le sondage n'existe pas
  if (typeof (poll) === 'undefined') {
    return res.sendStatus(404);
  }

  // On récupère l'index de la réponse votée depuis le body
  // et on vérifie sa validité
  const answer = parseInt(req.body.answer, 10);
  if (!(answer in poll.answers)) {
    return res.sendStatus(400);
  }

  // On ajoute l'index de la réponse à la liste des votes du sondage
  poll.votes.push(answer);

  // On renvoie la nouvelle liste des votes
  res.status(201).send(poll.votes);
});

app.listen(settings.port, () => {
  console.log('Listening on port ' + settings.port);
});
