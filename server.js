//서버를 띄우기 위한 기본셋팅(express Library 이용)
const express = require("express");
const app = express();
//method-override 적용
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
//css적용
app.use("/public", express.static("public"));

//env
require("dotenv").config();

//mongodb와 연결
const MongoClient = require("mongodb");
var db;
MongoClient.MongoClient.connect(process.env.DB_URL, function (err, client) {
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

  app.listen(process.env.PORT, function () {
    console.log("listening on 7777");
  });
});
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
  res.render("index.ejs");
});

app.get("/write", function (req, res) {
  res.render("write.ejs");
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
  res.redirect("/list");
  // res.send("전송완료");
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
      res.render("list.ejs", { posts: result }); //결과값 보내기
    });
});
//삭제
app.delete("/delete", function (req, res) {
  console.log(parseInt(req.body._id));
  var _id = parseInt(req.body._id); //ajax로 보낸 _id값이 담김 --> 문자열이라 정수로 바꿔줘야함
  db.collection("post").deleteOne({ _id }, function (err, result) {
    if (err) console.log(err);
    console.log("삭제완료");
    //성공 판정
    res.status(200).send({ message: "성공했습니다" }); //응답코드 200(ok-성공)보내주세요
  });
});
//디테일 페이지
app.get("/detail/:id", function (req, res) {
  //파라미터로 요청 URL많이 만들기 //파라미터의 :idx를 _id로
  db.collection("post").findOne(
    //id를 링크로보내줌
    { _id: parseInt(req.params.id) },
    function (err, result) {
      console.log(result);
      res.render("detail.ejs", { data: result }); //findOne의 결과를 data로 넘김
    }
  );
});

//수정하기
app.get("/edit/:id", function (req, res) {
  db.collection("post").findOne(
    { _id: parseInt(req.params.id) },
    function (err, result) {
      //찾은 결과를 여기로 보냄
      console.log(result);
      res.render("edit.ejs", { post: result });
    }
  );
});
app.put("/edit", function (req, res) {
  //form으로 보낸건 body
  db.collection("post").updateOne(
    { _id: parseInt(req.body.id) },
    { $set: { title: req.body.title, date: req.body.date } },
    function (err, result) {
      console.log("수정완료");
      res.redirect("/list");
    }
  );
});
