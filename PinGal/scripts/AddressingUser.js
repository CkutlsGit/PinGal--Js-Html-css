const session = require('express-session');
const multer = require('multer');
const path = require('path');
const User = require('./UsersDB');
const PostComment = require('./CommentsDB');
const { log } = require('console');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../src/uploads'));
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

class UserAdres {
    constructor(App) {
        this.App = App;
        this.App.use(session({
            secret: '473e1e9d07e812630e3fb097c782ff86a02eef184f6715c6e62c4d492d70bf50',
            resave: false,
            saveUninitialized: true
        }));
    };

    set() {
        this.mainPage();
        this.registerPage();
        this.registerMethod();
        this.authPage();
        this.authMethod();
        this.profilePage();
        this.profileMethod();
    };

    mainPage() {
        this.App.get('/', (req, res) => {
            const mainPage = path.join(__dirname, '../src/templates/ejs/main.ejs');
            res.render(mainPage, { req: req });
        });
    };

    registerPage() {
        this.App.get('/register', (req, res) => {
            const registerPage = path.join(__dirname, '../src/templates/ejs/register.ejs');
            res.render(registerPage);
        });
    };

    registerMethod() {
        this.App.post('/register', (req, res) => {
            const { login, password } = req.body;
            User.Register({ login, password }, (err, data) => {
                if (err) return res.send(`Error: ${err}`);
              
                const DefIcoPath = '/src/img/defico.svg';

                User.UpdIco(login, DefIcoPath, (err) => {
                  if (err) return res.send('Ошибка при установки Аватарки!');
                });

                res.redirect('/auth');
            });
        });
    };

    authPage() {
        this.App.get('/auth', (req, res) => {
            const authPage = path.join(__dirname, '../src/templates/ejs/auth.ejs');
            res.render(authPage);
        });
    };

    authMethod() {
        this.App.post('/auth', (req, res) => {
            const { login, password } = req.body;
            User.Auth(login, password, (err, data) => {
              if (err) return res.send(`Error: ${err}`);
          
              if (!data) {
                return res.send('Неверный Логин или Пароль!');
              }
              req.session.user = data;

              res.redirect(`/profile/${data.id}`);
              console.log('Успешно!');
            });
          });
    };

    profilePage() {
      this.App.get('/profile/:id', (req, res) => {
        const { id } = req.params;
    
        User.Get((err, users) => {
          if (err) {
            return res.send('Произошла ошибка при получении данных пользователя.');
          }
    
          const user = users.find((user) => user.id === Number(id));
    
          if (!user) {
            return res.send('Пользователь не найден!');
          }
    
          const ico = user.ico;
          const fullIcoPath = '/src/uploads/' + ico;
          const profilePage = path.join(__dirname, '../src/templates/ejs/profile.ejs');
          res.render(profilePage, { login: user.login, req: req, ico: fullIcoPath });
        });
      });
    };

      profileMethod() {
        this.App.post('/profile/:id', upload.single('ico') ,(req, res, next) => {
            const ico = req.file;
          

            if (!ico) {
                res.status(500).send('Error: invalid data');
                return;
            };
    
            User.UpdIco(req.session.user.login, ico.filename, (err) => {
                if (err) return next(err);

                PostComment.UpdateUserIcon(req.session.user.login, ico.filename, (err) => {
                  if (err) return next(err);
                  const { id } = req.params;
                  req.session.user.ico = ico.filename;
                  res.redirect(`/profile/${req.session.user.id}`);
                });
            });
        });
    };
};

module.exports.UserAdres = UserAdres;