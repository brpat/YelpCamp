const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = mongoose.Schema({
        url: String, 
        filename: String
    }
);

//thumbnail virtual property
ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_200');
})

const CampgroundSchema = new Schema({
    title:String,
    price:Number,
    description:String,
    location:String,
    images: [ImageSchema],
    author: {
        type:Schema.Types.ObjectId,
        ref:'User'
    },                              
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