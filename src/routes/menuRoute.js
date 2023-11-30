const express = require("express")
const Auth = require("../middlewares/authtication");
const { createMenu,updateMenu ,getMenu, deleteMenu} = require("../controller/menuController");

const menuRoute = express.Router();

// create MENU api
menuRoute.post('/',Auth,createMenu);

// update MENU api
menuRoute.patch('/:id',Auth,updateMenu);

// delete MENU api
menuRoute.delete('/:id',Auth,deleteMenu);

// get MENU api
menuRoute.get('/',Auth,getMenu);


module.exports = menuRoute