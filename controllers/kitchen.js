var message, customerOrderID;

$(document).ready(function () {
   LoadAllOrders();
   LoadAllOrderStatuses();
});

function LoadAllOrders(){

    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/customerorders/new',
        dataType: "json",
        cache: false,
        beforeSend: function () {
            var wait = '<span class="mdl-chip mdl-color--blue-300"><span class="mdl-chip__text"><b>Waiting for data...</b></span></span>';
            $("#tblNewCustomerOrders tbody").html(wait);
        },
        success: handleOrdersData,
        error: function (e) {
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function LoadAllOrderStatuses() {
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/cust_orderstatuses',
        dataType: "json",
        cache: false,
        success: function (data) {
            //console.log(data);
            var html = '<option value = "0"></option>';
            if (data.status == 1 && data.customer_order_statuses.length > 0) {
                var customer_order_statuses = data.customer_order_statuses;
                for (var key = 0, size = customer_order_statuses.length; key < size; key++) {
                    html += '<option value =' + customer_order_statuses[key].customer_order_status_id + ' >' +
                    customer_order_statuses[key].customer_order_status_name +
                        '</option>';
                }
            } else {
                html += '<option value = "0">No order status found</option>';
            }

            $("#orderFilterStatus").html(html);
        },
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function ViewOrderDetails(id, statusId){
    customerOrderID = id;
    $("#lbSelectedNewCustomerOrder").text(id);
    $("#orderFilterStatus").val(statusId);

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

/* AJAX Callback Functions */
function handleOrdersData(data) {
    var html = '';
    if (data && data.status == 1 && data.customer_orders.length > 0) {
        var customer_orders = data.customer_orders;
        for (var key = 0, size = customer_orders.length; key < size; key++) {
            html += '<tr ><td class="mdl-data-table__cell--non-numeric">' +
                customer_orders[key].customer_order_id + '</td><td class="mdl-data-table__cell--non-numeric truncate">' +
                customer_orders[key].customer_order_timestamp + '</td><td class="mdl-data-table__cell--non-numeric">' +
                //customer_orders[key].employee_name + '</td><td class="mdl-data-table__cell--non-numeric">' +
                '<a class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon modal-trigger"  data-target="#dialogViewNewCustomerOrder" onclick="return ViewOrderDetails(\'' + customer_orders[key].customer_order_id + '\', \'' + customer_orders[key].order_status_id + '\' )">' +
                '<i class="material-icons">visibility</i></a></td>' +
                '</tr>';
        }
        
    } else {
        html += '<span class="mdl-chip mdl-color--red-300"><span class="mdl-chip__text"><b>Oops!! No data found.</b></span></span>';
    }
    //console.log(html);
    $("#tblNewCustomerOrders tbody").html(html);
}

function handleOrderDetailsData(data) {
    //console.log(data.customer_order_details[0]);
    var html = '';
    if (data && data.status == 1 && data.customer_order_details.length > 0) {
        var customer_order_details = data.customer_order_details;
        for (var key = 0, size = customer_order_details.length; key < size; key++) {
            //show only if product type != drink.
            if(customer_order_details[key].product_type_id != 3){
                html += '<tr ><td class="mdl-data-table__cell--non-numeric">' +
                customer_order_details[key].product_name + '</td><td class="mdl-data-table__cell--non-numeric">' +
                customer_order_details[key].product_size_name + '</td><td class="mdl-data-table__cell--non-numeric">' +
                customer_order_details[key].product_quantity + '</td><td class="mdl-data-table__cell--non-numeric">' +
                'R ' + customer_order_details[key].amount + '</td>' +
                '</tr>';
            }            
        }

    } else {
        html += '<span class="mdl-chip mdl-color--red-300"><span class="mdl-chip__text"><b>Oops!! No data found.</b></span></span>';
    }
    //console.log(html);
    $("#tblNewCustomerOrderDetails tbody").html(html);
}

