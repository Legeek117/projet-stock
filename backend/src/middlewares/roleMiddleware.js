const checkRole = (role) => {
    return (req, res, next) => {
        // Supposons que authMiddleware a déjà décodé le token et populated req.user
        if (!req.user) {
            return res.status(401).json({ message: 'Non authentifié' });
        }

        if (req.user.role !== role) {
            return res.status(403).json({ message: 'Accès refusé : Droits insuffisants' });
        }

        next();
    };
};

module.exports = checkRole;
