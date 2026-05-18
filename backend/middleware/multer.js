import multer from 'multer';

const storage = multer.diskStorage({
    filename: function(req,file,callback){
        callback(null,file.originalname);
    }
})

// 5 MB per-file cap so a huge upload can't exhaust server resources.
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
})

export default upload;