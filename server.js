import express from "express";
import http from "http";
import serveStatic from "serve-static";
import path from "path";
const __dirname = path.resolve();
import cookieParser from "cookie-parser";
import expressSession from "express-session";
import bodyParser from "body-parser";

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

// Cookie parser setting
app.use(cookieParser());

// session Setting
app.use(
    expressSession({
        secret: "myPrivateKey",
        resave: true,
        saveUninitialized: true,
    })
);

app.post("/process/login", (req, res) => {
    console.log("Do Login ----");

    console.log(req.body.id);
    console.log(req.body.password);

    const paramID = req.body.id || req.query.id;
    const pw = req.body.password || req.query.id;

    if (req.session.user) {
        console.log("Already Login");
        res.redirect("/");
    } else {
        req.session.user = {
            id: paramID,
            pw: pw,
            name: "user_test_name",
            authorized: true,
        };
        res.redirect("/")
    }
})

app.get("/logout", (req, res) => {
    console.log("LOGOUT");

    if (req.session.user) {
        req.session.destroy((err) => {
            if(err) {
                console.log("세션 삭제 에러 발생");
                return;
            }
            console.log("세션 삭제 완료");
            res.redirect("/");
        });

    }else {
        console.log("로그인이 안돼있잖아");
        res.redirect("/login");
    }
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public/main.html'))
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, 'public/loginform.html'))
});

app.get("/example", (req, res) => {
    if(req.session.user) {
        res.sendFile(path.join(__dirname, 'public/example.html'))
    } else {
        res.redirect("/");
    }
});

const appServer = http.createServer(app);

appServer.listen(app.get("port"), () => {
    console.log(`${app.get("port")} runnung...`);
});