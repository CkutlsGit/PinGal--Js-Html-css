const session = require('express-session');
const multer = require('multer');
const path = require('path');
const Gallery = require('./GalleryDB');
const Comments = require('./CommentsDB');
const PostComment = require('./CommentsDB');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../src/uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

class GalleryAdres {
    constructor(App) {
        this.App = App;
        this.App.use(session({
            secret: '473e1e9d07e812630e3fb097c782ff86a02eef184f6715c6e62c4d492d70bf50',
            resave: false,
            saveUninitialized: true
        }));
    };

    set() {
        this.GalleryPage();
        this.GalleryImgPage();
        this.GalleryImgMethod();
        this.AddImgPage();
        this.AddImgMethod();
    };

    GalleryPage() {
        this.App.get('/gallery', (req, res, next) => {
            Gallery.All((err, gal) => {
                if (err) return next(err);
                const galleryPage = path.join(__dirname, '../src/templates/ejs/gallery.ejs');
                res.render(galleryPage, { gal: gal, req: req });
            });
        });
    };

    GalleryImgPage() {
        this.App.get('/gallery/post/:id', (req, res, next) => {
            const id = req.params.id;
            const galleryPageUniv = path.join(__dirname, '../src/templates/ejs/gallerypage.ejs');
    
            Gallery.Find(id, (err, galpage) => {
                if (err) return next(err);
    
                if (!galpage) {
                    res.status(500).send('Такого поста нет!');
                    return;
                };
    
                PostComment.All((err, comments) => {
                    if (err) return next(err);
    
                    const postComments = comments.filter(comment => comment.postid === Number(id));
    
                    res.render(galleryPageUniv, { galpage: galpage, req: req, id: id, comments: postComments });
                });
            });
        });
    }

    GalleryImgMethod() {
        this.App.post('/gallery/post/:id', (req, res, next) => {
            const id = req.params.id;
            const { description } = req.body;
            const author = req.session.user.login;
            const ico = req.session.user.ico;
    
            if (!description) {
                res.status(400).send('Пустой комментарий!');
                return;
            }
    
            const CommentData = {
                description: description,
                author: author,
                ico: ico,
                postid: id // Добавляем значение postid
            };
    
            PostComment.Add(CommentData, (err) => {
                if (err) return next(err);
                res.redirect(`/gallery/post/${id}`);
            });
        });
    };

    AddImgPage() {
        this.App.get('/gallery/add', (req, res) => {
            const AddPage = path.join(__dirname, '../src/templates/ejs/addimg.ejs');
            res.render(AddPage, { req: req });
        });
    };

    AddImgMethod() {
        this.App.post('/gallery/add', upload.single('image'), (req, res, next) => {
            const { title, description } = req.body;
            const image = req.file;
            const author = req.session.user.login;

            // console.log('Data Request: ', { title, description, image, author });

            if (!title || !description || !image || !author) {
                res.status(500).send('Error: Invalid Data');
                return 
            };

            Gallery.Add({ title, description, image: image.filename, author }, (err, gal) => {
                if (err) return next(err);
                res.redirect('/gallery');
            });  
        });
    };
};

module.exports.GalleryAdres = GalleryAdres;