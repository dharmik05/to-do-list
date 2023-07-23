//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://dharmik5062:test123@cluster0.srtnple.mongodb.net/todolistDB")

const itemSchema = {
  name: String
}

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item ({
  name: "Welcome to your todolist!"
})

const item2 = new Item ({
  name: "Hit + to add new items."
})

const item3 = new Item ({
  name: "<-- Hit this to delete an item."
})

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("list", listSchema);

app.get("/", (req, res) =>  {

  Item.find({})
    .then((foundItems) => {

      if (foundItems.length === 0) {
        Item.insertMany(defaultItems)
          .then(() => {
            console.log("Items saved.");
          })
          .catch((err) => {
            console.log(err);
          })
          res.redirect("/");
      }else {
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
      
    })
    .catch((err) => {
      console.log(err);
    })

});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName})
    .then((foundList) => {
      if(!foundList){
        const list = new List ({
          name: customListName,
          items: defaultItems
        })
        list.save();
        res.redirect("/"+customListName);
      }else{
        res.render("list", {listTitle: customListName, newListItems: foundList.items})
      }
    })
    .catch((err) => {
      console.log(err);
    })

  
  
})

app.post("/", (req, res) => {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  
  const item = new Item ({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  }else {
    List.findOne({name: listName})
      .then((foundList) => {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
      })
  }
  
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId)
    .then((value) => {
      console.log("Removed"+value)
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    })
  }else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
      .then(() => {
        res.redirect("/"+listName);
      })
      .catch((err => {
        console.log(err);
      }))
  }
  
})

app.get("/about", (req, res) => {
  res.render("about");
});


let port = process.env.PORT;
if(port == null || port == "") {
  port = 3000;
}

app.listen(3000, () => {
  console.log("Server has started on port 3000");
});
