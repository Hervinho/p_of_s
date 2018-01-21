var message, customerOrderID, orderSelectDateVal, orderSelectShiftVal, isValidDate;

$(document).ready(function () {
    LoadAllShifts();
    
    $(document).on('change', '.form-control, .any-date', function () {
        //orderSelectShiftVal = $("#orderSelectShift").val();
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

            $("#orderSelectShift").html(html);
        },
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function ResetAllFilters(){
    
    $("#orderSelectShift").val(0);
    $("#orderSelectDate").val("");
}

function GetAllOrders(){
    orderSelectDateVal = $("#orderSelectDate").val();
    orderSelectShiftVal = $("#orderSelectShift").val();
    isValidDate = moment(orderSelectDateVal.toString(), "YYYY-MM-DD", true).isValid();
    //console.log(orderSelectShiftVal);

    if(isValidDate == true && orderSelectShiftVal != 0){//get by date and shift
        //toastr.info("Date + Shift");
        GetAllOrdersPerDateAndShift(orderSelectDateVal, orderSelectShiftVal);
        GetAdditionalInfoDateAndShift(orderSelectDateVal, orderSelectShiftVal);
        GetPettyCashInfo(orderSelectDateVal, orderSelectShiftVal);
    }
    else{
        toastr.error("Select a date AND shift");
    }
}

function GetAllOrdersPerDateAndShift(date, id){
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/customerorders/shifts/' + id + '/date/' + date,
        dataType: "json",
        cache: false,
        success: displayShiftOrders,
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function getOrderDetailsForShift(id){
    customerOrderID = id;
    $("#labelSelectedOrderinShift").text(id);

    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/customerorderdetails/' + id,
        dataType: "json",
        cache: false,
        success: displayShiftOrderDetails,
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

function GetPettyCashInfo(date, id){
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/pettycash/shifts/' + id + '/date/' + date,
        dataType: "json",
        cache: false,
        success: displayPettyCashInfo,
        error: function (e) {
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

/* ---- AJAX Callback Functions ---- */
function displayShiftOrders(data){
    //console.log(data);
    var html = '';
    if (data && data.status == 1 && data.customer_orders.length > 0) {
        var customer_orders = data.customer_orders;
        for (var key = 0, size = customer_orders.length; key < size; key++) {
            html += '<tr ><td class="mdl-data-table__cell--non-numeric">' +
                customer_orders[key].customer_order_timestamp + '</td><td class="mdl-data-table__cell--non-numeric truncate">' +
                customer_orders[key].payment_type_name + '</td><td class="mdl-data-table__cell--non-numeric">' +
                'R ' + customer_orders[key].total_amount + '</td><td class="mdl-data-table__cell--non-numeric">' +
                customer_orders[key].employee_name + '</td><td class="mdl-data-table__cell--non-numeric">' +
                '<a class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon modal-trigger"  data-target="#dialogViewCustomerOrder" onclick="return getOrderDetailsForShift(\'' + customer_orders[key].customer_order_id + '\' )">' +
                '<i class="material-icons">visibility</i></a></td>' +
                '</tr>';
        }
    } else {
        html += '<span class="mdl-chip mdl-color--red-300"><span class="mdl-chip__text"><b>Oops!! No data found.</b></span></span>';
    }
    //console.log(html);
    $("#tableOrdersInShift tbody").html(html);
}

function displayShiftOrderDetails(data){
    //console.log(data);
    var html = '';
    if (data && data.status == 1 && data.customer_order_details.length > 0) {
        var customer_order_details = data.customer_order_details;
        for (var key = 0, size = customer_order_details.length; key < size; key++) {
            //console.log('Item: ', customer_order_details[key]);
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
    $("#tblReadyCustomerOrderDetails tbody").html(html);

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
    var html = '<h5>Shift Info</h5>';

    if(data.status == 1){
        html_message += '<p><strong>Total sales amount: R'+ data.total + '</strong></p>';
    }
    else{
        html_message += '<p style="color: red;"><strong>Message: </strong>'+ data.message + '</p>' +
        '<p><strong>Total: R 0</strong></p>';
    }

    $("#additionalInfoShift ").html(html + html_message);
}

function displayPettyCashInfo(data){
    //console.log(data.petty_cash[0]);
    var message = data.message, amount = data.petty_cash.amount, html = '';

    if(data.status == 1){
        html += '<p><strong>Petty Cash captured: R'+ data.petty_cash[0].amount + '</strong></p>' +
        '<p><strong>Petty Cash captured by: '+ data.petty_cash[0].employee_name + ' - ' + data.petty_cash[0].employee_code + 
        '</strong></p>';
    }
    else{
        html += '<p style="color: red;"><strong>Petty Cash captured: </strong>'+ data.message + '</p>';
    }

    console.log(html);
    $("#additionalInfoShift").append(html);
}