/* Load all models. */
var Gender = require('../models/Gender');
var Role = require('../models/Role');
var PaymentStatus = require('../models/PaymentStatus');
var PaymentType = require('../models/PaymentType');

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
		var paymentStatusObj = req.body;
		PaymentStatus.update(paymentStatusObj, res);
	});
}

var PaymentTypeAPIs = function(express){
    //get all payment types.
	express.get('/paymenttypes', function (req, res) {
		PaymentType.getAll(res);
	});

	//get a single payment type.
	express.get('/paymenttypes/:id', function (req, res) {
		var id = req.params.id;
		PaymentType.getOne(id, res);
	});

	//create new payment type.
	express.post('/paymenttypes', function (req, res) {
		var paymentMethodObj = req.body;
		PaymentType.create(paymentMethodObj, res);
	});

	//update new payment type.
	express.put('/paymenttypes', function (req, res) {
		var paymentMethodObj = req.body;
		PaymentType.update(paymentMethodObj, res);
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
        PaymentTypeAPIs(apiRoutes);
    },
    configureAllViews: function(app){

    }
};