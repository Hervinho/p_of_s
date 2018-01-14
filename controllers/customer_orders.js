var message, customerOrderID, orderFilterCustomerVal, orderFilterDateVal, orderFilterShiftVal;
var payment_types = [], paymentTypeNames = [], orderCountPaymentType = [];
var employees = [], employeeNames = [], orderCountEmployee = [];

$(document).ready(function () {
   LoadAllOrders();
   LoadAllPaymentTypes();
   LoadAllEmployees();

    $(document).on('change', '.form-control, .any-date', function () {
        orderFilterCustomerVal = $("#orderFilterCustomer").val();
        orderFilterDateVal = $("#orderFilterDate").val();
        orderFilterShiftVal = $("#orderFilterShift").val();
        isValidDate = moment(orderFilterDateVal.toString(), "YYYY-MM-DD", true).isValid();

        if (orderFilterCustomerVal != 0 && orderFilterShiftVal == 0 && orderFilterDateVal.length <= 0) {
            FilterOrdersByCustomers(orderFilterCustomerVal);
        } 
        else if(orderFilterCustomerVal == 0 && orderFilterShiftVal != 0 && isValidDate){
            FilterOrdersByDayAndShift(orderFilterShiftVal, orderFilterDateVal);
        }
    });
});

function LoadAllOrders(){
    LoadAllCustomers();
    LoadAllShifts();

    //Reset all filters.
    $("#orderFilterCustomer").val(0);
    $("#orderFilterShift").val(0);

    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/customerorders',
        dataType: "json",
        cache: false,
        beforeSend: function () {
            var wait = '<span class="mdl-chip mdl-color--blue-300"><span class="mdl-chip__text"><b>Waiting for data...</b></span></span>';
            $("#tblCustomerOrders tbody").html(wait);
        },
        success: handleOrdersData,
        error: function (e) {
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function LoadAllCustomers() {
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/customers',
        dataType: "json",
        cache: false,
        success: function (data) {
            var html = '<option value = "0"></option>';
            if (data.status == 1 && data.customers.length > 0) {
                var customers = data.customers;
                for (var key = 0, size = customers.length; key < size; key++) {
                    html += '<option value =' + customers[key].customer_id + ' >' +
                        customers[key].customer_name +
                        '</option>';
                }
            } else {
                html += '<option value = "0">No customers found</option>';
            }

            $("#orderFilterCustomer").html(html);
        },
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function LoadAllShifts() {
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/shifts',
        dataType: "json",
        cache: false,
        success: function (data) {
            //console.log(data);
            var html = '<option value = "0"></option>';
            if (data.status == 1 && data.shifts.length > 0) {
                var shifts = data.shifts;
                for (var key = 0, size = shifts.length; key < size; key++) {
                    html += '<option value =' + shifts[key].shift_id + ' >' +
                    shifts[key].shift_name +
                        '</option>';
                }
            } else {
                html += '<option value = "0">No shifts found</option>';
            }

            $("#orderFilterShift").html(html);
        },
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function FilterOrdersByCustomers(customerId){
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/customerorders/customers/' + customerId,
        dataType: "json",
        cache: false,
        beforeSend: function () {
            var wait = '<span class="mdl-chip mdl-color--blue-300"><span class="mdl-chip__text"><b>Waiting for data...</b></span></span>';
            $("#tblCustomerOrders tbody").html(wait);
        },
        success: handleOrdersData,
        error: function (e) {
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function FilterOrdersByDayAndShift(shiftId, date){
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/customerorders/shifts/' + shiftId + '/date/' + date,
        dataType: "json",
        cache: false,
        beforeSend: function () {
            var wait = '<span class="mdl-chip mdl-color--blue-300"><span class="mdl-chip__text"><b>Waiting for data...</b></span></span>';
            $("#tblCustomerOrders tbody").html(wait);
        },
        success: handleOrdersData,
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function ViewOrderDetails(id){
    //promotionID = id;
    $("#lbSelectedCustomerOrder").text(id);

    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/customerorderdetails/' + id,
        dataType: "json",
        cache: false,
        success: handleOrderDetailsData,
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function LoadAllPaymentTypes(){
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/paymenttypes',
        dataType: "json",
        cache: false,
        success: handlePaymentTypeData,
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function LoadAllEmployees(){
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/employees',
        dataType: "json",
        cache: false,
        success: handleEmployeeData,
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

//function to get number of customer orders of a certain payment type.
function countOrdersPerPaymentType(array) {

    for (var key = 0, size = array.length; key < size; key++) {
        $.ajax({
            type: 'GET',
            async: false,
            crossDomain: true,
            contentType: 'application/json; charset=utf-8',
            url: '/api/v1/customerorders/paymenttypes/' + array[key].payment_type_id + '/count',
            dataType: "json",
            cache: false,
            success: function (data) {
                orderCountPaymentType.push(data[0].ordersCountPaymentType);
            },
            error: function (e) {
                message = "Something went wrong";
                toastr.error(message);
            }

        });
    }
}

//function to get number of customer orders captured by a specific employee.
function countOrdersPerEmployee(array) {

    for (var key = 0, size = array.length; key < size; key++) {
        $.ajax({
            type: 'GET',
            async: false,
            crossDomain: true,
            contentType: 'application/json; charset=utf-8',
            url: '/api/v1/customerorders/employees/' + array[key].employee_id + '/count',
            dataType: "json",
            cache: false,
            success: function (data) {
                orderCountEmployee.push(data[0].orderCountEmployee);
            },
            error: function (e) {
                message = "Something went wrong";
                toastr.error(message);
            }

        });
    }
}

//function to display the chart
function displayChart(namesArray, orderCount, divId) {
    
    var num_colors = [], colorsArray = [
        "#008000", "#808080", "#800000", "#FFFF00", "#00FFFF", "#008080",
        "#0000FF", "#800080", "#C2C87D", "#129696", "##F9E79F", "#D7BDE2"
    ];
    
    //Randomly choose which colors will be on the chart.
    for(var key = 0, size = namesArray.length; key < size; key++){
        num_colors[key] = colorsArray[Math.floor(Math.random() * colorsArray.length)];
    }
    
    if ($("#" + divId).length) {
        var f = document.getElementById(divId),
            i = {
                datasets: [{
                    data: orderCount,
                    backgroundColor: num_colors,
                    label: "Orders Chart by Payment Type"
                }],
                labels: namesArray
            };
        new Chart(f, {
            data: i,
            type: "pie",
            otpions: {
                legend: !1
            }
        })
    }

}

/*********** AJAX Callback functions ***********/

function handleOrdersData(data) {
    var html = '';
    if (data && data.status == 1 && data.customer_orders.length > 0) {
        var customer_orders = data.customer_orders;
        for (var key = 0, size = customer_orders.length; key < size; key++) {
            html += '<tr ><td class="mdl-data-table__cell--non-numeric">' +
                customer_orders[key].customer_order_timestamp + '</td><td class="mdl-data-table__cell--non-numeric truncate">' +
                customer_orders[key].payment_type_name + '</td><td class="mdl-data-table__cell--non-numeric">' +
                'R ' + customer_orders[key].total_amount + '</td><td class="mdl-data-table__cell--non-numeric">' +
                customer_orders[key].employee_name + '</td><td class="mdl-data-table__cell--non-numeric">' +
                '<a class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon modal-trigger"  data-target="#dialogViewCustomerOrder" onclick="return ViewOrderDetails(\'' + customer_orders[key].customer_order_id + '\' )">' +
                '<i class="material-icons">visibility</i></a></td>' +
                '</tr>';
        }
    } else {
        html += '<span class="mdl-chip mdl-color--red-300"><span class="mdl-chip__text"><b>Oops!! No data found.</b></span></span>';
    }
    //console.log(html);
    $("#tblCustomerOrders tbody").html(html);
}

function handleOrderDetailsData(data) {
    //console.log(data.customer_order_details[0]);
    var html = '';
    if (data && data.status == 1 && data.customer_order_details.length > 0) {
        var customer_order_details = data.customer_order_details;
        for (var key = 0, size = customer_order_details.length; key < size; key++) {
            html += '<tr ><td class="mdl-data-table__cell--non-numeric">' +
            customer_order_details[key].product_name + '</td><td class="mdl-data-table__cell--non-numeric">' +
            customer_order_details[key].product_size_name + '</td><td class="mdl-data-table__cell--non-numeric">' +
            customer_order_details[key].product_quantity + '</td><td class="mdl-data-table__cell--non-numeric">' +
            'R ' + customer_order_details[key].amount + '</td>' +
            '</tr>';
        }
    } else {
        html += '<span class="mdl-chip mdl-color--red-300"><span class="mdl-chip__text"><b>Oops!! No data found.</b></span></span>';
    }
    //console.log(html);
    $("#tblCustomerOrderDetails tbody").html(html);
}

function handlePaymentTypeData(data){
    //console.log('payment_types: ', data);
    var orderChartId = "orderBarChartPaymentType";

    if (data.status == 1 && data.payment_types.length > 0) {
        payment_types = data.payment_types;
        for (var key = 0, size = payment_types.length; key < size; key++) {
            paymentTypeNames[key] = payment_types[key].payment_type_name;
        }
    }

    //Also Populate dialogViewCustomerOrder
    //$("#txtViewEmployeeRole").html(html);

    //count number of customer orders of a certain payment type. and display in chart.
    countOrdersPerPaymentType(payment_types);
    displayChart(paymentTypeNames, orderCountPaymentType, orderChartId);
}

function handleEmployeeData(data){
    //console.log('payment_types: ', data);
    var orderChartId = "orderBarChartEmployee";

    if (data.status == 1 && data.employees.length > 0) {
        employees = data.employees;
        for (var key = 0, size = employees.length; key < size; key++) {
            employeeNames[key] = employees[key].employee_name;
        }
    }

    //count number of customer orders of a certain payment type. and display in chart.
    countOrdersPerEmployee(employees);
    displayChart(employeeNames, orderCountEmployee, orderChartId);
}