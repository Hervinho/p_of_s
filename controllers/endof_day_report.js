var message, customerOrderID, orderGetDateVal, orderGetShiftVal, isValidDate;

$(document).ready(function () {
    LoadAllShifts();
    
    $(document).on('change', '.form-control, .any-date', function () {
        //orderGetShiftVal = $("#orderGetShift").val();
    });
});

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

            $("#orderGetShift").html(html);
        },
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function ResetFilters(){
    
    $("#orderGetShift").val(0);
    $("#orderGetDate").val("");
}

function GetOrders(){
    orderGetDateVal = $("#orderGetDate").val();
    orderGetShiftVal = $("#orderGetShift").val();
    isValidDate = moment(orderGetDateVal.toString(), "YYYY-MM-DD", true).isValid();
    console.log(orderGetShiftVal);

    if(isValidDate == true && orderGetShiftVal == 0){//get by date only
        //toastr.info("Date");
        GetOrdersPerDate(orderGetDateVal);
        GetAdditionalInfo(orderGetDateVal);
    }
    else if(isValidDate == true && orderGetShiftVal != 0){//get by date and shift
        //toastr.info("Date + Shift");
        GetOrdersPerDateAndShift(orderGetDateVal, orderGetShiftVal);
        GetAdditionalInfoDateAndShift(orderGetDateVal, orderGetShiftVal);
    }
    else{
        toastr.error("Select a date or date AND shift");
    }
}

function GetOrdersPerDate(date){
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/customerorders/date/' + date,
        dataType: "json",
        cache: false,
        success: displayOrders,
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function GetOrdersPerDateAndShift(date, id){
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/customerorders/shifts/' + id + '/date/' + date,
        dataType: "json",
        cache: false,
        success: displayOrders,
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function getOrderDetails(id){
    customerOrderID = id;
    $("#labelSelectedOrder").text(id);

    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/customerorderdetails/' + id,
        dataType: "json",
        cache: false,
        success: displayOrderDetails,
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function getCardPaymentDetails(id){
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/bankcards/orders/' + id,
        dataType: "json",
        cache: false,
        success: displayCardDetails,
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function GetAdditionalInfo(date){
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/customerorders/total/date/' + date,
        dataType: "json",
        cache: false,
        success: displayAdditionalInfo,
        error: function (e) {
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function GetAdditionalInfoDateAndShift(date, id){
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/customerorders/total/date/' + date + '/shifts/' + id,
        dataType: "json",
        cache: false,
        success: displayAdditionalInfo,
        error: function (e) {
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

/* ---- AJAX Callback Functions ---- */
function displayOrders(data){
    var html = '';
    if (data && data.status == 1 && data.customer_orders.length > 0) {
        var customer_orders = data.customer_orders;
        for (var key = 0, size = customer_orders.length; key < size; key++) {
            html += '<tr ><td class="mdl-data-table__cell--non-numeric">' +
                customer_orders[key].customer_order_timestamp + '</td><td class="mdl-data-table__cell--non-numeric truncate">' +
                customer_orders[key].payment_type_name + '</td><td class="mdl-data-table__cell--non-numeric">' +
                'R ' + customer_orders[key].total_amount + '</td><td class="mdl-data-table__cell--non-numeric">' +
                customer_orders[key].employee_name + '</td><td class="mdl-data-table__cell--non-numeric">' +
                '<a class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon modal-trigger"  data-target="#dialogViewCustomerOrder" onclick="return getOrderDetails(\'' + customer_orders[key].customer_order_id + '\' )">' +
                '<i class="material-icons">visibility</i></a></td>' +
                '</tr>';
        }
    } else {
        html += '<span class="mdl-chip mdl-color--red-300"><span class="mdl-chip__text"><b>Oops!! No data found.</b></span></span>';
    }
    //console.log(html);
    $("#tableOrders tbody").html(html);
}

function displayOrderDetails(data){
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
    getCardPaymentDetails(customerOrderID);
}

function displayCardDetails(data){
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

function displayAdditionalInfo(data){
    var message = data.message, total = data.total, html_message = '';
    var html = '<h5>Day Info</h5>';

    if(data.status == 1){
        html_message += '<p><strong>Total sales amount: R'+ data.total + '</strong></p>';
    }
    else{
        html_message += '<p style="color: red;"><strong>Message: </strong>'+ data.message + '</p>' +
        '<p><strong>Total: R 0</strong></p>';
    }

    $("#additionalInfo ").html(html + html_message);
}