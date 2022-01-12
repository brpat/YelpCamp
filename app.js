const express = require('express');
const app = express();
const path = require('path')
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const methodOverride = require('method-override');

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

app.get('/', (req, res) => { 
    res.render('home');
})

app.use(express.urlencoded({extended:true}));

app.get('/campgrounds', async (req, res) => { 
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
})

app.get('/campgrounds/new', (req, res) => { 
    res.render('campgrounds/new');
})


app.get('/campgrounds/:id', async (req, res) => { 
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/show', {campground});
})

app.get('/newcampground', async (req, res) => {
    const camp = new Campground({title: "My Back Yard" });
    await camp.save();
    res.send(camp);
})

app.get('/campgrounds/:id/edit', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit', {campground});
})

app.post('/campgrounds', async (req, res) => { 
    const campground = new Campground(req.body.campground);
    await campground.save(); 
    res.redirect(`/campgrounds/${campground._id}`);
})

app.put('/campgrounds/:id', async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect('/campgrounds');
});

app.delete('/campgrounds/:id/', async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})

app.listen(3000, ()=> {
    console.log('Serving on port 3000');
})
