//jshint esversion:6

const port = 3000;
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

// mongoose.connect("mongodb://localhost:27017/todolistDB");
mongoose.connect("mongodb+srv://admin:dominum110@cluster0.j5gtork.mongodb.net/todolistDB");

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
})
const item2 = new Item({
    name: "Hit the plus button to add a new item."
})

const defaultItems = [item1, item2];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {

    //Adding and reading data from db
    Item.find({}, function(err, foundItems){
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function(err){
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully saved default items to DB.");
                }
            });
        } else {
            res.render("list", {listTitle: "Today", newListItems: foundItems});
        }
    });
});

app.get("/:customListName", function(req, res){
    const customListName = _.lowerCase(req.params.customListName);

    List.findOne({name: customListName}, function(err, foundList){
        if (!err){
            if (!foundList){
                //Create a new list
                console.log("Doesn't exist!");
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            } else {
                //Show an existing list
                console.log("Exists!");
                res.render("List", {listTitle: foundList.name, newListItems: foundList.items});
            }
        }
    })
});

app.post("/", function (req, res) {
    //Adding a new data to db
    // 
    // const item = new Item({
    //     name: itemName
    // });

    // item.save();
    // res.redirect("/");

    // ==== Testing new route
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName === "Today"){
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
});

//Deleting item from db
app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today"){
        Item.findByIdAndRemove(checkedItemId, function(err){
            if (!err){
                console.log("Successfully deleted checked item.");
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
            if (!err){
                res.redirect("/" + listName);
            } else{}
        });
    }

    // Item.findByIdAndRemove(checkedItemId, function(err){
    //     if (!err){
    //         console.log("Successfully deleted checked item.");
    //         res.redirect("/");
    //     }
    // });
});

app.get("/work", function (req, res) {
    res.render("list", {
        listTitle: "Work List",
        newListItem: workItems
    });
});

app.listen(port, function () {
    console.log("Server listening on port " + port)
});