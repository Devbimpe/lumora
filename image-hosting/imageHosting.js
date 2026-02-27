import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ 
    cloud_name: 'du6yiw4it', 
    api_key: '735481273155742', 
    api_secret: process.env.CLOUDINARY_SECRET 
});

async function uploadFileFromBuffer(buffer, filename) {
    const fileNameMinusExt = filename.replace(/\.[^/.]+$/, "");
    const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                public_id: fileNameMinusExt,
                resource_type: 'auto',
            },
            (error, result) => {
                if (error) {
                    console.error('Upload error:', error);
                    reject(error);
                } else {
                    console.log('Upload result:', result);
                    resolve(result);
                }
            }
        ).end(buffer);
    });

    // const optimizeUrl = cloudinary.url(uploadResult.public_id, {
    //     fetch_format: 'auto',
    //     quality: 'auto'
    // });

    // const autoCropUrl = cloudinary.url(uploadResult.public_id, {
    //     crop: 'auto',
    //     gravity: 'auto',
    //     width: 500,
    //     height: 500,
    // });
    
    return {
        id: uploadResult.public_id,
        url: uploadResult.url,
    };
}

export default { 
    uploadFileFromBuffer
};

