/* Load all models. */
var Gender = require('../models/Gender');
var Role = require('../models/Role');
var PaymentStatus = require('../models/PaymentStatus');
var PaymentType = require('../models/PaymentType');
var ProductType = require('../models/ProductType');
var PromotionStatus = require('../models/PromotionStatus');
var CustomerOrderStatus = require('../models/CustomerOrderStatus');
var CustomerOrder = require('../models/CustomerOrder');

/*********** APIs Configurations ************/
/* ---------------------------------------- */

var GenderAPIs = function (express) {
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

var RoleAPIs = function (express) {
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

var PaymentStatusAPIs = function (express) {
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

var PromotionStatusAPIs = function (express) {
	//get all promotion statuses.
	express.get('/promotionstatuses', function (req, res) {
		PromotionStatus.getAll(res);
	});

	//get a single promotion status.
	express.get('/promotionstatuses/:id', function (req, res) {
		var id = req.params.id;
		PromotionStatus.getOne(id, res);
	});

	//create new promotion status.
	express.post('/promotionstatuses', function (req, res) {
		var promotionStatusObj = req.body;
		PromotionStatus.create(promotionStatusObj, res);
	});

	//update promotion status.
	express.put('/promotionstatuses', function (req, res) {
		var promotionStatusObj = req.body;
		PromotionStatus.update(promotionStatusObj, res);
	});
}

var CustomerOrderStatusAPIs = function (express) {
	//get all customer order statuses.
	express.get('/cust_orderstatuses', function (req, res) {
		CustomerOrderStatus.getAll(res);
	});

	//get a single promotion status.
	express.get('/cust_orderstatuses/:id', function (req, res) {
		var id = req.params.id;
		CustomerOrderStatus.getOne(id, res);
	});

	//create new promotion status.
	express.post('/cust_orderstatuses', function (req, res) {
		var customerOrderStatusObj = req.body;
		CustomerOrderStatus.create(customerOrderStatusObj, res);
	});

	//update promotion status.
	express.put('/cust_orderstatuses', function (req, res) {
		var customerOrderStatusObj = req.body;
		CustomerOrderStatus.update(customerOrderStatusObj, res);
	});
}

var PaymentTypeAPIs = function (express) {
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

var ProductTypeAPIs = function (express) {
	//get all product types.
	express.get('/producttypes', function (req, res) {
		ProductType.getAll(res);
	});

	//get a single prduct type.
	express.get('/producttypes/:id', function (req, res) {
		var id = req.params.id;
		ProductType.getOne(id, res);
	});

	//create new payment type.
	express.post('/producttypes', function (req, res) {
		var productTypeObj = req.body;
		ProductType.create(productTypeObj, res);
	});

	//update new payment type.
	express.put('/producttypes', function (req, res) {
		var productTypeObj = req.body;
		ProductType.update(productTypeObj, res);
	});
}

var CustomerOrderAPIs = function (express) {
	//get all customer orders.
	express.get('/customerorders', function (req, res) {
		CustomerOrder.getAll(res);
	});

	//get all orders for a specific customer.
	express.get('/customerorders/customers/:id', function (req, res) {
		var customerId = req.params.id;
		CustomerOrder.getAllPerCustomer(customerId, res);
	});

	//get a specific order.
	express.get('/customerorders/:id', function (req, res) {
		var orderId = req.params.id;
		CustomerOrder.getOne(orderId, res);
	});

	//create new customer order.
	express.post('/customerorders', function (req, res) {
		var orderObj = req.body;
		orderObj.orderItems = [{
			product_id: 1,
			product_quantity: 1,
			amount: 10
		}, {
			product_id: 2,
			product_quantity: 2,
			amount: 50
		}]; //just for testing until UI is ready
		CustomerOrder.create(orderObj, res);
	});

	//update order status
	express.put('/customerorders', function (req, res) {
		var orderObj = req.body;
		CustomerOrder.updateStatus(orderObj, res);
	});
}

/*********** Views Configurations ************/
/* ---------------------------------------- */


/*********** Export all models and functions ************/
/* ---------------------------------------------------- */

module.exports = {
	configureAllAPIs: function (apiRoutes) {
		GenderAPIs(apiRoutes);
		RoleAPIs(apiRoutes);
		PaymentStatusAPIs(apiRoutes);
		PaymentTypeAPIs(apiRoutes);
		ProductTypeAPIs(apiRoutes);
		PromotionStatusAPIs(apiRoutes);
		CustomerOrderStatusAPIs(apiRoutes);
		CustomerOrderAPIs(apiRoutes);
	},
	configureAllViews: function (app) {

	}
};