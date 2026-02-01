import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    regularPrice: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
      required: true,
    },
    bathrooms: {
      type: Number,
      required: true,
    },
    bedrooms: {
      type: Number,
      required: true,
    },
    furnished: {
      type: Boolean,
      required: true,
    },
    parking: {
      type: Boolean,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    offer: {
      type: Boolean,
      required: true,
    },
    imageUrls: {
      type: Array,
      required: true,
    },
    userRef: {
      type: String,
      required: true,
    },
    bbqRates: {
      chicken: {
        type: Number,
        default: 700,
      },
      mutton: {
        type: Number,
        default: 2000,
      },
      fish: {
        type: Number,
        default: 1500,
      },
    },
    bbqAvailability: {
      isChickenAllowed: {
        type: Boolean,
        default: true,
      },
      isMuttonAllowed: {
        type: Boolean,
        default: true,
      },
      isFishAllowed: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;
