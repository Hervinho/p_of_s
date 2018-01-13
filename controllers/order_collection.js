var message, customerOrderID;

$(document).ready(function () {
    
    LoadAllReadyOrders();
 });

 function LoadAllReadyOrders(){

    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/customerorders/ready',
        dataType: "json",
        cache: false,
        beforeSend: function () {
            var wait = '<span class="mdl-chip mdl-color--blue-300"><span class="mdl-chip__text"><b>Waiting for data...</b></span></span>';
            $("#tblReadyCustomerOrders tbody").html(wait);
        },
        success: handleOrdersData,
        error: function (e) {
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function ViewOrderDetails(id){
    //customerOrderID = id;
    $("#lbSelectedReadyCustomerOrder").text(id);

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

function UpdateCollectionStatus(id){
    $.ajax({
        type: 'PUT',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/customerorders/' + id + '/collection',
        dataType: "json",
        cache: false,
        success: function(data){
            if(data.status == 1){
                toastr.success(data.message);
            }
        },
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
    if (data && data.status == 1 && data.ready_orders.length > 0) {
        var ready_orders = data.ready_orders;
        for (var key = 0, size = ready_orders.length; key < size; key++) {
            html += '<tr ><td class="mdl-data-table__cell--non-numeric">' +
                ready_orders[key].customer_order_id+ '</td><td class="mdl-data-table__cell--non-numeric truncate">' +
                ready_orders[key].customer_order_timestamp + '</td><td class="mdl-data-table__cell--non-numeric">' +
                'R ' + ready_orders[key].total_amount + '</td><td class="mdl-data-table__cell--non-numeric">' +
                '<button class="mdl-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" style="background-color: #2ECF33;" type="button" onclick="return UpdateCollectionStatus(\'' + ready_orders[key].customer_order_id  + '\');">Collect</button></td><td class="mdl-data-table__cell--non-numeric">' +
                '<a class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon modal-trigger"  data-target="#dialogViewCustomerOrder" onclick="return ViewOrderDetails(\'' + ready_orders[key].customer_order_id + '\' )">' +
                '<i class="material-icons">visibility</i></a></td>' +
                '</tr>';
        }
    } else {
        html += '<span class="mdl-chip mdl-color--red-300"><span class="mdl-chip__text"><b>Oops!! No data found.</b></span></span>';
    }
    //console.log(html);
    $("#tblReadyCustomerOrders tbody").html(html);
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