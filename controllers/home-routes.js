const router = require('express').Router();
const { User, Game, Countries, Continent } = require('../models');
const withAuth = require('../utils/auth');

router.get('/login', (req, res) => {
    if (req.session.logged_in) {
        res.redirect('/profile');
        return;
    }
    res.render('/login');
});

router.get('/signup', (req, res) => {
    res.render('/signup');
});

router.get('/newgame/:id', withAuth, async (req, res) => {
    try {
        const gameData = await Game.findOne({
            where: {
                continent_id: req.params.id,
            },
            include: [
                {
                    model: User,
                },
                {
                    model: Continent,
                    include: {
                        model: Countries,
                    },
                },
            ],
        });
        const game = gameData.get({ plain: true });
        res.render('/gamepage', {
            game,
            logged_in: req.session.logged_in
        });
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

router.get('/profile', withAuth, async (req, res) => {
    try {
        const userData = await User.findByPk(req.session.user_id, {
            attributes: { exclude: 'password' },
            include: [
                {
                    model: Game,
                    include: {
                        model: Continent,
                    },
                },
            ],
        });
        const user = userData.get({ plain: true });

        res.render('/profile', {
            ...user,
            logged_in: true
        });
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

router.get('/profile/:username', withAuth, async (req, res) => {
    try {
        const userData = await User.findByPk(req.params.username, {
            include: [
                {
                    model: Game,
                    include: {
                        model: Continent,
                    },
                },
            ],
        });
        if (!userData) {
            alert('User not found!');
        }
        const user = userData.get({ plain: true });
        res.render('/profile', {
            user,
            logged_in: req.session.logged_in
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;