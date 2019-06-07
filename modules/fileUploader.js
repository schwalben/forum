const crypto = require('crypto');
const algorithm = 'md5';

const maxSize = 5000000;
const multer  = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/');
  },
  // デフォルトのfilenameだと拡張子が消える。
  filename: function (req, file, cb) {
    cb(null, createUniqueName(file.originalname, file.mimetype.split('/')[1]));
  }
});
const upload = multer({ 
    storage: storage, 
    fileFilter: function (req, file, cb) {
      cb(null, isImageFileExtension(file.mimetype));
    }, 
    limits: {fileSize: maxSize}, 
    onError: function (error, next) {
        console.log('onError()');
        console.log(error);
        next(error);
    }
  }).single('imageFile');


function createUniqueName(originalname, fileExtension) {

    const hash = crypto.createHash(algorithm);
    hash.update(originalname + Math.random() + Date.now());

    const hashedFileName = hash.digest('hex') + '.' + fileExtension;
    if (existFileName(hashedFileName)) {
        hashedFileName = createUniqueName(originalname, fileExtension);
    }

    return hashedFileName;
}


// Amazon S3にUploadする予定なので、その時に実装する
function existFileName(fileName) {
    return false;
}

function isImageFileExtension(mimetype) {
    return (mimetype == 'image/jpg' || mimetype == 'image/jpeg' || mimetype == 'image/png');
}


function getMaxSize() {
    return maxSize;
}


module.exports = {createUniqueName, isImageFileExtension, getMaxSize, upload, multer};
