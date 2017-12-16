/* Load all models. */
var Gender = require('../models/Gender');
var Role = require('../models/Role');
var PaymentStatus = require('../models/PaymentStatus');

/*********** APIs Configurations ************/
/* ---------------------------------------- */

var GenderAPIs = function(express){
    //get all genders.
	express.get('/genders', function (req, res) {
		Gender.getAll(res);
	});

	//get a single gender.
	express.get('/genders/:id', function (req, res) {
		var id = req.params.id;
		Gender.getOne(id, res);
	});

	//create new gender.
	express.post('/genders', function (req, res) {
		var genderObj = req.body;
		Gender.create(genderObj, res);
	});

	//update new gender.
	express.put('/genders', function (req, res) {
		var genderObj = req.body;
		Gender.update(genderObj, res);
	});
}

var RoleAPIs = function(express){
    //get all roles.
	express.get('/roles', function (req, res) {
		Role.getAll(res);
	});

	//get a single role.
	express.get('/roles/:id', function (req, res) {
		var id = req.params.id;
		Role.getOne(id, res);
	});

	//create new role.
	express.post('/roles', function (req, res) {
		var roleObj = req.body;
		Role.create(roleObj, res);
	});

	//update new role.
	express.put('/roles', function (req, res) {
		var roleObj = req.body;
		Role.update(roleObj, res);
	});
}

var PaymentStatusAPIs = function(express){
    //get all payment statuses.
	express.get('/paymentstatuses', function (req, res) {
		PaymentStatus.getAll(res);
	});

	//get a single payment status.
	express.get('/paymentstatuses/:id', function (req, res) {
		var id = req.params.id;
		PaymentStatus.getOne(id, res);
	});

	//create new payment status.
	express.post('/paymentstatuses', function (req, res) {
		var paymentStatusObj = req.body;
		PaymentStatus.create(paymentStatusObj, res);
	});

	//update new payment status.
	express.put('/paymentstatuses', function (req, res) {
		var roleObj = req.body;
		PaymentStatus.update(roleObj, res);
	});
}

/*********** Views Configurations ************/
/* ---------------------------------------- */


/*********** Export all models and functions ************/
/* ---------------------------------------------------- */

module.exports = {
    configureAllAPIs: function (apiRoutes){
        GenderAPIs(apiRoutes);
        RoleAPIs(apiRoutes);
        PaymentStatusAPIs(apiRoutes);
    },
    configureAllViews: function(app){

    }
};