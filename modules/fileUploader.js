var crypto = require('crypto');
var algorithm = 'md5';

var maxSize = 1000000;
var multer  = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/');
  },
  // デフォルトのfilenameだと拡張子が消える。
  filename: function (req, file, cb) {
    cb(null, createUniqueName(file.originalname, file.mimetype.split('/')[1]));
  }
});
var upload = multer({ 
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

    var hash = crypto.createHash(algorithm);
    hash.update(originalname + Math.random() + Date.now());

    var hashedFileName = hash.digest('hex') + '.' + fileExtension;
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
