/**
 * Middleware d'authentification
 * utilisant le Basic HTTP Auth
 */
module.exports = (req, res, next) => {
    try {
        // On récupère le header Authorization
        const { authorization } = req.headers;
        if (!authorization) throw new Error('Missing header Authorization');

        // Le header doit commencer par "Basic " et on extrait le code qui suit
        const authMatch = authorization.match(/^Basic (.+)$/);
        if (!authMatch) throw new Error('Invalid header Authorization');

        // Décodage du code en base 64 et séparation du username et du password (séparés par ":")
        const authCredentials = base64.decode(authMatch[1]).split(':');
        if (authCredentials.length !== 2
            || authCredentials[0] !== settings.adminAuth.user
            || authCredentials[1] !== settings.adminAuth.password) {
            throw new Error('Incorrect username or password');
        }

        // Authentification réussie, on continue
        next();

    } catch (e) {
        // En cas d'erreur, on envoie le code 401
        // et le header WWW-Authenticate pour signaler le mode d'authentification au client
        res.setHeader('WWW-Authenticate', 'Basic realm="Accès restreint"');
        res.status(401).send(e.message);
    }
};
