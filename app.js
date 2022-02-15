if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path')
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');
const User = require('./models/user');
const Review = require('./models/review');
const session = require('express-session');
const flash = require('connect-flash');
const campgroundRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');
const userRoutes =  require('./routes/users');
const passport = require('passport');
const localStrategy = require('passport-local');


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
        expires: Date.now() + 3600000,
        maxAge:3600000
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
//adding and removing user from session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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


//middleware to display any messages stored in flash
app.use((req,res, next) => {
    //res.locals will be accessed from ejs files.
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.get('/makeUser', async(req, res) => {
    const user = new User({
        email:"test@test.com",
        username:"test"
    });
    const newUser = await User.register(user, 'testpassword');
    res.send(newUser);
});


app.use(express.urlencoded({extended:true}));
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);

app.get('/', (req, res) => { 
    res.render('home');
})


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
