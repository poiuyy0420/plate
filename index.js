const express = require("express");
const app = express();
const port = 5000;

const config = require("./config/key");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { auth } = require("./middleware/auth");
const { User } = require("./models/User");

//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//application/json
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require("mongoose");
mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("MongoDB Connected...!"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World!!!!");
});

app.post("/api/users/register", (req, res) => {
  //회원 가입 필요한 정보 client에서 가져오면 DB에 넣어준다.
  const user = new User(req.body);

  user.save((err, userInfo) => {
    if (err) return res.json({ sucess: false, err });
    return res.status(200).json({
      sucess: true,
    });
  });
});

app.post("/api/users/login", (req, res) => {
  //요청된 이메일을 DB에서 찾음
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSucess: false,
        massage: "제공된 이메일에 해당하는 유저가 없습니다.",
      });
    }

    //요청된 이메일이 DB에 있다면 비밀번호가 맞는 비밀번호인지 확인
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({
          loginSucess: false,
          massage: "비밀번호가 틀렸습니다.",
        });

      //비밀번호가 맞다면 토큰을 생성하기
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        // 토큰을 저장 -> 쿠키
        res
          .cookie("x_auth", user.token)
          .status(200)
          .json({ loginSucess: true, userId: user._id });
      });
    });
  });
});

app.get("/api/users/auth", auth, (req, res) => {
  //auth Ture
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role == 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

app.get("/api/users/logout", auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
    if (err) return res.json({ sucess: false, err });
    return res.status(200).send({
      sucess: true,
    });
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
