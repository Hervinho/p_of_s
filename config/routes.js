/* Load all models. */
var Gender = require('../models/Gender');
var Role = require('../models/Role');
var Audit = require('../models/Audit');
var PaymentStatus = require('../models/PaymentStatus');
var PaymentType = require('../models/PaymentType');
var ProductType = require('../models/ProductType');
var ProductStatus = require('../models/ProductStatus');
var ProductSize = require('../models/ProductSize');
var PromotionStatus = require('../models/PromotionStatus');
var CustomerOrderStatus = require('../models/CustomerOrderStatus');
var CustomerOrderDetails = require('../models/CustomerOrderDetails');
var CustomerOrder = require('../models/CustomerOrder');
var Shift = require('../models/Shift');
var Employee = require('../models/Employee');
var Customer = require('../models/Customer');
var Product = require('../models/Product');
var Supplier = require('../models/Supplier');
var EmployeeStatus = require('../models/EmployeeStatus');
var Promotion = require('../models/Promotion');
var ShiftBooking = require('../models/ShiftBooking');
var ShiftBookingStatus = require('../models/ShiftBookingStatus');
var LoginRecord = require('../models/LoginRecord');
var BaseType = require('../models/BaseType');
var AccountType = require('../models/AccountType');
var CardPayment = require('../models/CardPayment');
var Topping = require('../models/Topping');

//global variables.
var employeeID, employeeCode, roleID, profileObject, shiftMessage, 
	roleMessage = "You do not have privileges to perform this operation";

//check if user is logged in before displaying the pages.
//It will do so by checking if the session cookie exists
function isUserLoggedIn(req, res, next) {
	if (!req.PhemePointOfSaleProjectSession.employee) {
		res.redirect('/');
	} else {
		//Get employee object.
		profileObject = req.PhemePointOfSaleProjectSession.employee;

		//Get employee ID from session cookie
		employeeID = req.PhemePointOfSaleProjectSession.employee.employee_id;

		//Get role ID from session cookie
		roleID = req.PhemePointOfSaleProjectSession.employee.employee_role_id;

		//Get username from session cookie
		employeeCode = req.PhemePointOfSaleProjectSession.employee.employee_code;
		next();
	}
};

/*********** APIs Configurations ************/
/* ---------------------------------------- */

var AuditAPIs = function(express){
	//get all audits.
	express.get('/audits', function (req, res) {
		Audit.getAll(res);
	});

	//get a single audits.
	express.get('/audits/:id', function (req, res) {
		var id = req.params.id;
		Audit.getOne(id, res);
	});

	//create new audits.
	express.post('/audits', function (req, res) {
		var auditObj = req.body;
		Audit.create(auditObj, res);
	});
};

var CardPaymentAPIs = function(express){
	//get all details of all bank cards used for orders.
	express.get('/bankcards', function (req, res) {
		CardPayment.getAll(res);
	});

	//get all details of all bank cards used for a certain order.
	express.get('/bankcards/orders/:id', function (req, res) {
		var orderId = req.params.id;
		CardPayment.getOnePerOrder(orderId, res);
	});
};

var AccountTypeAPIs = function(express){
	//get all account types.
	express.get('/accounttypes', function (req, res) {
		AccountType.getAll(res);
	});
};

var BaseTypeAPIs = function(express){
	//get all base types.
	express.get('/basetypes', function (req, res) {
		BaseType.getAll(res);
	});

	//get a single base type.
	express.get('/basetypes/:id', function (req, res) {
		var id = req.params.id;
		BaseType.getOne(id, res);
	});

	//create base type.
	express.post('/basetypes', function (req, res) {
		var toppingObj = req.body;
		BaseType.create(toppingObj, res);
	});

	//update base type.
	express.put('/basetypes', function (req, res) {
		var toppingObj = req.body;
		BaseType.update(toppingObj, res);
	});
};

var ToppingAPIs = function(express){
	//get all toppings.
	express.get('/toppings', function (req, res) {
		Topping.getAll(res);
	});

	//get a single topping.
	express.get('/toppings/:id', function (req, res) {
		var id = req.params.id;
		Topping.getOne(id, res);
	});

	//create topping.
	express.post('/toppings', function (req, res) {
		var toppingObj = req.body;
		Topping.create(toppingObj, res);
	});

	//update topping.
	express.put('/toppings', function (req, res) {
		var toppingObj = req.body;
		Topping.update(toppingObj, res);
	});
};

var ShiftBookingStatusAPIs = function(express){
	//get all booking statuses.
	express.get('/bookingstatuses', function (req, res) {
		ShiftBookingStatus.getAll(res);
	});
};

var ShiftBookingAPIs = function (express) {
	//get all shift bookings.
	express.get('/shiftbookings', function (req, res) {
		ShiftBooking.getAll(res);
	});

	//get all bookings of specific shift.
	express.get('/shiftbookings/shifts/:id', function (req, res) {
		var shiftId = req.params.id;
		ShiftBooking.getPerShift(shiftId, res);
	});

	//get all shifts of a certain status. (booked/cancelled)
	express.get('/shiftbookings/statuses/:id', function (req, res) {
		var statusId = req.params.id;
		ShiftBooking.getPerStatus(statusId, res);
	});

	//get all bookings of a specific employee.
	express.get('/shiftbookings/employees/:id', function (req, res) {
		var employeeId = req.params.id;
		ShiftBooking.getPerEmployee(employeeId, res);
	});

	//check if employee has booked for shift on a specific day.
	//Used to TEST allowing/denying employee from placing orders.
	express.get('/shiftbookings/check/employees/:id', function (req, res) {
		var employeeId = req.params.id;
		ShiftBooking.checkShiftForEmployee(employeeId, res);
	});

	//get a specific shift bookings.
	express.get('/shiftbookings/:id', function (req, res) {
		var bookingId = req.params.id;
		ShiftBooking.getOne(bookingId, res);
	});

	//book a shift.
	express.post('/shiftbookings', function (req, res) {
		var bookingObj = req.body;
		bookingObj.employee_id = employeeID;
		ShiftBooking.create(bookingObj, res);
		
	});

	//update a shift booking.
	express.put('/shiftbookings', function (req, res) {
		var bookingObj = req.body;
		
		if(bookingObj.employee_id == employeeID){//employee updates a shift for him/herself ONLY!!
			ShiftBooking.update(bookingObj, res);
		}
		else{
			res.json({
				status:0, message: 'You cannot update a booking on behalf of someone else.'
			});
			return;
		}
		//ShiftBooking.update(bookingObj, res);
	});
};

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

var EmployeeStatusAPIs = function (express) {
	//get all employee statuses.
	express.get('/employeestatuses', function (req, res) {
		EmployeeStatus.getAll(res);
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

var PromotionAPIs = function(express){
	//get all promotions.
	express.get('/promotions', function (req, res) {
		Promotion.getAll(res);
	});

	//get get all promotions of a certain status.
	express.get('/promotions/statuses/:id', function (req, res) {
		var id = req.params.id;
		Promotion.getPerStatus(id, res);
	});

	//get all promotions of a certain product.
	express.get('/promotions/products/:id', function (req, res) {
		var id = req.params.id;
		Promotion.getPerProduct(id, res);
	});

	//get a specific promotion.
	express.get('/promotions/:id', function (req, res) {
		var id = req.params.id;
		Promotion.getOne(id, res);
	});

	//create promotion. Only by Admin
	express.post('/promotions', function (req, res) {
		var promotionObj = req.body;
		if(roleID == 1){
			promotionObj.employee_id = employeeID;
			Promotion.create(promotionObj, res);
		}
		else{
			res.json({
				status: 0,
				message: roleMessage
			});
		}
		//Just for testing
		/*promotionObj.products = [{product_id:1}, {product_id:2}];
		promotionObj.employee_id = 1;
		Promotion.create(promotionObj, res);*/
	});

	//update promotion. Only by Admin
	express.put('/promotions', function (req, res) {
		var promotionObj = req.body;
		if(roleID == 1){
			promotionObj.employee_id = employeeID;
			Promotion.update(promotionObj, res);
		}
		else{
			res.json({
				status: 0,
				message: roleMessage
			});
		}
		//just for testing.
		/*promotionObj.products = [{product_id: 3}, {product_id: 4}];
		Promotion.update(promotionObj, res);*/
	});

	//Activate/deactivate promotion. Only by Admin
	express.put('/promotions/statuses', function (req, res) {
		var promotionObj = req.body;
		if(roleID == 1){
			promotionObj.employee_id = employeeID;
			Promotion.updateStatus(promotionObj, res);
		}
		else{
			res.json({
				status: 0,
				message: roleMessage
			});
		}
	});
};

var LoginRecordAPIs = function(express){
	//get all login records..
	express.get('/loginrecords', function (req, res) {
		LoginRecord.getAll(res);
	});

	//get all login records of a specific employee.
	express.get('/loginrecords/employees/:id', function (req, res) {
		var employeeId = req.params.id;
		LoginRecord.getPerEmployee(employeeId, res);
	});

	//get all login records for a specific date.
	express.get('/loginrecords/date/:date', function (req, res) {
		var date = req.params.date;
		LoginRecord.getPerDate(date, res);
	});

	//get all login records for shift on a specific date.
	express.get('/loginrecords/shifts/:id/date/:date', function (req, res) {
		var recordObj = {
			shift_id: req.params.id,
			date: req.params.date
		};
		LoginRecord.getPerDayAndShift(recordObj, res);
	});

	//get all login records between date range.
	express.get('/loginrecords/datefrom/:from/dateto/:to', function (req, res) {
		var recordObj = {
			date_from: req.params.from,
			date_to: req.params.to
		};
		LoginRecord.getPerFromDateToDate(recordObj, res);
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

var ProductSizeAPIs = function (express) {
	//get all product sizes.
	express.get('/productsizes', function (req, res) {
		ProductSize.getAll(res);
	});

	//get a single product size.
	express.get('/productsizes/:id', function (req, res) {
		var id = req.params.id;
		ProductSize.getOne(id, res);
	});
};

var CustomerOrderStatusAPIs = function (express) {
	//get all customer order statuses.
	express.get('/cust_orderstatuses', function (req, res) {
		CustomerOrderStatus.getAll(res);
	});

	//get a single order status.
	express.get('/cust_orderstatuses/:id', function (req, res) {
		var id = req.params.id;
		CustomerOrderStatus.getOne(id, res);
	});

	//create new customer order status
	express.post('/cust_orderstatuses', function (req, res) {
		var customerOrderStatusObj = req.body;
		CustomerOrderStatus.create(customerOrderStatusObj, res);
	});

	//update customer order status
	express.put('/cust_orderstatuses', function (req, res) {
		var customerOrderStatusObj = req.body;
		CustomerOrderStatus.update(customerOrderStatusObj, res);
	});
};

var CustomerOrderDetailsAPIs = function (express) {
	//get details of single customer order.
	express.get('/customerorderdetails/:id', function (req, res) {
		var id = req.params.id;
		CustomerOrderDetails.getOne(id, res);
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

var ProductStatusAPIs = function (express) {
	//get all product statuses.
	express.get('/productstatuses', function (req, res) {
		ProductStatus.getAll(res);
	});

	//get a single product status.
	express.get('/productstatuses/:id', function (req, res) {
		var id = req.params.id;
		ProductStatus.getOne(id, res);
	});

	//create new product status.
	express.post('/productstatuses', function (req, res) {
		var productTypeObj = req.body;
		ProductStatus.create(productTypeObj, res);
	});

	//update new product status
	express.put('/productstatuses', function (req, res) {
		var productTypeObj = req.body;
		ProductStatus.update(productTypeObj, res);
	});
};

var CustomerOrderAPIs = function (express) {
	//count all orders of a specific employee.
	express.get('/customerorders/employees/:id/count', function (req, res) {
		var employeeId = req.params.id;
		CustomerOrder.countAllPerEmployee(employeeId, res);
	});

	//count all orders of a specific payment type.
	express.get('/customerorders/paymenttypes/:id/count', function (req, res) {
		var paymentTypeId = req.params.id;
		CustomerOrder.countAllByPaymentType(paymentTypeId, res);
	});

	//count all orders of a specific product AND date.
	express.get('/customerorders/products/:id/date/:date/count', function (req, res) {
		var orderdObj = {
			product_id: req.params.id,
			date: req.params.date
		};
		CustomerOrder.countAllPerProductAndDate(orderdObj, res);
	});

	//count all orders per specific product AND date range. From - to
	express.get('/customerorders/products/:id/datefrom/:datefrom/dateto/:dateto/count', function (req, res) {
		var orderdObj = {
			product_id: req.params.id,
			date_from: req.params.datefrom,
			date_to: req.params.dateto
		};
		CustomerOrder.countAllPerProductAndDateRange(orderdObj, res);
	});

	//count all orders per specific product TYPE and date.
	express.get('/customerorders/producttypes/:id/date/:date/count', function (req, res) {
		var orderdObj = {
			product_type_id: req.params.id,
			date: req.params.date
		};
		CustomerOrder.countAllPerProductTypeAndDate(orderdObj, res);
	});

	//count all orders per specific product TYPE and date range. From - to.
	express.get('/customerorders/producttypes/:id/datefrom/:datefrom/dateto/:dateto/count', function (req, res) {
		var orderdObj = {
			product_type_id: req.params.id,
			date_from: req.params.datefrom,
			date_to: req.params.dateto
		};
		CustomerOrder.countAllPerProductTypeAndDateRange(orderdObj, res);
	});

	//count all orders per specific product AND date AND shift. NOT NEEDED
	express.post('/customerorders/products/shifts/count', function (req, res) {
		var orderObj = req.body;
		CustomerOrder.countAllPerProductAndDateWithShift(orderObj, res);
	});

	//count all orders per specific product TYPE and date AND shift. NOT NEEDED.
	express.post('/customerorders/producttypes/shifts/count', function (req, res) {
		var orderObj = req.body;
		CustomerOrder.countAllPerProductTypeAndDateWithShift(orderObj, res);
	});

	//get all customer orders.
	express.get('/customerorders', function (req, res) {
		CustomerOrder.getAll(res);
	});

	//get all customer orders that are new. Will be sent to the kitchen.
	express.get('/customerorders/new', function (req, res) {
		CustomerOrder.getAllNewToBePrepared(res);
	});

	//get all customer orders that are ready for collection.
	express.get('/customerorders/ready', function (req, res) {
		CustomerOrder.getAllReadyForCollection(res);
	});

	//get all orders for a specific customer.
	express.get('/customerorders/customers/:id', function (req, res) {
		var customerId = req.params.id;
		CustomerOrder.getAllPerCustomer(customerId, res);
	});

	//get all orders of a specific date. Used for End of day report.
	express.get('/customerorders/date/:date', function (req, res) {
		var date = req.params.date;
		CustomerOrder.getAllPerDate(date, res);
	});

	//get all orders for shift on a specific date. Used for End of day report.
	express.get('/customerorders/shifts/:id/date/:date', function (req, res) {
		var orderdObj = {
			shift_id: req.params.id,
			date: req.params.date
		};
		CustomerOrder.getPerDayAndShift(orderdObj, res);
	});

	//get total amount from orders in a previous shift (from current datetime)
	express.get('/customerorders/total/shifts', function (req, res) {
		CustomerOrder.getTotalAmountFromPreviousShift(res);
	});

	//get total amount from orders of a specific date. For End of day report
	express.get('/customerorders/total/date/:date', function (req, res) {
		var date = req.params.date;
		CustomerOrder.getTotalAmountFromDate(date, res);
	});

	//get total amount from orders of a specific date AND SHIFT. For End of day report
	express.get('/customerorders/total/date/:date/shifts/:id', function (req, res) {
		var orderObj = {
			shift_id: req.params.id,
			date: req.params.date
		};
		CustomerOrder.getTotalAmountFromDateAndShift(orderObj, res);
	});

	//get a specific order.
	express.get('/customerorders/:id', function (req, res) {
		var orderId = req.params.id;
		CustomerOrder.getOne(orderId, res);
	});

	//create new customer order.
	express.post('/customerorders', function (req, res) {
		var orderObj = req.body;
		orderObj.added_by = employeeID;
		
		/* ------ONLY for testing without UI------ */
		/*orderObj.added_by = 1;
		orderObj.orderItems = [
			{
				product_id: 2,
				product_size_id: 1,
				topping_id: 1,
				base_type_id: 3,
				product_quantity: 1,
				amount: 100
			},
			{
				product_id: 3,
				product_size_id: 2,
				topping_id: 1,
				base_type_id: 3,
				product_quantity: 2,
				amount: 150
			}
		];
		orderObj.bankCardObj = {
			account_type_id: 1, card_number: '1234', card_holder: 'John Doe',validity: '07/17 - 07/21'
		};*/
		
		/* -------------- */
		CustomerOrder.create(orderObj, res);
	});

	//update order status
	express.put('/customerorders/status', function (req, res) {
		var orderObj = req.body;
		CustomerOrder.updateStatus(orderObj, res);
	});

	//update collection status
	express.put('/customerorders/:id/collection', function (req, res) {
		var orderId = req.params.id;
		CustomerOrder.updateCollectionStatus(orderId, res);
	});

	//Update payment and collection status for order.
	express.put('/customerorders/collection/payment', function (req, res) {
		var orderObj = req.body;
		orderObj.bankCardObj = {
			account_type_id: 2, card_number: '123456789', card_holder: 'Jane Doe', validity: '03/17 - 03/21'
		};//only for testing
		CustomerOrder.updatePaymentAndCollectionStatus(orderObj, res);
	});
};

var ShiftAPIs = function (express) {
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

		if(roleID == 1){
			shiftObj.added_by = employeeID;
			Shift.create(shiftObj, res);
		}
		else{
			res.json({
				status: 0,
				message: roleMessage
			});
		}
		
	});

	//update shift
	express.put('/shifts', function (req, res) {
		var shiftObj = req.body;
		if(roleID == 1){
			shiftObj.added_by = employeeID;
			Shift.update(shiftObj, res);
		}
		else{
			res.json({
				status: 0,
				message: roleMessage
			});
		}

	});

	//delete a specific shift.
	express.delete('/shifts/:id', function (req, res) {
		
		if(roleID == 1){
			var shiftObj = {shift_id: req.params.id, added_by: employeeID};
			Shift.delete(shiftObj, res);
		}
		else{
			res.json({
				status: 0,
				message: roleMessage
			});
		}
		
	});
};

var EmployeeAPIs = function (express) {
	//Count total number of active male/females employees.
	express.get('/employees/genders/:id/count', function (req, res) {
		var genderId = req.params.id;
		Employee.countAllByGender(genderId, res);
	});

	//Count total number of active employees of a certain role.
	express.get('/employees/roles/:id/count', function (req, res) {
		var roleId = req.params.id;
		Employee.countAllByRole(roleId, res);
	});

	//get all employees.
	express.get('/employees', function (req, res) {
		Employee.getAll(res);
	});

	//get all employees of a certain status.
	express.get('/employees/statuses/:id', function (req, res) {
		var statusId = req.params.id;
		Employee.getByStatus(statusId, res);
	});

	//get all employees of a certain role.
	express.get('/employees/roles/:id', function (req, res) {
		var roleId = req.params.id;
		Employee.getByRole(roleId, res);
	});

	//get a specific employee.
	express.get('/employees/:id', function (req, res) {
		var employeeId = req.params.id;
		Employee.getOne(employeeId, res);
	});

	//Logout and redirect to index/login page
	express.get('/logout', function (req, res) {
		Employee.logout(req, res);
	});

	//create new employee.
	express.post('/employees', function (req, res) {
		var employeeObj = req.body;
		employeeObj.added_by = employeeID;
		Employee.create(employeeObj, res);
	});

	//login.
	express.post('/employees/login', function (req, res) {
		Employee.login(req, res);
	});

	//update employee by admin. Can only change role and/or status.
	express.put('/employees', function (req, res) {
		var employeeObj = req.body;
		employeeObj.added_by = employeeID;
		Employee.update(employeeObj, res);
	});

	//update employee info/profile. Done by employee him/herself.
	express.put('/employees/profile', function (req, res) {
		var employeeObj = req.body;
		employeeObj.employee_id = employeeID;
		Employee.updateProfile(employeeObj, res);
	});

	//Reset password. Done by employee him/herself when logged-in
	express.put('/employees/password/reset', function (req, res) {
		var passwordObj = req.body;
		passwordObj.employee_id = employeeID;
		Employee.resetPassword(passwordObj, res);
	});

	//Forgot password.
	express.put('/employees/password/forgot', function (req, res) {
		var employeeObj = req.body;
		Employee.ForgotPassword(employeeObj, res);
	});

	//Set up new password by newly created employee.
	express.put('/employees/password/setup', function (req, res) {
		var employeeObj = req.body;
		Employee.SetUpNewPassword(employeeObj, res);
	});
};

var CustomerAPIs = function (express) {
	//get all customers.
	express.get('/customers', function (req, res) {
		Customer.getAll(res);
	});

	//get all customers of specific gender
	express.get('/customers/genders/:id', function (req, res) {
		var genderId = req.params.id;
		Customer.getPerGender(genderId, res);
	});

	//get specific customer, no callback.
	express.get('/customers/filter/:id', function (req, res) {
		var id = req.params.id;
		Customer.getFiltered(id, res);
	});

	//get a specific customer, with callback.
	express.get('/customers/:id', function (req, res) {
		var customerId = req.params.id;
		//Customer.getOne(customerId, res);

		Customer.getOne(customerId, res, function (customerObj) {
			var customer = customerObj.customer;
			//console.log(customer);
			res.render('customer', {
				customer: customer,
				employeeCode: employeeCode
			});
		});
	});

	//create new customer.
	express.post('/customers', function (req, res) {
		var customerObj = req.body;
		customerObj.employee_id = employeeID;
		Customer.create(customerObj, res);
	});

	//update customer
	express.put('/customers', function (req, res) {
		var customerObj = req.body;
		customerObj.employee_id = employeeID;
		Customer.update(customerObj, res);
	});
};

var ProductAPIs = function (express) {
	//get all products.
	express.get('/products', function (req, res) {
		Product.getAll(res);
	});

	//get all products of certain type.
	express.get('/products/types/:id', function (req, res) {
		var productTypeId = req.params.id;
		Product.getByType(productTypeId, res);
	});

	//get all products of certain status.
	express.get('/products/statuses/:id', function (req, res) {
		var productStatusId = req.params.id;
		Product.getByStatus(productStatusId, res);
	});

	//get a specific product.
	express.get('/products/:id', function (req, res) {
		var productId = req.params.id;
		Product.getOne(productId, res);
	});

	//create new product.
	express.post('/products', function (req, res) {
		var productObj = req.body;
		if(roleID == 1){
			productObj.employee_id = employeeID;
			Product.create(productObj, res);
		}
		else{
			res.json({
				status: 0,
				message: roleMessage
			});
		}
		
	});

	//update product. Only by Admin
	express.put('/products', function (req, res) {
		var productObj = req.body;
		if(roleID == 1){
			productObj.employee_id = employeeID;
			Product.update(productObj, res);
		}
		else{
			res.json({
				status: 0,
				message: roleMessage
			});
		}
		
	});

};

var SupplierAPIs = function (express) {
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

var configViews = function (express) {
	//Home page
	express.get('/home', isUserLoggedIn, function (req, res) {
		res.render('home', {
			employeeCode: employeeCode
		});
	});

	//Customer Orders page
	express.get('/customers/orders', isUserLoggedIn, function (req, res) {
		res.render('customer_orders', {
			employeeCode: employeeCode
		});
	});

	//Place new orders.
	express.get('/customers/orders/new', isUserLoggedIn, function (req, res) {
		
		//For Bluebird Promise ONLY.
		if (roleID != 1) { //Check if employee booked this shift before placing an order

			ShiftBooking.checkShiftForEmployee(employeeID)
				.then(function (output) {
					if (output.status == 1) {
						res.render('place_orders', {
							employeeCode: employeeCode
						});
					} else {
						res.render('401_orders', {
							employeeCode: employeeCode,
							shiftMessage: output.message
						});
					}
				})
				.catch(function (err) {
					res.render('401_orders', {
						employeeCode: employeeCode,
						shiftMessage: err
					});
				});
		} else { //Admin can place order without shift booking.
			res.render('place_orders', {
				employeeCode: employeeCode
			});
		}

	});

	//Kitchen.
	express.get('/kitchen', isUserLoggedIn, function (req, res) {
		
		//For Bluebird Promise ONLY.
		if (roleID != 1) { //Check if employee booked this shift before placing an order

			ShiftBooking.checkShiftForEmployee(employeeID)
				.then(function (output) {
					if (output.status == 1) {
						res.render('kitchen', {
							employeeCode: employeeCode
						});
					} else {
						res.render('401_orders', {
							employeeCode: employeeCode,
							shiftMessage: output.message
						});
					}
				})
				.catch(function (err) {
					res.render('401_orders', {
						employeeCode: employeeCode,
						shiftMessage: err
					});
				});
		} else { //Admin view orders in the kitchen without shift booking.
			res.render('kitchen', {
				employeeCode: employeeCode
			});
		}

	});

	//Customer orders collection.
	express.get('/customers/orders/collections', isUserLoggedIn, function (req, res) {
		
		//For Bluebird Promise ONLY.
		if (roleID != 1) { //Check if employee booked this shift before placing an order

			ShiftBooking.checkShiftForEmployee(employeeID)
				.then(function (output) {
					if (output.status == 1) {
						res.render('customer_order_collections', {
							employeeCode: employeeCode
						});
					} else {
						res.render('401_orders', {
							employeeCode: employeeCode,
							shiftMessage: output.message
						});
					}
				})
				.catch(function (err) {
					res.render('401_orders', {
						employeeCode: employeeCode,
						shiftMessage: err
					});
				});
		} else { //Admin view orders in the kitchen without shift booking.
			res.render('customer_order_collections', {
				employeeCode: employeeCode
			});
		}

	});

	//Profile page
	express.get('/profile', isUserLoggedIn, function (req, res) {
		res.render('profile', {
			employeeCode: employeeCode,
			profileObject: profileObject
		});
	});

	//Employees page.
	express.get('/staff', isUserLoggedIn, function (req, res) {
		if (roleID == 1) {
			res.render('staff', {
				employeeCode: employeeCode
			});
		} else {
			res.render('401', {
				employeeCode: employeeCode, roleMessage: roleMessage
			});
		}

	});

	//Audit trail page.
	express.get('/report/audit', isUserLoggedIn, function (req, res) {
		if (roleID == 1) {
			res.render('audit', {
				employeeCode: employeeCode
			});
		} else {
			res.render('401', {
				employeeCode: employeeCode, roleMessage: roleMessage
			});
		}

	});

	//Sales Report Page.
	express.get('/report/sales', isUserLoggedIn, function (req, res) {
		if (roleID == 1) {
			res.render('sales_reports', {
				employeeCode: employeeCode
			});
		} else {
			res.render('401', {
				employeeCode: employeeCode, roleMessage: roleMessage
			});
		}

	});

	//End of day/shift report.
	express.get('/report/endofday', isUserLoggedIn, function (req, res) {
		if (roleID == 1) {
			res.render('endof_day_report', {
				employeeCode: employeeCode
			});
		} else {
			res.render('401', {
				employeeCode: employeeCode, roleMessage: roleMessage
			});
		}

	});

	//Login Records Page.
	express.get('/loginrecords', isUserLoggedIn, function (req, res) {
		if (roleID == 1) {
			res.render('login_records', {
				employeeCode: employeeCode
			});
		} else {
			res.render('401', {
				employeeCode: employeeCode, roleMessage: roleMessage
			});
		}

	});

	//Customers page.
	express.get('/customers', isUserLoggedIn, function (req, res) {
		res.render('customers', {
			employeeCode: employeeCode
		});
	});

	//Shifts page.
	express.get('/shifts', isUserLoggedIn, function (req, res) {
		res.render('shifts', {
			employeeCode: employeeCode
		});
	});

	//Promotions Page.
	express.get('/promotions', isUserLoggedIn, function (req, res) {
		res.render('promotions', {
			employeeCode: employeeCode
		});
	});

	//Shift Bookings page.
	express.get('/shiftbookings', isUserLoggedIn, function (req, res) {
		res.render('shift_bookings', {
			employeeCode: employeeCode
		});

	});
};

var configIndex = function (express) {
	//Login Page (index)
	express.get('/', function (req, res) {
		res.render('index');
	});

	//Forgot Password Page
	express.get('/forgotpassword', function (req, res) {
		res.render('forgot_password');
	});

	//Setup new password by newly added employee
	express.get('/setpassword', function (req, res) {
		res.render('setup_password');
	});
}

/*********** Export all models and functions ************/
/* ---------------------------------------------------- */

module.exports = {
	configureAllAPIs: function (apiRoutes) {
		GenderAPIs(apiRoutes);
		RoleAPIs(apiRoutes);
		PaymentStatusAPIs(apiRoutes);
		PaymentTypeAPIs(apiRoutes);
		ProductTypeAPIs(apiRoutes);
		ProductStatusAPIs(apiRoutes);
		PromotionStatusAPIs(apiRoutes);
		CustomerOrderStatusAPIs(apiRoutes);
		CustomerOrderAPIs(apiRoutes);
		ShiftAPIs(apiRoutes);
		EmployeeAPIs(apiRoutes);
		CustomerAPIs(apiRoutes);
		ProductAPIs(apiRoutes);
		SupplierAPIs(apiRoutes);
		EmployeeStatusAPIs(apiRoutes);
		CustomerOrderDetailsAPIs(apiRoutes);
		PromotionAPIs(apiRoutes);
		ShiftBookingAPIs(apiRoutes);
		ShiftBookingStatusAPIs(apiRoutes);
		LoginRecordAPIs(apiRoutes);
		ProductSizeAPIs(apiRoutes);
		BaseTypeAPIs(apiRoutes);
		AccountTypeAPIs(apiRoutes);
		CardPaymentAPIs(apiRoutes);
		ToppingAPIs(apiRoutes);
		AuditAPIs(apiRoutes);
	},
	configureAllViews: function (viewRoutes) {
		configViews(viewRoutes);
	},
	configureIndex: function (app) {
		configIndex(app);
	}
};