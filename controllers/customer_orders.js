var message, customerOrderID, orderFilterCustomerVal, orderFilterTypeVal;

$(document).ready(function () {
   LoadAllOrders();

    $(document).on('change', '.form-control', function () {
        orderFilterCustomerVal = $("#orderFilterCustomer").val();
        //orderFilterTypeVal = $("#promotionFilterType").val();

        if (orderFilterCustomerVal != 0) {
            FilterOrdersByCustomers(orderFilterCustomerVal);
        } 
        /*else if(promotionFilterStatusVal == 0 && promotionFilterTypeVal != 0){
            FilterPromotionsByType(promotionFilterTypeVal);
        }*/
    });
});

function LoadAllOrders(){
    LoadAllCustomers();
    //LoadAllProductTypes();

    //Reset all filters.
    $("#orderFilterCustomer").val(0);
    //$("#promotionFilterType").val(0);

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
    var html = '';
    if (data && data.status == 1 && data.customer_order_details.length > 0) {
        var customer_order_details = data.customer_order_details;
        for (var key = 0, size = customer_order_details.length; key < size; key++) {
            html += '<tr ><td class="mdl-data-table__cell--non-numeric">' +
            customer_order_details[key].product_name + '</td><td class="mdl-data-table__cell--non-numeric">' +
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