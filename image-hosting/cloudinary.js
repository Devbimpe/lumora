// ! This file creates the Cloudinary client instance


import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ 
    cloud_name: 'du6yiw4it', 
    api_key: '735481273155742', 
    api_secret: process.env.CLOUDINARY_SECRET 
});

export default cloudinary;