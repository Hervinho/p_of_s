var message, customerID;
$(document).ready(function () {
    customerID = $("#txtViewCustomerId").html().trim();
    //console.log(customerID);
    //var genderFilterVal;

    LoadAllCustomerOrders(customerID);

    $(document).on('change', '.form-control', function () {
        /*genderFilterVal = $("#customerFilterGender").val();

        if (genderFilterVal != 0) {
            FilterCustomersByGender(genderFilterVal);
        }
        else {
            LoadAllCustomerOrders();
        }*/
    });
});

function LoadAllCustomerOrders(id){
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/customerorders/customers/' + id,
        dataType: "json",
        cache: false,
        beforeSend: function () {
            var wait = '<span class="mdl-chip mdl-color--blue-300"><span class="mdl-chip__text"><b>Waiting for data...</b></span></span>';
            $("#tblCustomerOrders tbody").html(wait);
        },
        success: handleCustomerOrdersData,
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

/*********** AJAX Callback functions ***********/

function handleCustomerOrdersData(data) {

    var html = '';
    if (data && data.status == 1 && data.customer_orders.length > 0) {
        var customer_orders = data.customer_orders;
        for (var key = 0, size = customer_orders.length; key < size; key++) {
            html += '<tr ><td class="mdl-data-table__cell--non-numeric">' +
            customer_orders[key].customer_order_id + '</td><td class="mdl-data-table__cell--non-numeric truncate">' +
            customer_orders[key].customer_order_timestamp + '</td><td class="mdl-data-table__cell--non-numeric">' +
            'R ' + customer_orders[key].total_amount + '</td><td class="mdl-data-table__cell--non-numeric">' +
            '<a class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon modal-trigger"  data-target="#dialogViewProduct" onclick="return ViewProductInfo(\'' + customer_orders[key].customer_order_id + '\' )">' +
            '<i class="material-icons">visibility</i></a></td><td class="mdl-data-table__cell--non-numeric">' +
            '</tr>';
        }
    } else {
        html += '<span class="mdl-chip mdl-color--red-300"><span class="mdl-chip__text"><b>Oops!! No data found.</b></span></span>';
    }
    //console.log(html);
    $("#tblCustomerOrders tbody").html(html);
}