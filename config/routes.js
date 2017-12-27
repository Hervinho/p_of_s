/* Load all models. */
var Gender = require('../models/Gender');
var Role = require('../models/Role');
var PaymentStatus = require('../models/PaymentStatus');
var PaymentType = require('../models/PaymentType');
var ProductType = require('../models/ProductType');
var PromotionStatus = require('../models/PromotionStatus');
var CustomerOrderStatus = require('../models/CustomerOrderStatus');
var CustomerOrder = require('../models/CustomerOrder');
var Shift = require('../models/Shift');
var Employee = require('../models/Employee');
var Customer = require('../models/Customer');
var Product = require('../models/Product');
var Supplier = require('../models/Supplier');

//global variables.
var employeeCode, roleID;

//check if user is logged in before displaying the pages.
//It will do so by checking if the session cookie exists
function isUserLoggedIn(req, res, next) {
	if (!req.PhemePointOfSaleProjectSession.employee) {
		res.redirect('/');
	} else {
		//Get role ID from session cookie
		roleID = req.PhemePointOfSaleProjectSession.employee.role_id;

		//Get username from session cookie
		employeeCode = req.PhemePointOfSaleProjectSession.employee.employee_code;
		next();
	}
};

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
};

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
};

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
};

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
};

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
};

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
};

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
};

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
};

var ShiftAPIs = function(express){
	//get all shifts.
	express.get('/shifts', function (req, res) {
		Shift.getAll(res);
	});

	//get a specific shift.
	express.get('/shifts/:id', function (req, res) {
		var shiftId = req.params.id;
		Shift.getOne(shiftId, res);
	});

	//create new shift.
	express.post('/shifts', function (req, res) {
		var shiftObj = req.body;
		Shift.create(shiftObj, res);
	});

	//update order status
	express.put('/shifts', function (req, res) {
		var shiftObj = req.body;
		Shift.update(shiftObj, res);
	});
};

var EmployeeAPIs = function(express){
	//get all employees.
	express.get('/employees', function (req, res) {
		Employee.getAll(res);
	});

	//get all employees of a certain status.
	express.get('/employees/statuses/:id', function (req, res) {
		var statusId = req.params.id;
		Employee.getByStatus(statusId, res);
	});

	//get a specific employee.
	express.get('/employees/:id', function (req, res) {
		var employeeId = req.params.id;
		Employee.getOne(employeeId, res);
	});

	//create new employee.
	express.post('/employees', function (req, res) {
		var employeeObj = req.body;
		Employee.create(employeeObj, res);
	});

	//update order employee
	express.put('/employees', function (req, res) {
		var employeeObj = req.body;
		Employee.update(employeeObj, res);
	});

	//login.
	express.post('/employees/login', function (req, res) {
		Employee.login(req, res);
	});
};

var CustomerAPIs = function(express){
	//get all customers.
	express.get('/customers', function (req, res) {
		Customer.getAll(res);
	});

	//get a specific customer.
	express.get('/customers/:id', function (req, res) {
		var customerId = req.params.id;
		Customer.getOne(customerId, res);
	});

	//create new customer.
	express.post('/customers', function (req, res) {
		var customerObj = req.body;
		Customer.create(customerObj, res);
	});

	//update customer
	express.put('/customers', function (req, res) {
		var customerObj = req.body;
		Customer.update(customerObj, res);
	});
};

var ProductAPIs = function(express){
	//get all products.
	express.get('/products', function (req, res) {
		Product.getAll(res);
	});

	//get a specific product.
	express.get('/products/:id', function (req, res) {
		var productId = req.params.id;
		Product.getOne(productId, res);
	});

	//create new product.
	express.post('/products', function (req, res) {
		var productObj = req.body;
		Product.create(productObj, res);
	});

	//update product.
	express.put('/products', function (req, res) {
		var productObj = req.body;
		Product.update(productObj, res);
	});
};

var SupplierAPIs = function(express){
	//get all suppliers.
	express.get('/suppliers', function (req, res) {
		Supplier.getAll(res);
	});

	//get a specific supplier.
	express.get('/suppliers/:id', function (req, res) {
		var supplierId = req.params.id;
		Supplier.getOne(supplierId, res);
	});

	//create new supplier.
	express.post('/suppliers', function (req, res) {
		var supplierObj = req.body;
		Supplier.create(supplierObj, res);
	});

	//update product.
	express.put('/suppliers', function (req, res) {
		var supplierObj = req.body;
		Supplier.update(supplierObj, res);
	});
};

/*********** Views Configurations ************/
/* ---------------------------------------- */

var configViews = function(express){
	//Login Page (index)
	express.get('/', function (req, res) {
		res.render('index');
	});
};

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
		ShiftAPIs(apiRoutes);
		EmployeeAPIs(apiRoutes);
		CustomerAPIs(apiRoutes);
		ProductAPIs(apiRoutes);
		SupplierAPIs(apiRoutes);
	},
	configureAllViews: function (app) {
		configViews(app);
	}
};