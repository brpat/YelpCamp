const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const passport = require('passport');
const {isLoggedIn} = require('../middleware');

router.get('/register', (req, res) => {
    res.render('users/register');
})

router.get('/login', (req, res) => {
    res.render('users/login');
});

// passport built in middleware
router.post('/login', passport.authenticate('local', {failureFlash:true, failureRedirect:'/login'}), (req, res) => {
    req.flash('success','Welcome Back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
});

router.post('/register', catchAsync(async (req, res) =>{
    try{
        const {email, username, password} = req.body;
        const user = User({email, username});
        const newUser = await User.register(user, password);
        //passport method to establish session
        req.login(newUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Campgrounds');
            res.redirect('/campgrounds');
        });
    }
    catch(e){
        req.flash('error', e.message);
        res.redirect('/register');
    }
}));

router.get('/logout', (req, res) => {
    req.logOut();
    req.flash('success','Logged Out!');
    res.redirect('/login');
});

module.exports = router;