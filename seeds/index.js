const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers')

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser:true,
    useUnifiedTopology:true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log("DB connection open");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];


const seedDb = async() =>{
    await Campground.deleteMany({});
    //const c = new Campground({title: 'purple field'});
    
    for (let i = 0; i < 50; i++){
        const random1000 = Math.floor((Math.random() * 1000));
        const price = Math.floor((Math.random() * 100));
        const camp = new Campground(                    
                {   
                    author:'6205d821dcfb6fbe2ed2b733',
                    title: `${sample(descriptors)} ${sample(places)}`, 
                    location:`${cities[random1000].city}, ${cities[random1000].state}`,
                    image: "https://picsum.photos/500/600?random=1",
                    description: "lorem ipsum",
                    price,
                    images: [
                        {
                            url: 'https://res.cloudinary.com/doaro3k2u/image/upload/v1644788227/YelpCamp/qluleylqympqr6bdvlcp.jpg',
                            filename: 'YelpCamp/qluleylqympqr6bdvlcp'
                        },
                        {
                            url: 'https://res.cloudinary.com/doaro3k2u/image/upload/v1644788987/YelpCamp/lobcsihdckbucpndedg2.png',
                            filename: 'YelpCamp/lobcsihdckbucpndedg2'
                        }
                    ]
                }
            );
        await camp.save();
    }
}

seedDb().then(() =>{
    mongoose.connection.close();
}).catch(err =>{
    console.log("Error connecting to Mongodb");
})

