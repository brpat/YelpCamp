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
    
    for (let i = 0; i < 200; i++){
        const random1000 = Math.floor((Math.random() * 1000));
        const price = Math.floor((Math.random() * 100));
        const camp = new Campground(                    
                {   
                    author:'620c6333893db3389ecf267b',
                    title: `${sample(descriptors)} ${sample(places)}`, 
                    location:`${cities[random1000].city}, ${cities[random1000].state}`,
                    image: "https://picsum.photos/500/600?random=1",
                    description: "lorem ipsum",
                    price,
                    geometry: { 
                            type: 'Point', coordinates: [
                                        cities[random1000].longitude, 
                                        cities[random1000].latitude
                                    ]
                        },
                    images: [
                        {
                            url: 'https://res.cloudinary.com/doaro3k2u/image/upload/v1644979386/YelpCamp/sgpwps3qbndvjwuwsr0u.jpg',
                            filename: 'YelpCamp/sgpwps3qbndvjwuwsr0u'
                        },
                        {
                            url: 'https://res.cloudinary.com/doaro3k2u/image/upload/v1644979386/YelpCamp/u8ygqsswcaveknk4xymq.png',
                            filename: 'YelpCamp/u8ygqsswcaveknk4xymq'
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

