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

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title:String,
    price:Number,
    description:String,
    geometry:{
        type:{
            type:String,
            enum:['Point'],
            required:true
        },
        coordinates:{
            type:[Number],
            required:true
        }
    },
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

}, opts)

//nested virtual
CampgroundSchema.virtual('properties.popUpMarkup').get(function(){
    return `<a href="/campgrounds/${this._id}">${this.title}</a>`;
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