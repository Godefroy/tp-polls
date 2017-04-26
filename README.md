# Polls

Serveur API de sondages.

## API

### Créer un sondage

`POST /polls`

Authentification nécessaire (HTTP Basic Auth) avec les identifiants définis dans `settings.js`.

Paramètres :
- question: string
- answers: string[]

Réponse en cas de succès : `201 Created`
Sondage nouvellement créé en JSON :
```
{"id": 1, "question": "Question ?", "answers": ["Réponse 0", "Réponse 1"], "votes": []}
```

Erreurs :
- `400 Bad Request` : Paramètres incorrects

### Supprimer un sondage

`DELETE /polls/:id`

Authentification nécessaire (HTTP Basic Auth) avec les identifiants définis dans `settings.js`.

Réponse en cas de succès : `204 No Content`

Erreurs :
- `404 Page Not Found` : Sondage non trouvé

### Lister les sondages

`GET /polls`

Réponse en cas de succès : `200 OK`
Liste des sondages (id et question) en JSON :
```
[{"id": 1, "question": "Question ?"}, ...]
```

### Récupérer un sondage et ses résultats

`GET /polls/:id`

Réponse en cas de succès : `200 OK`
Sondage en JSON :
```
{"id": 1, "question": "Question ?", "answers": ["Réponse 0", "Réponse 1"], "votes": [0, 0, 1, 0, 1]}
```

Erreurs :
- `404 Page Not Found` : Sondage non trouvé

### Voter pour une réponse d'un sondage

`POST /polls/:id/votes`

Paramètres :
- answer: Index de la réponse (number)

Réponse en cas de succès : `201 Created`
Listes des votes en JSON :
```
[0, 0, 1, 0, 1]
```

Erreurs :
- `400 Bad Request` : Paramètres incorrects
- `404 Page Not Found` : Sondage non trouvé
