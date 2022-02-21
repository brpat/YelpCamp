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
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'

const MongoDBStore = require('connect-mongo');

app.engine('ejs', ejsMate);
app.use((morgan('tiny')));


mongoose.connect(dbUrl, {
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

const secret = process.env.DB_STORE_SECRET;

const store = new MongoDBStore({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on('error',function(err) {
    console.log(err);
})

const sessionConfig = {
    store,
    name:'yelp_session_id',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true,
        expires: Date.now() + 3600000,
        maxAge:3600000
    }
}
app.use(session(sessionConfig));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
//app.use(helmet());

// app.use(
//     helmet({
//       contentSecurityPolicy: false,
//     })
//   );

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/doaro3k2u/",
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


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
app.use(mongoSanitize());


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

const port = process.env.PORT || 3000;
app.listen(port, ()=> {
    console.log(`Serving on port ${port}`);
})
