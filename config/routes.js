/* Load all models. */
const Gender = require('../models/Gender');
const Role = require('../models/Role');
const Audit = require('../models/Audit');
const PaymentStatus = require('../models/PaymentStatus');
const PaymentType = require('../models/PaymentType');
const ProductType = require('../models/ProductType');
const ProductStatus = require('../models/ProductStatus');
const ProductSize = require('../models/ProductSize');
const PromotionStatus = require('../models/PromotionStatus');
const CustomerOrderStatus = require('../models/CustomerOrderStatus');
const CustomerOrderDetails = require('../models/CustomerOrderDetails');
const CustomerOrder = require('../models/CustomerOrder');
const Shift = require('../models/Shift');
const Employee = require('../models/Employee');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const EmployeeStatus = require('../models/EmployeeStatus');
const Promotion = require('../models/Promotion');
const ShiftBooking = require('../models/ShiftBooking');
const ShiftBookingStatus = require('../models/ShiftBookingStatus');
const LoginRecord = require('../models/LoginRecord');
const BaseType = require('../models/BaseType');
const AccountType = require('../models/AccountType');
const CardPayment = require('../models/CardPayment');
const Topping = require('../models/Topping');
const PettyCash = require('../models/PettyCash');

//global letiables.
let employeeID, employeeCode, roleID, profileObject, shiftMessage, 
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

let PettyCashAPIs = (express) => {
	//get all petty cash captured.
	express.get('/pettycash', (req, res) => {
		PettyCash.getAll(res);
	});

	//get petty cash captured during a shift of specific date.
	express.get('/pettycash/shifts/:id/date/:date', (req, res) => {
		let pettyCashObj = {
			shift_id: req.params.id,
			date: req.params.date
		};
		PettyCash.getPerDayAndShift(pettyCashObj, res);
	});

	//create new audits.
	express.post('/pettycash', (req, res) => {
		let pettyCashObj = req.body;
		pettyCashObj.employee_id = employeeID;
		PettyCash.create(pettyCashObj, res);
	});
};

//Just for testing. They get called INSIDE the models INSTEAD.
let AuditAPIs = (express) => {
	//get all audits.
	express.get('/audits', (req, res) => {
		Audit.getAll(res);
	});

	//get a single audits.
	express.get('/audits/:id', (req, res) => {
		let id = req.params.id;
		Audit.getOne(id, res);
	});

	//create new audits.
	express.post('/audits', (req, res) => {
		let auditObj = req.body;
		Audit.create(auditObj, res);
	});
};

let CardPaymentAPIs = (express) => {
	//get all details of all bank cards used for orders.
	express.get('/bankcards', (req, res) => {
		CardPayment.getAll(res);
	});

	//get all details of all bank cards used for a certain order.
	express.get('/bankcards/orders/:id', (req, res) => {
		let orderId = req.params.id;
		CardPayment.getOnePerOrder(orderId, res);
	});
};

let AccountTypeAPIs = (express) => {
	//get all account types.
	express.get('/accounttypes', (req, res) => {
		AccountType.getAll(res);
	});
};

let BaseTypeAPIs = (express) => {
	//get all base types.
	express.get('/basetypes', (req, res) => {
		BaseType.getAll(res);
	});

	//get a single base type.
	express.get('/basetypes/:id', (req, res) => {
		let id = req.params.id;
		BaseType.getOne(id, res);
	});

	//create base type.
	express.post('/basetypes', (req, res) => {
		let toppingObj = req.body;
		BaseType.create(toppingObj, res);
	});

	//update base type.
	express.put('/basetypes', (req, res) => {
		let toppingObj = req.body;
		BaseType.update(toppingObj, res);
	});
};

let ToppingAPIs = (express) => {
	//get all toppings.
	express.get('/toppings', (req, res) => {
		Topping.getAll(res);
	});

	//get a single topping.
	express.get('/toppings/:id', (req, res) => {
		let id = req.params.id;
		Topping.getOne(id, res);
	});

	//create topping.
	express.post('/toppings', (req, res) => {
		let toppingObj = req.body;
		Topping.create(toppingObj, res);
	});

	//update topping.
	express.put('/toppings', (req, res) => {
		let toppingObj = req.body;
		Topping.update(toppingObj, res);
	});
};

let ShiftBookingStatusAPIs = (express) => {
	//get all booking statuses.
	express.get('/bookingstatuses', (req, res) => {
		ShiftBookingStatus.getAll(res);
	});
};

let ShiftBookingAPIs = (express) => {
	//get all shift bookings.
	express.get('/shiftbookings', (req, res) => {
		ShiftBooking.getAll(res);
	});

	//get all bookings of specific shift.
	express.get('/shiftbookings/shifts/:id', (req, res) => {
		let shiftId = req.params.id;
		ShiftBooking.getPerShift(shiftId, res);
	});

	//get all shifts of a certain status. (booked/cancelled)
	express.get('/shiftbookings/statuses/:id', (req, res) => {
		let statusId = req.params.id;
		ShiftBooking.getPerStatus(statusId, res);
	});

	//get all bookings of a specific employee.
	express.get('/shiftbookings/employees/:id', (req, res) => {
		let employeeId = req.params.id;
		ShiftBooking.getPerEmployee(employeeId, res);
	});

	//check if employee has booked for shift on a specific day.
	//Used to TEST allowing/denying employee from placing orders.
	express.get('/shiftbookings/check/employees/:id', (req, res) => {
		let employeeId = req.params.id;
		ShiftBooking.checkShiftForEmployee(employeeId, res);
	});

	//get a specific shift bookings.
	express.get('/shiftbookings/:id', (req, res) => {
		let bookingId = req.params.id;
		ShiftBooking.getOne(bookingId, res);
	});

	//book a shift.
	express.post('/shiftbookings', (req, res) => {
		let bookingObj = req.body;
		bookingObj.employee_id = employeeID;
		ShiftBooking.create(bookingObj, res);
		
	});

	//update a shift booking.
	express.put('/shiftbookings', (req, res) => {
		let bookingObj = req.body;
		
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

let GenderAPIs = (express) => {
	//get all genders.
	express.get('/genders', (req, res) => {
		Gender.getAll(res);
	});

	//get a single gender.
	express.get('/genders/:id', (req, res) => {
		let id = req.params.id;
		Gender.getOne(id, res);
	});

	//create new gender.
	express.post('/genders', (req, res) => {
		let genderObj = req.body;
		Gender.create(genderObj, res);
	});

	//update new gender.
	express.put('/genders', (req, res) => {
		let genderObj = req.body;
		Gender.update(genderObj, res);
	});
};

let RoleAPIs = (express) => {
	//get all roles.
	express.get('/roles', (req, res) => {
		Role.getAll(res);
	});

	//get a single role.
	express.get('/roles/:id', (req, res) => {
		let id = req.params.id;
		Role.getOne(id, res);
	});

	//create new role.
	express.post('/roles', (req, res) => {
		let roleObj = req.body;
		Role.create(roleObj, res);
	});

	//update new role.
	express.put('/roles', (req, res) => {
		let roleObj = req.body;
		Role.update(roleObj, res);
	});
};

let EmployeeStatusAPIs = (express) => {
	//get all employee statuses.
	express.get('/employeestatuses', (req, res) => {
		EmployeeStatus.getAll(res);
	});
};

let PaymentStatusAPIs = (express) => {
	//get all payment statuses.
	express.get('/paymentstatuses', (req, res) => {
		PaymentStatus.getAll(res);
	});

	//get a single payment status.
	express.get('/paymentstatuses/:id', (req, res) => {
		let id = req.params.id;
		PaymentStatus.getOne(id, res);
	});

	//create new payment status.
	express.post('/paymentstatuses', (req, res) => {
		let paymentStatusObj = req.body;
		PaymentStatus.create(paymentStatusObj, res);
	});

	//update new payment status.
	express.put('/paymentstatuses', (req, res) => {
		let paymentStatusObj = req.body;
		PaymentStatus.update(paymentStatusObj, res);
	});
};

let PromotionAPIs = (express) => {
	//get all promotions.
	express.get('/promotions', (req, res) => {
		Promotion.getAll(res);
	});

	//get get all promotions of a certain status.
	express.get('/promotions/statuses/:id', (req, res) => {
		let id = req.params.id;
		Promotion.getPerStatus(id, res);
	});

	//get all promotions of a certain product.
	express.get('/promotions/products/:id', (req, res) => {
		let id = req.params.id;
		Promotion.getPerProduct(id, res);
	});

	//get a specific promotion.
	express.get('/promotions/:id', (req, res) => {
		let id = req.params.id;
		Promotion.getOne(id, res);
	});

	//create promotion. Only by Admin
	express.post('/promotions', (req, res) => {
		let promotionObj = req.body;
		//console.log('roleID: ', roleID);
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
	});

	//update promotion. Only by Admin
	express.put('/promotions', (req, res) => {
		let promotionObj = req.body;
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
	express.put('/promotions/statuses', (req, res) => {
		let promotionObj = req.body;
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

let LoginRecordAPIs = (express) => {
	//get all login records..
	express.get('/loginrecords', (req, res) =>  {
		LoginRecord.getAll(res);
	});

	//get all login records of a specific employee.
	express.get('/loginrecords/employees/:id', (req, res) =>  {
		let employeeId = req.params.id;
		LoginRecord.getPerEmployee(employeeId, res);
	});

	//get all login records for a specific date.
	express.get('/loginrecords/date/:date', (req, res) =>  {
		let date = req.params.date;
		LoginRecord.getPerDate(date, res);
	});

	//get all login records for shift on a specific date.
	express.get('/loginrecords/shifts/:id/date/:date', (req, res) =>  {
		let recordObj = {
			shift_id: req.params.id,
			date: req.params.date
		};
		LoginRecord.getPerDayAndShift(recordObj, res);
	});

	//get all login records between date range.
	express.get('/loginrecords/datefrom/:from/dateto/:to', (req, res) =>  {
		let recordObj = {
			date_from: req.params.from,
			date_to: req.params.to
		};
		LoginRecord.getPerFromDateToDate(recordObj, res);
	});
};

let PromotionStatusAPIs = (express) =>  {
	//get all promotion statuses.
	express.get('/promotionstatuses', (req, res) =>  {
		PromotionStatus.getAll(res);
	});

	//get a single promotion status.
	express.get('/promotionstatuses/:id', (req, res) =>  {
		let id = req.params.id;
		PromotionStatus.getOne(id, res);
	});

	//create new promotion status.
	express.post('/promotionstatuses', (req, res) =>  {
		let promotionStatusObj = req.body;
		PromotionStatus.create(promotionStatusObj, res);
	});

	//update promotion status.
	express.put('/promotionstatuses', (req, res) =>  {
		let promotionStatusObj = req.body;
		PromotionStatus.update(promotionStatusObj, res);
	});
};

let ProductSizeAPIs = (express) =>  {
	//get all product sizes.
	express.get('/productsizes', (req, res) =>  {
		ProductSize.getAll(res);
	});

	//get a single product size.
	express.get('/productsizes/:id', (req, res) =>  {
		let id = req.params.id;
		ProductSize.getOne(id, res);
	});
};

let CustomerOrderStatusAPIs = (express) =>  {
	//get all customer order statuses.
	express.get('/cust_orderstatuses', (req, res) =>  {
		CustomerOrderStatus.getAll(res);
	});

	//get a single order status.
	express.get('/cust_orderstatuses/:id', (req, res) =>  {
		let id = req.params.id;
		CustomerOrderStatus.getOne(id, res);
	});

	//create new customer order status
	express.post('/cust_orderstatuses', (req, res) =>  {
		let customerOrderStatusObj = req.body;
		CustomerOrderStatus.create(customerOrderStatusObj, res);
	});

	//update customer order status
	express.put('/cust_orderstatuses', (req, res) =>  {
		let customerOrderStatusObj = req.body;
		CustomerOrderStatus.update(customerOrderStatusObj, res);
	});
};

let CustomerOrderDetailsAPIs = (express) =>  {
	//get details of single customer order.
	express.get('/customerorderdetails/:id', (req, res) =>  {
		let id = req.params.id;
		CustomerOrderDetails.getOne(id, res);
	});
};

let PaymentTypeAPIs = (express) =>  {
	//get all payment types.
	express.get('/paymenttypes', (req, res) =>  {
		PaymentType.getAll(res);
	});

	//get a single payment type.
	express.get('/paymenttypes/:id', (req, res) =>  {
		let id = req.params.id;
		PaymentType.getOne(id, res);
	});

	//create new payment type.
	express.post('/paymenttypes', (req, res) =>  {
		let paymentMethodObj = req.body;
		PaymentType.create(paymentMethodObj, res);
	});

	//update new payment type.
	express.put('/paymenttypes', (req, res) =>  {
		let paymentMethodObj = req.body;
		PaymentType.update(paymentMethodObj, res);
	});
};

let ProductTypeAPIs = (express) =>  {
	//get all product types.
	express.get('/producttypes', (req, res) =>  {
		ProductType.getAll(res);
	});

	//get a single prduct type.
	express.get('/producttypes/:id', (req, res) =>  {
		let id = req.params.id;
		ProductType.getOne(id, res);
	});

	//create new payment type.
	express.post('/producttypes', (req, res) =>  {
		let productTypeObj = req.body;
		ProductType.create(productTypeObj, res);
	});

	//update new payment type.
	express.put('/producttypes', (req, res) =>  {
		let productTypeObj = req.body;
		ProductType.update(productTypeObj, res);
	});
};

let ProductStatusAPIs = (express) =>  {
	//get all product statuses.
	express.get('/productstatuses', (req, res) =>  {
		ProductStatus.getAll(res);
	});

	//get a single product status.
	express.get('/productstatuses/:id', (req, res) =>  {
		let id = req.params.id;
		ProductStatus.getOne(id, res);
	});

	//create new product status.
	express.post('/productstatuses', (req, res) =>  {
		let productTypeObj = req.body;
		ProductStatus.create(productTypeObj, res);
	});

	//update new product status
	express.put('/productstatuses', (req, res) =>  {
		let productTypeObj = req.body;
		ProductStatus.update(productTypeObj, res);
	});
};

let CustomerOrderAPIs = (express) =>  {
	//count all orders of a specific employee.
	express.get('/customerorders/employees/:id/count', (req, res) =>  {
		let employeeId = req.params.id;
		CustomerOrder.countAllPerEmployee(employeeId, res);
	});

	//count all orders of a specific payment type.
	express.get('/customerorders/paymenttypes/:id/count', (req, res) =>  {
		let paymentTypeId = req.params.id;
		CustomerOrder.countAllByPaymentType(paymentTypeId, res);
	});

	//count all orders of a specific product AND date.
	express.get('/customerorders/products/:id/date/:date/count', (req, res) =>  {
		let orderdObj = {
			product_id: req.params.id,
			date: req.params.date
		};
		CustomerOrder.countAllPerProductAndDate(orderdObj, res);
	});

	//count all orders per specific product AND date range. From - to
	express.get('/customerorders/products/:id/datefrom/:datefrom/dateto/:dateto/count', (req, res) =>  {
		let orderdObj = {
			product_id: req.params.id,
			date_from: req.params.datefrom,
			date_to: req.params.dateto
		};
		CustomerOrder.countAllPerProductAndDateRange(orderdObj, res);
	});

	//count all orders per specific product TYPE and date.
	express.get('/customerorders/producttypes/:id/date/:date/count', (req, res) =>  {
		let orderdObj = {
			product_type_id: req.params.id,
			date: req.params.date
		};
		CustomerOrder.countAllPerProductTypeAndDate(orderdObj, res);
	});

	//count all orders per specific product TYPE and date range. From - to.
	express.get('/customerorders/producttypes/:id/datefrom/:datefrom/dateto/:dateto/count', (req, res) =>  {
		let orderdObj = {
			product_type_id: req.params.id,
			date_from: req.params.datefrom,
			date_to: req.params.dateto
		};
		CustomerOrder.countAllPerProductTypeAndDateRange(orderdObj, res);
	});

	//count all orders per specific product AND date AND shift. NOT NEEDED
	express.post('/customerorders/products/shifts/count', (req, res) =>  {
		let orderObj = req.body;
		CustomerOrder.countAllPerProductAndDateWithShift(orderObj, res);
	});

	//count all orders per specific product TYPE and date AND shift. NOT NEEDED.
	express.post('/customerorders/producttypes/shifts/count', (req, res) =>  {
		let orderObj = req.body;
		CustomerOrder.countAllPerProductTypeAndDateWithShift(orderObj, res);
	});

	//get all customer orders.
	express.get('/customerorders', (req, res) =>  {
		CustomerOrder.getAll(res);
	});

	//get all customer orders that are new. Will be sent to the kitchen.
	express.get('/customerorders/new', (req, res) =>  {
		CustomerOrder.getAllNewToBePrepared(res);
	});

	//get all customer orders that are ready for collection.
	express.get('/customerorders/ready', (req, res) =>  {
		CustomerOrder.getAllReadyForCollection(res);
	});

	//get all orders for a specific customer.
	express.get('/customerorders/customers/:id', (req, res) =>  {
		let customerId = req.params.id;
		CustomerOrder.getAllPerCustomer(customerId, res);
	});

	//get all orders of a specific date. Used for End of day report.
	express.get('/customerorders/date/:date', (req, res) =>  {
		let date = req.params.date;
		CustomerOrder.getAllPerDate(date, res);
	});

	//get all orders for shift on a specific date. Used for End of day report.
	express.get('/customerorders/shifts/:id/date/:date', (req, res) =>  {
		let orderdObj = {
			shift_id: req.params.id,
			date: req.params.date
		};
		CustomerOrder.getPerDayAndShift(orderdObj, res);
	});

	//get total amount from orders in a previous shift (from current datetime)
	express.get('/customerorders/total/shifts', (req, res) =>  {
		CustomerOrder.getTotalAmountFromPreviousShift(res);
	});

	//check if orders have been placed in current shift. Used to check for PETTY CASH.
	express.get('/customerorders/pettycash/check', (req, res) =>  {
		CustomerOrder.checkPreviousOrdersInShift(res);
	});

	//get total amount from orders of a specific date. For End of day report
	express.get('/customerorders/total/date/:date', (req, res) =>  {
		let date = req.params.date;
		CustomerOrder.getTotalAmountFromDate(date, res);
	});

	//get total amount from orders of a specific date AND SHIFT. For End of day report
	express.get('/customerorders/total/date/:date/shifts/:id', (req, res) =>  {
		let orderObj = {
			shift_id: req.params.id,
			date: req.params.date
		};
		CustomerOrder.getTotalAmountFromDateAndShift(orderObj, res);
	});

	//get a specific order.
	express.get('/customerorders/:id', (req, res) =>  {
		let orderId = req.params.id;
		CustomerOrder.getOne(orderId, res);
	});

	//get a specific order, along with its items and employee who placed it.
	//used to print ticket on collection.
	express.get('/customerorders/details/:id', (req, res) =>  {
		let orderId = req.params.id;
		CustomerOrder.getOneWithDetails(orderId, res);
	});

	//create new customer order.
	express.post('/customerorders', (req, res) =>  {
		let orderObj = req.body;
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
	express.put('/customerorders/status', (req, res) =>  {
		let orderObj = req.body;
		CustomerOrder.updateStatus(orderObj, res);
	});

	//update collection status
	express.put('/customerorders/:id/collection', (req, res) =>  {
		let orderId = req.params.id;
		CustomerOrder.updateCollectionStatus(orderId, res);
	});

	//Update payment and collection status for order.
	express.put('/customerorders/collection/payment', (req, res) =>  {
		let orderObj = req.body;
		orderObj.added_by = employeeID;
		/*orderObj.bankCardObj = {//only for testing
			account_type_id: 2, card_number: '123456789', card_holder: 'Jane Doe', validity: '03/17 - 03/21'
		};*/
		CustomerOrder.updatePaymentAndCollectionStatus(orderObj, res);
	});
};

let ShiftAPIs = (express) =>  {
	//get all shifts.
	express.get('/shifts', (req, res) =>  {
		Shift.getAll(res);
	});

	//get a specific shift.
	express.get('/shifts/:id', (req, res) =>  {
		let shiftId = req.params.id;
		Shift.getOne(shiftId, res);
	});

	//create new shift.
	express.post('/shifts', (req, res) =>  {
		let shiftObj = req.body;

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
	express.put('/shifts', (req, res) =>  {
		let shiftObj = req.body;
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
	express.delete('/shifts/:id', (req, res) =>  {
		
		if(roleID == 1){
			let shiftObj = {shift_id: req.params.id, added_by: employeeID};
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

let EmployeeAPIs = (express) =>  {
	//Count total number of active male/females employees.
	express.get('/employees/genders/:id/count', (req, res) =>  {
		let genderId = req.params.id;
		Employee.countAllByGender(genderId, res);
	});

	//Count total number of active employees of a certain role.
	express.get('/employees/roles/:id/count', (req, res) =>  {
		let roleId = req.params.id;
		Employee.countAllByRole(roleId, res);
	});

	//get all employees.
	express.get('/employees', (req, res) =>  {
		Employee.getAll(res);
	});

	//get all employees of a certain status.
	express.get('/employees/statuses/:id', (req, res) =>  {
		let statusId = req.params.id;
		Employee.getByStatus(statusId, res);
	});

	//get all employees of a certain role.
	express.get('/employees/roles/:id', (req, res) =>  {
		let roleId = req.params.id;
		Employee.getByRole(roleId, res);
	});

	//get a specific employee.
	express.get('/employees/:id', (req, res) =>  {
		let employeeId = req.params.id;
		Employee.getOne(employeeId, res);
	});

	//Logout and redirect to index/login page
	express.get('/logout', (req, res) =>  {
		Employee.logout(req, res);
	});

	//create new employee.
	express.post('/employees', (req, res) =>  {
		let employeeObj = req.body;
		employeeObj.added_by = employeeID;
		Employee.create(employeeObj, res);
	});

	//login.
	express.post('/employees/login', (req, res) =>  {
		Employee.login(req, res);
	});

	//update employee by admin. Can only change role and/or status.
	express.put('/employees', (req, res) =>  {
		let employeeObj = req.body;
		employeeObj.added_by = employeeID;
		Employee.update(employeeObj, res);
	});

	//update employee info/profile. Done by employee him/herself.
	express.put('/employees/profile', (req, res) =>  {
		let employeeObj = req.body;
		employeeObj.employee_id = employeeID;
		Employee.updateProfile(employeeObj, res);
	});

	//Reset password. Done by employee him/herself when logged-in
	express.put('/employees/password/reset', (req, res) =>  {
		let passwordObj = req.body;
		passwordObj.employee_id = employeeID;
		Employee.resetPassword(passwordObj, res);
	});

	//Forgot password.
	express.put('/employees/password/forgot', (req, res) =>  {
		let employeeObj = req.body;
		Employee.ForgotPassword(employeeObj, res);
	});

	//Set up new password by newly created employee.
	express.put('/employees/password/setup', (req, res) =>  {
		let employeeObj = req.body;
		Employee.SetUpNewPassword(employeeObj, res);
	});
};

let CustomerAPIs = (express) =>  {
	//get all customers.
	express.get('/customers', (req, res) =>  {
		Customer.getAll(res);
	});

	//get all customers of specific gender
	express.get('/customers/genders/:id', (req, res) =>  {
		let genderId = req.params.id;
		Customer.getPerGender(genderId, res);
	});

	//get specific customer, no callback.
	express.get('/customers/filter/:id', (req, res) =>  {
		let id = req.params.id;
		Customer.getFiltered(id, res);
	});

	//get a specific customer, with callback.
	express.get('/customers/:id', (req, res) =>  {
		let customerId = req.params.id;
		//Customer.getOne(customerId, res);

		Customer.getOne(customerId, res, function (customerObj) {
			let customer = customerObj.customer;
			//console.log(customer);
			res.render('customer', {
				customer: customer,
				employeeCode: employeeCode
			});
		});
	});

	//create new customer.
	express.post('/customers', (req, res) =>  {
		let customerObj = req.body;
		customerObj.employee_id = employeeID;
		Customer.create(customerObj, res);
	});

	//update customer
	express.put('/customers', (req, res) =>  {
		let customerObj = req.body;
		customerObj.employee_id = employeeID;
		Customer.update(customerObj, res);
	});
};

let ProductAPIs = (express) =>  {
	//get all products.
	express.get('/products', (req, res) =>  {
		Product.getAll(res);
	});

	//get all products of certain type.
	express.get('/products/types/:id', (req, res) =>  {
		let productTypeId = req.params.id;
		Product.getByType(productTypeId, res);
	});

	//get all products of certain status.
	express.get('/products/statuses/:id', (req, res) =>  {
		let productStatusId = req.params.id;
		Product.getByStatus(productStatusId, res);
	});

	//get a specific product.
	express.get('/products/:id', (req, res) =>  {
		let productId = req.params.id;
		Product.getOne(productId, res);
	});

	//create new product.
	express.post('/products', (req, res) =>  {
		let productObj = req.body;
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
	express.put('/products', (req, res) =>  {
		let productObj = req.body;
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

let SupplierAPIs = (express) =>  {
	//get all suppliers.
	express.get('/suppliers', (req, res) =>  {
		Supplier.getAll(res);
	});

	//get a specific supplier.
	express.get('/suppliers/:id', (req, res) =>  {
		let supplierId = req.params.id;
		Supplier.getOne(supplierId, res);
	});

	//create new supplier.
	express.post('/suppliers', (req, res) =>  {
		let supplierObj = req.body;
		Supplier.create(supplierObj, res);
	});

	//update product.
	express.put('/suppliers', (req, res) =>  {
		let supplierObj = req.body;
		Supplier.update(supplierObj, res);
	});
};

/*********** Views Configurations ************/
/* ---------------------------------------- */

let configViews = (express) =>  {
	//Home page
	express.get('/home', isUserLoggedIn, (req, res) =>  {
		res.render('home', {
			employeeCode: employeeCode
		});
	});

	//Customer Orders page
	express.get('/customers/orders', isUserLoggedIn, (req, res) =>  {
		res.render('customer_orders', {
			employeeCode: employeeCode
		});
	});

	//Place new orders.
	express.get('/customers/orders/new', isUserLoggedIn, (req, res) =>  {
		
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
	express.get('/kitchen', isUserLoggedIn, (req, res) =>  {
		
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
	express.get('/customers/orders/collections', isUserLoggedIn, (req, res) =>  {
		
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
	express.get('/profile', isUserLoggedIn, (req, res) =>  {
		res.render('profile', {
			employeeCode: employeeCode,
			profileObject: profileObject
		});
	});

	//Employees page.
	express.get('/staff', isUserLoggedIn, (req, res) =>  {
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
	express.get('/report/audit', isUserLoggedIn, (req, res) =>  {
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
	express.get('/report/sales', isUserLoggedIn, (req, res) =>  {
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

	//End of day report.
	express.get('/report/endofday', isUserLoggedIn, (req, res) =>  {
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

	//End of shift report.
	express.get('/report/endofshift', isUserLoggedIn, (req, res) =>  {
		/*if (roleID == 1) {
			res.render('endof_shift_report', {
				employeeCode: employeeCode
			});
		} else {
			res.render('401', {
				employeeCode: employeeCode, roleMessage: roleMessage
			});
		}*/
		res.render('endof_shift_report', {
			employeeCode: employeeCode
		});

	});

	//Login Records Page.
	express.get('/loginrecords', isUserLoggedIn, (req, res) =>  {
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
	express.get('/customers', isUserLoggedIn, (req, res) =>  {
		res.render('customers', {
			employeeCode: employeeCode
		});
	});

	//Shifts page.
	express.get('/shifts', isUserLoggedIn, (req, res) =>  {
		res.render('shifts', {
			employeeCode: employeeCode
		});
	});

	//Promotions Page.
	express.get('/promotions', isUserLoggedIn, (req, res) =>  {
		res.render('promotions', {
			employeeCode: employeeCode
		});
	});

	//Shift Bookings page.
	express.get('/shiftbookings', isUserLoggedIn, (req, res) =>  {
		res.render('shift_bookings', {
			employeeCode: employeeCode
		});

	});
};

let configIndex = (express) =>  {
	//Login Page (index)
	express.get('/', (req, res) =>  {
		res.render('index');
	});

	//Forgot Password Page
	express.get('/forgotpassword', (req, res) =>  {
		res.render('forgot_password');
	});

	//Setup new password by newly added employee
	express.get('/setpassword', (req, res) =>  {
		res.render('setup_password');
	});
}

/*********** Export all models and functions ************/
/* ---------------------------------------------------- */

module.exports = {
	configureAllAPIs: (apiRoutes) => {
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
		PettyCashAPIs(apiRoutes);
	},
	configureAllViews: (viewRoutes) => {
		configViews(viewRoutes);
	},
	configureIndex: (app) => {
		configIndex(app);
	}
};