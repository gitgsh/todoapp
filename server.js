//서버를 띄우기 위한 기본셋팅(express Library 이용)
const express = require("express");
const app = express();

//mongodb와 연결
const MongoClient = require("mongodb");
var db;
MongoClient.MongoClient.connect(
  "mongodb+srv://admin:qwer1234@cluster0.wixin.mongodb.net/Cluster0?retryWrites=true&w=majority",
  function (err, client) {
    //포트번호, 서버 띄운후 실행할 코드
    if (err) return console.log(err);

    db = client.db("todoapp"); //todoapp 이라는 database에 연결
    //database안의 post라는 collection에 하나 insert하겠다
    // db.collection("post").insertOne(
    //   { name: "차은우", age: 25, _id: 777 },
    //   function (err, result) {
    //     console.log("저장완료");
    //   }
    // );

    app.listen(7777, function () {
      console.log("listening on 7777");
    });
  }
);
//EJS 사용
app.set("view engine", "ejs");
//body-parser
app.use(express.urlencoded({ extended: true }));

app.get("/pet", function (req, res) {
  res.send("펫 용품 쇼핑할 수 있는 페이지입니다.");
});

app.get("/beauty", function (req, res) {
  res.send("뷰티용품을 쇼핑할 수 있는 페이지입니다.");
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/write", function (req, res) {
  res.sendFile(__dirname + "/write.html");
});
//todo title, date db에 저장하기
app.post("/add", (req, res) => {
  //총게시물갯수를 가지고 와서
  db.collection("counter").findOne(
    { name: "게시물갯수" }, //name이 게시물갯수인 데이터를 찾아주세요, 찾으면 콜백함수실행
    function (err, result) {
      console.log(result.totalPost);
      var totalPost = result.totalPost; //이게 끝나면

      db.collection("post").insertOne(
        //유니크한 글번호를 달아서 저장하자
        //완료되면 totalPost가지고와서 +1
        { _id: totalPost + 1, title: req.body.title, date: req.body.date },
        function (err, result) {
          console.log("저장완료");
        }
      );
    }
  );
  //counter totalPost안에 있는 숫자(0)도 증가시켜야함
  //UPDATE
  //{$set:{}}, { $inc: {}}
  db.collection("counter").updateOne(
    { name: "게시물갯수" },
    { $inc: { totalPost: 1 } },
    function (err, result) {
      if (err) return console.log(err);
      console.log(result.totalPost);
    }
  );

  res.send("전송완료");
});
//리스트 뽑기
app.get("/list", function (req, res) {
  //모든 데이터 가져오기
  db.collection("post")
    .find()
    .toArray(function (err, result) {
      if (err) console.log(err);
      //console.log(result);
      //함수안에서만 작동함
      res.render("list.ejs", { posts: result });
    });
});
