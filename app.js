const express = require('express');
const app = express();
const path = require('path')
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const { nextTick } = require('process');
const ejsMate = require('ejs-mate');
const { reset } = require('nodemon');
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');
const Review = require('./models/review');
const session = require('express-session');
const flash = require('connect-flash');

const campground = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

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
    useUnifiedTopology:true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log("DB connection open");
});


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname,'public')));
const sessionConfig = {
    secret: 'fakesecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 360000,
        maxAge:360000
    }
}
app.use(session(sessionConfig));
app.use(flash());

const validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }else{
        next();
    }
};


const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }else{
        next();
    }
}


app.get('/', (req, res) => { 
    res.render('home');
})

//middleware to display any messages stored in flash
app.use((req,res, next) => {
    //res.locals.success will be accessed from ejs files.
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});


app.use(express.urlencoded({extended:true}));
app.use('/campgrounds', campground);
app.use('/campgrounds/:id/reviews', reviews);



app.get('/error', (req,res) => {
    throw new ExpressError('Unknown Error occured', 404);
    //console.log(unknownVariable);
});


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
