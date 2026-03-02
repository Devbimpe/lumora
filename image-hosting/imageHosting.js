import cloudinary from './cloudinary.js';

/*
Because we are using normal URL's for images, we can just simply use the img src atribute to download them, meaning we shouldnt ever need a "get image" function, this should be handleed by the client side.
*/


export async function uploadImageFromBuffer(buffer, filename=null) {

    const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                public_id: filename.replace(/\.[^/.]+$/, '') || undefined,
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

    // ? We might want to just return the entire promise, but this lets us only reveal certain things from the upload 
    return {
        id: uploadResult.public_id,
        url: uploadResult.url,
    };
}

export async function uploadImageFromURL(imageURL, filename=null) {
    const uploadResult = await cloudinary.uploader.upload(
        imageURL,
        {
            public_id: filename ? filename : extractFilename(imageURL),
            resource_type: 'auto',
        }
    );

    // ? We might want to just return the entire promise, but this lets us only reveal certain things from the upload 
    
    return {
        id: uploadResult.public_id,
        url: uploadResult.url,
    };
}

export async function uploadImageFromLocalPath(imagePath, filename=null) {
    const uploadResult = await cloudinary.uploader.upload(
        imagePath,
        {
            public_id: filename ? filename : extractFilename(imagePath),
            resource_type: 'auto',
        }
    );

    // ? We might want to just return the entire promise, but this lets us only reveal certain things from the upload
    return {
        id: uploadResult.public_id,
        url: uploadResult.url,
    };
}

export async function autoUploadImage(imageSource, filename=null) {
    if (imageSource instanceof Buffer) {
        return await uploadImageFromBuffer(imageSource, filename);
    } else if (typeof imageSource === 'string' && (imageSource.match("^https?:\/\/"))) {
        return await uploadImageFromURL(imageSource, filename);
    } else if (typeof imageSource === 'string') {
        return await uploadImageFromLocalPath(imageSource, filename);
    } else {
        throw new Error('Unsupported image source type');
    }
}


export async function deleteImage(imageURL) {
    // Extract public_id from the URL
    const urlParts = imageURL.split('/');
    const publicId = urlParts[urlParts.length - 1].split('.')[0];
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, { resource_type: 'auto' }, (error, result) => {
            if (error) {
                console.error('Delete error:', error);
                reject(error);
            } else {
                console.log('Delete result:', result);
                resolve(result);
            }
        });
    });
}


function extractFilename(imagePath) {
    return imagePath.split('/').pop().replace(/\.[^/.]+$/, "");
}

export default { 
    uploadImageFromBuffer,
    uploadImageFromURL,
    uploadImageFromLocalPath,
    autoUploadImage,
    deleteImage,
};

