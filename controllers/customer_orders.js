var message, customerOrderID, orderFilterCustomerVal, orderFilterDateVal, orderFilterShiftVal;

$(document).ready(function () {
   LoadAllOrders();

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
    $("#orderFilterDate").val("");

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
    customerOrderID = id;
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

function ViewCardPaymentDetails(orderId){
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/bankcards/orders/' + orderId,
        dataType: "json",
        cache: false,
        success: handleCardDetailsData,
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
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
            
            if(customer_order_details[key].topping_name == null){
                customer_order_details[key].topping_name = '-';
            }
            if(customer_order_details[key].base_type_name == null){
                customer_order_details[key].base_type_name = '-';
            }

            html += '<tr ><td class="mdl-data-table__cell--non-numeric">' +
                customer_order_details[key].product_name + '</td><td class="mdl-data-table__cell--non-numeric">' +
                customer_order_details[key].product_size_name + '</td><td class="mdl-data-table__cell--non-numeric">' +
                customer_order_details[key].topping_name + '</td><td class="mdl-data-table__cell--non-numeric">' +
                customer_order_details[key].base_type_name + '</td><td class="mdl-data-table__cell--non-numeric">' +
                customer_order_details[key].product_quantity + '</td><td class="mdl-data-table__cell--non-numeric">' +
                'R ' + customer_order_details[key].amount + '</td>' +
                '</tr>';
        }
    } else {
        html += '<span class="mdl-chip mdl-color--red-300"><span class="mdl-chip__text"><b>Oops!! No data found.</b></span></span>';
    }
    //console.log(html);
    $("#tblCustomerOrderDetails tbody").html(html);

    //if order was paid with card, get details of the card.
    ViewCardPaymentDetails(customerOrderID);
}

function handleCardDetailsData(data){
    
    var card_info, html = '';

    //if payment was cash, hide div.
    if (data.status == 0) {
        document.getElementById("bankCardDetails").style.display = 'none';
    } else {
        //console.log('Card data:', data);
        document.getElementById("bankCardDetails").style.display = 'block';
        card_info = data.card_payments[0];

        html += '<p><strong>Account Type: </strong>' + card_info.account_type_name + '</p>' +
            '<p><strong>Card Number: </strong>' + card_info.card_number + '</p>' +
            '<p><strong>Card Holder Name: </strong>' + card_info.card_holder + '</p>' +
            '<p><strong>Card Validity: </strong>' + card_info.card_validity + '</p>';

        $("#bankCardDetails ").html(html);
    }
}