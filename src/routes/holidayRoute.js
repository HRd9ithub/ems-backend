const express = require("express")
const Auth = require("../middlewares/authtication");
const expressValidator = require("express-validator");
const { createHoliday, getHoliday, deleteHoliday,updateHoliday } = require("../controller/holidayController");
const { holidayPermission } = require("../middlewares/permission");

const holidayRoute = express.Router();

// create Holiday api
holidayRoute.post('/', Auth,holidayPermission,
[expressValidator.body('date', "Invalid Date format.Please enter the date in the format 'YYYY-MM-DD'.").isDate({ format: 'YYYY-MM-DD' }),
 expressValidator.body("name","Holiday name is Required.").notEmpty(),
 expressValidator.body("day","Day is Required.").notEmpty()
],createHoliday);

// update Holiday api
holidayRoute.put('/:id', Auth,holidayPermission,
[expressValidator.body('date', "Invalid Date format.Please enter the date in the format 'YYYY-MM-DD'.").isDate({ format: 'YYYY-MM-DD' }),
 expressValidator.body("name","Holiday name is Required.").notEmpty(),
 expressValidator.body("day","Day is Required.").notEmpty()
],updateHoliday);

// delete Holiday api
holidayRoute.delete('/:id',Auth,holidayPermission,deleteHoliday);

// get Holiday api
holidayRoute.get('/',Auth,holidayPermission,getHoliday);


module.exports = holidayRoute;