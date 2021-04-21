const express = require('express')
const app = express()
const port = 5000

const config = require('./config/key');

const bodyParser = require('body-parser');
const { User } = require("./models/User");


//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

//application/json
app.use(bodyParser.json());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected...!'))
    .catch(err => console.log(err))





app.get('/', (req, res) => {
  res.send('Hello World!!!!')
})

app.post('/register', (req, res) => {
    //회원 가입 필요한 정보 client에서 가져오면 DB에 넣어준다.
    const user = new User(req.body)

    user.save((err, userInfo) => {
        if(err) return res.json({ sucess: false, err})
        return res.status(200).json({
            sucess: true
        })
    })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})