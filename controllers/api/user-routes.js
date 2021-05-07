const router = require('express').Router();
const sequelize = require('../../config/connection');
const { User, Game, Continent } = require('../../models');
const withAuth = require('../../utils/auth');

router.get('/', async (req, res) => {
    try {
        const userData = await User.findAll({
            attributes: {
                exclude: ['password'],
            },
            include: [{
                model: Game,
                    include: {
                    model: Continent,
                },
            }],
            order: [
                [{model: Game}, 'score', 'DESC'],
                [{model: Game}, 'time', 'ASC'],
            ]
        })
        res.status(200).json(userData);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.post('/', async (req, res) => {
    try {
        const userData = await User.create({
            username: req.body.username,
            password: req.body.password,
        });

        req.session.save(() => {
            req.session.user_id = userData.id;
            req.session.username = userData.username;
            req.session.logged_in = true;
            res.status(200).json(userData);
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

router.post('/login', async (req, res) => {
    try {
        const userData = await User.findOne({
            where: {
                username: req.body.username,
            },
        });
        if (!userData) {
            res.status(400).json({ message: 'Incorrect username!' });
            return;
        }
        const validPassword = await userData.checkPassword(req.body.password);
        if (!validPassword) {
            res.status(400).json({ message: 'Incorrect password!' });
            return;
        }
        req.session.save(() => {
            req.session.user_id = userData.id;
            req.session.username = userData.username;
            req.session.logged_in = true;
            res.status(200).json({user: userData, message: 'Log in Succesful!' });
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const userData = await User.findOne({
            where: {
                id: req.params.id
            },
            include: [
                {
                    model: Game,
                    include: {
                        model: Continent,
                    },
                },
            ],
        })
        if (!userData) {
            res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(userData)
    } catch (err) {
        res.status(500).json(err);
    }
});

router.get('/searched/:username', withAuth, async (req, res) => {
    try {
        const userData = await User.findOne({
            where: {
                username: req.params.username,
            },
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
            res.status(400).json({ message: 'User not found!' });
        }
        const user = userData.get({ plain: true });
        res.status(200).json(user);
        // const user = userData.get({ plain: true });
        // res.render('searchuser', {
        //     user,
        //     logged_in: req.session.logged_in
        // });
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});


router.post('/logout', withAuth, (req, res) => {
    if (req.session.logged_in) {
        req.session.destroy(() => {
            res.status(204).end();
        });
    } else {
        res.status(404).end();
    }
});

module.exports = router;