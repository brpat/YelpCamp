const express = require('express');
const app = express();
const path = require('path')
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const morgan = require('morgan');
const { nextTick } = require('process');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const { reset } = require('nodemon');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');
const { campgroundSchema } = require('./schemas.js');


app.engine('ejs', ejsMate);
app.use((morgan('tiny')));


// custom middleware logger
// app.use((req,res,next) =>{
//     req.requestTime = Date.now();
//     console.log(req.method.toUpperCase(), req.path);
//     next();
// });

// custom middleware logger for a specific path.
// Will work on all CRUD operations for path
// app.use('/newcampground', (req,res,next) =>{
//     req.requestTime = Date.now();
//     console.log(req.method.toUpperCase(), req.path);
//     next();
// });


mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser:true,
    useUnifiedTopology:true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log("DB connection open");
});


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(methodOverride('_method'))


const validateCampground = (req, res, next) => {

    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }else{
        next();
    }
};


app.get('/', (req, res) => { 
    res.render('home');
})

app.use(express.urlencoded({extended:true}));

app.get('/error', (req,res) => {
    throw new ExpressError('Unknown Error occured', 404);
    //console.log(unknownVariable);
});


app.get('/campgrounds', catchAsync(async (req, res) => { 
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}))

app.get('/campgrounds/new', (req, res) => { 
    res.render('campgrounds/new');
})


app.get('/campgrounds/:id', catchAsync(async (req, res) => { 
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/show', {campground});
}))

app.get('/newcampground', catchAsync(async (req, res) => {
    const camp = new Campground({title: "My Back Yard" });
    await camp.save();
    res.send(camp);
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit', {campground});
}))

app.post('/campgrounds', validateCampground,catchAsync(async (req, res,next) => { 

    //if(!req.body.campground) throw new ExpressError('In valid Campground Data', 400);

    const campground = new Campground(req.body.campground);
    await campground.save(); 
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.put('/campgrounds/:id', validateCampground,catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect('/campgrounds');
}));

app.delete('/campgrounds/:id/', catchAsync(async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

// match all requests,
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404));
})

// custom error handler
app.use((err, req, res, next) => {
    const {statusCode=500,message='Something went wrong'} = err
    //res.send('Something went wrong');
    res.status(statusCode).render('error', { err });
    // below sends to default handler;
    //next(err);
});

app.listen(3000, ()=> {
    console.log('Serving on port 3000');
})
