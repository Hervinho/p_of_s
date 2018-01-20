var message, customerOrderID, orderObj, order_total_amount, payment_type;

$(document).ready(function () {
    checkoutInit();
    LoadAllReadyOrders();
});

function LoadAllReadyOrders() {

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

function ViewOrderDetails(id) {
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

function UpdateCollectionStatus(id, totalAmount, paymentType) {
    $.ajax({
        type: 'PUT',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/customerorders/' + id + '/collection',
        dataType: "json",
        cache: false,
        success: function (data) {
            if (data.status == 1) {
                toastr.success(data.message);
                $("#lbSelectedReadyCustomerOrder").text('');

                //Reload page.
                setTimeout(function () {
                    location.reload();
                }, 500);
            } else {
                toastr.error(data.message);
                $("#lbSelectedReadyCustomerOrder").text('');
                order_total_amount = totalAmount;
                $('#calc_change').val('R ' + (0 - parseFloat(totalAmount)).toFixed(2));
                payment_type = paymentType;
                // check payment type
                if (paymentType === '1') {
                    $('.cash').show();
                    $('.card').hide();
                    // carts.bankCardObj = null;
                } else {
                    $('.cash').hide();
                    $('.card').show();
                    /*  carts.bankCardObj = {
                          account_type_id: 1,
                          card_number: '',
                          card_holder: '',
                          validity: ''
                      }*/
                }

                $('#dialogCheckout').show();
            }
        },
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

//Update payment and collection status for order.
//Called if order was processed and is ready, but was not yet paid for.
function UpdatePaymentAndCollectionStatus() {
    $.ajax({
        type: 'PUT',
        crossDomain: true,
        data: JSON.stringify(orderObj),
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/customerorders/collection/payment',
        dataType: "json",
        cache: false,
        success: function (data) {
            if (data.status == 1) {
                toastr.success(data.message);
                //Reload page.
                setTimeout(function () {
                    location.reload();
                }, 500);
            } else {
                toastr.error(data.message);
                $("#lbSelectedReadyCustomerOrder").text('');
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
            console.log(ready_orders[key]);
            html += '<tr ><td class="mdl-data-table__cell--non-numeric">' +
                ready_orders[key].customer_order_id + '</td><td class="mdl-data-table__cell--non-numeric truncate">' +
                ready_orders[key].customer_order_timestamp + '</td><td class="mdl-data-table__cell--non-numeric">' +
                'R ' + ready_orders[key].total_amount + '</td><td class="mdl-data-table__cell--non-numeric">' +
                '<button class="mdl-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" style="background-color: #2ECF33;" type="button" onclick="return UpdateCollectionStatus(\'' + ready_orders[key].customer_order_id + '\',\'' + ready_orders[key].total_amount + '\',\'' + ready_orders[key].payment_type_id + '\');">Collect</button></td><td class="mdl-data-table__cell--non-numeric">' +
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
    console.log(data.customer_order_details[0]);
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
    $("#tblReadyCustomerOrderDetails tbody").html(html);
}

function checkoutInit() {

    $('#placeOrder').text('Confirm Order');
    $('#dialogCheckout .list').remove();
    $('#dialogCheckout .pad').removeClass('mdl-cell--6-col-desktop');
    $('#dialogCheckout .pad').removeClass('mdl-cell--6-col-tablet');
    $('#dialogCheckout .pad').addClass('mdl-cell--2-offset-desktop mdl-cell--8-col');
    $('#dialogCheckout #payOnCollection').hide();
    $('#dialogCheckout .collection-label').hide();

    getAccountTypes();

    var total_calc = '';

    $('#dialogCheckout .form-close').click(function () {
        total_calc = '';
        $('#calc_total').val('R 0.00');
        $('#calc_change').val('R ' + (0 - parseFloat(order_total_amount)).toFixed(2));
        $('.mdl-card ').show();
        document.getElementById("payOnCollection").checked = false;
    });

    $.each(['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', '.'], function (key, value) {
        if (key === 9) {
            $('.calc-grid').append('<div class="mdl-cell mdl-cell--4-col"> <a class="mdl-button mdl-js-button mdl-button--fab number-calc" data-action=' + -1 + '> <i class="material-icons">' +
                value + '</i> </a> </div>')
        } else {
            value + ' data-action="' + value + '"> <i class="material-icons">' +
                $('.calc-grid').append('<div class="mdl-cell mdl-cell--4-col"> <a data-action=' + value +
                    ' class="mdl-button mdl-js-button mdl-button--fab number-calc ">' + value + '</a> </div>')
        }
    });

    $('#calc_total').val('R 0.00');
    $('#calc_change').val('R 0.00');

    $('.calc-grid').on('click', '.number-calc', function () {
        var action = $(this).data('action');

        if (action === -1) {
            $('#calc_total').val('R 0.00');
            $('#calc_change').val('R ' + (0 - parseFloat(order_total_amount)).toFixed(2));
            total_calc = '';
        } else {
            total_calc += action;
            var remainder = parseFloat(order_total_amount);
            $('#calc_total').val('R ' + total_calc);
            $('#calc_change').val('R ' + (parseFloat(total_calc) - remainder).toFixed(2));
        }

        if ((parseFloat(total_calc) - remainder).toFixed(2) > -1) {
            $('#placeOrder').removeAttr('disabled');

        } else {

            $('#placeOrder').attr('disabled', true);
        }
    });

    $('.card input').bind('change', function () {
        if ($('#cardNumber').val().length === 16 && $('#cardHolder').val() !== '' &&
            $('#fromCardMonth').val().length === 2 && $('#fromCardYear').val().length === 2 &&
            $('#toCardMonth').val().length === 2 && $('#toCardYear').val().length === 2) {
            $('#placeOrder').removeAttr('disabled');
        } else {
            $('#placeOrder').attr('disabled', true);
        }

    });

    // Confirm Order on click
    $('#placeOrder').click(function () {
        if (payment_type === '2') {
            if (($('#fromCardYear').val() >= $('#toCardYear').val()) ||
                $('#fromCardYear').val().length > 2 || $('#toCardYear').val().length > 2 ||
                $('#fromCardMonth').val().length > 2 || $('#toCardMonth').val().length > 2) {

                toastr.error('Invalid Card Date Range!');
                return;
            }
        }

        // update order here
        alert('update order');


    });


}

function getAccountTypes() {
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/accounttypes',
        dataType: "json",
        cache: false,
        beforeSend: function () {

        },
        success: function (data) {
            if (data.status === 1) {
                $.each(data.account_types, function (key, value) {
                    $('#cardType')
                        .append($("<option></option>")
                            .attr("value", value.account_type_id)
                            .text(value.account_type_name));
                });

            }

        },
        error: function (e) {
            message = "Something went wrong";
            toastr.error(message);
        }

    });
};