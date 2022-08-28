const express = require('express');
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-Parser');
const db = require('./db/config');
const session = require('express-session');
const serveStatic = require('serve-static');
const cors = require('cors');
const FileStore = require('session-file-store')(session);

var __dirname = path.resolve();
const app = express();



app.set("port", 5000);

// static file read setting
app.use(serveStatic(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: false,
    })
);

//set cors
app.use(cors({
    origin: true,
    credentials : true
}))

// Cookie parser setting
app.use(cookieParser());

// session Setting
app.use(
    session({
      key: "User_Session",
      secret: "secret_key123",
      resave: false,
      saveUninitialized: true,
      store: new FileStore(),
      cookie : {
        expires: 60*80*24,
      },
    })
  );









app.post("/process/register", (req, res) => {
    const id = req.body.id;
    const pw = req.body.password;
    const email = req.body.email;

    db.query('select * from users');

    db.query('select * from users where user_id=?', [id], (err, data) => {
        if (data.length == 0) {
            db.query('insert into users(user_id, user_pw, user_email) value(?,?,?)', [id,pw,email]);
            console.log('회원가입 성공');
            res.redirect('/');
        } else {
            console.log('ID 중복');
            res.writeHead(200, {'Content-Type':'text/html; charset UTF-8'});
            res.write('<script>alert("ID 중복");</script>');
            res.write('<script>location.href="/"</script>');
        }
    })
});

app.post("/process/login", (req, res) => {
    const id = req.body.id;
    const pw = req.body.password;

    if (id && pw) {
        db.query('select * from users where user_id=? and user_pw=?', [id,pw], (err, data) => {
            if (err) {
                console.log('로그인 실패');
                res.writeHead(200, {'Content-Type':'text/html; charset UTF-8'});
                res.write('<script>alert("Login Failed");</script>');
                res.write('<script>location.href="/"</script>');
            }
            if (data.length > 0) {
                req.session.userId = id
                req.session.logined = true;
                req.session.save(err => {})
                res.writeHead(200, {'Content-Type':'text/html; charset UTF-8'});
                res.write('<script>alert("Login Success!!!!!");</script>');
                res.write('<script>location.href="/"</script>');
                console.log(req.session);
            } else {
                res.write('<script>alert("wrong");</script>');
                res.write('<script>location.href="/"</script>');
            }
        })
    }
});






app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public/main.html'))
});

app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, 'public/registerform.html'))
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, 'public/loginform.html'))
});

app.get("/onlylogin", (req, res) => {
    if(req.session.logined) {
        res.sendFile(path.join(__dirname, 'public/only.html'))
    } else {
        res.write('<script>alert("Login First");</script>');
        res.write('<script>location.href="/"</script>');
    }
});




const appServer = http.createServer(app);

appServer.listen(app.get("port"), () => {
    console.log(`${app.get("port")} runnung...`);
});