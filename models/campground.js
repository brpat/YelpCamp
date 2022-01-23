const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title:String,
    price:Number,
    description:String,
    location:String,
    image: String,
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:'Review'
        }
    ]
})

// Mongoose Middleware
CampgroundSchema.post('findOneAndDelete', async (doc) => {
    // doc is campground object that was deleted. Auto passed in
    if(doc){
        await Review.remove({ 
            _id: {
                $in:doc.reviews
            }
        })
    }
    
})


module.exports = mongoose.model('Campground', CampgroundSchema);