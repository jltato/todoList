//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require("lodash")

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

// ------ Connect to de Database ---------//
mongoose.connect('mongodb+srv://jltato:Tato1982@cluster0.wv6ykor.mongodb.net/todoListDB');

// ----------- Gloval Definitions --------//
const day = date.getDate();

// --------- Main Items definition -------//
const itemSchema = mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", itemSchema);



const buyFood = new Item({
  name: "Buy Food"
});
const cookFood = new Item({
  name: "cook Food"
});

let foundItems = [];
const workItems = [];

//--------- List Model ------------//
const listSchema ={
  name : String,
  items: [itemSchema]
};
const List = mongoose.model("List", listSchema);


//--------- Home page! -------------//

app.get("/", function (req, res) {

  Item.find({})
    .then((result) => {
      foundItems = result;
      if (foundItems.length === 0) {
        Item.insertMany([buyFood, cookFood])

          .then((result) => {
            
          }).catch(
            (err) => {
              console.log(err);
            }
          )
        res.redirect("/");
      } else {
        res.render("list", {
          listTitle: day,
          newListItems: foundItems
        });

      }
    })
    .catch(
      (err) => {
        console.log(err);
      });

});

// ----------- Add new Item to the lists ----------------//
app.post("/", function (req, res) {

  const item = req.body.newItem;
  const nameList = req.body.list;
  const newItem = new Item({
    name: item
  })

  if (nameList === day) {
    newItem.save();
    res.redirect("/");
  } else {
    let itemArray = [];
    List.findOne({
      name: nameList
    }).then(
      (result) => {
        result.items.push(newItem);
        result.save();
        
      }
    ).then(
      (result)=>{
        res.redirect("/" + nameList)
      }
    )
  }
})

// ------- Delete items -------------//
app.post("/delete", function (req, res) {
  const itemId = req.body.checkbox;
  const nameList = req.body.title;
  
if (nameList===day) {
    Item.findByIdAndDelete(itemId)
      .then((result)=>{
        res.redirect("/");
      }).catch((err)=>{console.log(err)})
} else {
    List.findOneAndUpdate({name:nameList}, {$pull:{items: {_id: itemId}}}).then(
      (result)=>{
           
            res.redirect("/" + nameList)
       
         }
    ).catch(
      (err)=>{console.log(err);}
    )
}
});


// ----------- New list -----------------//
app.get("/:newList", function (req, res) {

      const listTitle = _.capitalize(req.params.newList);
      List.findOne({
        name: listTitle
      }).then(
        (result) => {

          if (result !== null) {

            const list = result;
            res.render("list", {
              listTitle: list.name,
              newListItems: list.items
            });
          } else {
            const list = new List({
              name: listTitle,
              items: []
            })
            list.save();
            res.redirect("/" + listTitle);
          }

        }
      ).catch((err) => {

      })
});


// -----------Abaut page -------------//
app.get("/about", function (req, res) {
  res.render("about");
});

// ------- Server start ---------//

app.listen(3000, function () {
  console.log("Server started on port 3000");
});