const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const Review = require('../models/review');
const { isLoggedIn, isAuthor, validateCampground} = require('../middleware');

router.get('/', catchAsync(async (req, res) => { 
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}))

router.get('/new', isLoggedIn, (req, res) => { 
    res.render('campgrounds/new');
})


router.get('/:id', catchAsync(async (req, res) => { 
    const { id } = req.params;
    const campground = await Campground.findById(id).populate('reviews').populate('author');

    if(!campground){
        req.flash('error', 'Cannot find campground!');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground});
}))

router.get('/newcampground', catchAsync(async (req, res) => {
    const camp = new Campground({title: "My Back Yard" });
    await camp.save();
    res.send(camp);
}))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    if(!campground){
        req.flash('error', 'Campground not found');
        return res.redirect('/campgrounds');
    }

    res.render('campgrounds/edit', {campground});
}))

router.post('/', isLoggedIn, validateCampground,catchAsync(async (req, res,next) => { 
    //if(!req.body.campground) throw new ExpressError('In valid Campground Data', 400);

    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save(); 
    req.flash('success', 'Successfully created a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}));


router.put('/:id', isLoggedIn, validateCampground,catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user.id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    campground_ = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    req.flash('success', 'Successfully updated campground!');
    res.redirect('/campgrounds');
}));

router.delete('/:id/', isLoggedIn, catchAsync(async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));



module.exports = router;