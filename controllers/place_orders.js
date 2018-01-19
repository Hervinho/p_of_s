(function ($) {
    'use strict';
    $(function () {
        var products;
        var total = [];
        var quantity = [];
        var sizes = [];
        var toppings = [];
        var pSizes = ['Small', 'Medium', 'Large'];
        var carts = {
            total_amount: '0',
            payment_type_id: '0',
            customer_id: '0',
            orderItems: [],
            bankCardObj: { 
                account_type_id: 1,
                card_number: '',
                card_holder: '',
                validity: ''
            } 
        };
        var customer, payment_type;

        getCustomers();
        getPayments();

        function getToppings(id){
              $.ajax({
                type: 'GET',
                crossDomain: true,
                contentType: 'application/json; charset=utf-8',
                url: '/api/v1/customers',
                dataType: "json",
                cache: false,
                beforeSend: function () {

                },
                success: function (data) {
                   
                },
                error: function (e) {
                    message = "Something went wrong";
                    toastr.error(message);
                }

            });
        };
        
        
        function getCardTypes(){
             $.ajax({
                type: 'GET',
                crossDomain: true,
                contentType: 'application/json; charset=utf-8',
                url: '/api/v1/customers',
                dataType: "json",
                cache: false,
                beforeSend: function () {

                },
                success: function (data) {
                    if (data.status === 1) {
                        $.each(data.customers, function (key, value) {
                            $('#cardType')
                                .append($("<option></option>")
                                    .attr("value", value.customer_id)
                                    .text(value.customer_name));
                        });

                    }
                },
                error: function (e) {
                    message = "Something went wrong";
                    toastr.error(message);
                }

            });
        }
        
        
        function getProduct() {
            $.ajax({
                type: 'GET',
                crossDomain: true,
                contentType: 'application/json; charset=utf-8',
                url: '/api/v1/products/statuses/1',
                dataType: "json",
                cache: false,
                beforeSend: function () {
                    var wait = '<span class="mdl-chip mdl-color--blue-300"><span class="mdl-chip__text"><b>Waiting for data...</b></span></span>';
                    $("#tblPlaceOrders tbody").html(wait);
                },
                success: handleOrdersData,
                error: function (e) {
                    message = "Something went wrong";
                    toastr.error(message);
                }

            });
        }

        function getCustomers() {
            $.ajax({
                type: 'GET',
                crossDomain: true,
                contentType: 'application/json; charset=utf-8',
                url: '/api/v1/customers',
                dataType: "json",
                cache: false,
                beforeSend: function () {

                },
                success: function (data) {
                    if (data.status === 1) {
                        $.each(data.customers, function (key, value) {
                            $('#customerSelect')
                                .append($("<option></option>")
                                    .attr("value", value.customer_id)
                                    .text(value.customer_name));
                        });

                    }
                },
                error: function (e) {
                    message = "Something went wrong";
                    toastr.error(message);
                }

            });
        }



        // $('#order-list').append('<h1>Hello</h1>');

        function getCart() {

            var html = '';

            $.each(carts.orderItems, function (key, value) {
                var _product = products.find(function (product) {
                    return product.product_id === value.product_id
                });
                html += '<li class="mdl-list__item mdl-list__item--two-line">' +
                    '<span class="mdl-list__item-primary-content">' +
                    '<span>' + _product.product_name + ' x ' + value.product_quantity + '(' + pSizes[parseInt(value.product_size_id)] + ') </span>' +
                    ' <span class="mdl-list__item-sub-title">Amount: R' + total[value.key] + '</span>' +
                    ' </span>' +
                    '</li>';


            });
            html += '<li class="mdl-list__item mdl-list__item--two-line"><span class="mdl-list__item-primary-content">Order Total: R' + carts.total_amount + '</span></li>';
            $('.checkout-list ').empty();
            $('.checkout-list ').append(html);
        }

        function getPayments() {
            $.ajax({
                type: 'GET',
                crossDomain: true,
                contentType: 'application/json; charset=utf-8',
                url: '/api/v1/paymenttypes',
                dataType: "json",
                cache: false,
                beforeSend: function () {

                },
                success: function (data) {
                    //console.log(data);
                    if (data.status === 1) {
                        $.each(data.payment_types, function (key, value) {
                            $('#paymentSelect')
                                .append($("<option></option>")
                                    .attr("value", value.payment_type_id)
                                    .text(value.payment_type_name));
                        });
                        $('#paymentSelect').change(function () {
                            if ($(this).val() === 'Cash') {
                                $('.cash').show();
                                $('.card').hide();
                                carts.bankCardObj = null;
                            } else {
                                $('.cash').hide();
                                $('.card').show();
                                carts.bankCardObj ={
                                    account_type_id: 1,
                                    card_number: '',
                                    card_holder: '',
                                    validity: ''
                                };
                        });
                        getProduct();
                    }
                },
                error: function (e) {
                    message = "Something went wrong";
                    toastr.error(message);
                }

            });
        }



        function handleOrdersData(data) {
            var html = '';

            if (data && data.status == 1 && data.products.length > 0) {
                products = data.products;
                for (var key = 0, size = products.length; key < size; key++) {
                    quantity.push(0);
                    total.push(0);
                    sizes.push(0);

                    html += '<tr >' +
                        '<td class="mdl-data-table__cell--non-numeric">' + products[key].product_name + '</td>' +
                        '<td class="mdl-data-table__cell--non-numeric truncate">R ' + products[key].product_price + '</td>' +
                        '<td class="mdl-data-table__cell--non-numeric"> <select class="size" id="size' + key + '"  data-key="' + key + '" disabled> ' +
                        '<option value="0">Small</option>' +
                        '<option value="20">Medium</option>' +
                        '<option value="30">Large</option>' +
                        '</select> </td>' +
                        '<td class="mdl-data-table__cell--non-numeric"><select class="topping" id="topping' + key + '" data-key="' + key + '" disabled="' + (products[key].product_type_id === 1) + '"</td>' +
                        '<td class="mdl-data-table__cell--non-numeric">  <input class="quantity" type="number" value="' + quantity[key] + '" data-key="' + key + '" id="quantity' + key + '" /> </td>' +
                        '<td class="mdl-data-table__cell--non-numeric"> <input class="total" type="text" value="R ' + total[key] + '" id="total' + key + '" disabled></td>' +
                        '<td class="mdl-data-table__cell--non-numeric">' +
                        '<a disabled class="mdl-button add-cart mdl-js-button mdl-js-ripple-effect mdl-button--icon modal-trigger" data-key="' + key + '" id="add' + key + '">+</a></td>' +
                        '<td class="mdl-data-table__cell--non-numeric">' +
                        '<a disabled class="mdl-button remove-cart mdl-js-button mdl-js-ripple-effect mdl-button--icon modal-trigger" data-key="' + key + '" id="remove' + key + '">-</a></td>' +
                        '</tr>';
                }
            } else {
                html += '<span class="mdl-chip mdl-color--red-300"><span class="mdl-chip__text"><b>Oops!! No data found.</b></span></span>';
            }
            //console.log(html);
            $("#tblPlaceOrders tbody").html(html);
            if (data && data.status == 1 && data.products.length > 0) {
                $('#tblPlaceOrders .quantity').change(function () {
                    var key = $(this).data('key');
                    quantity[key] = $(this).val();
                    var size = 0;

                    if (quantity[key] > 0) {
                        size = $('#size' + key).val();
                        $('#size' + key).attr('disabled', false);
                        $('#add' + key).attr('disabled', false);
                    } else {
                        $('#size' + key).attr('disabled', true);
                        size = 0;
                    }
                    var price = data.products[key].product_price;
                    sizes[key] = size;
                    //total[key] = (price * quantity[key]) + parseInt(sizes[key]);
                    total[key] = (price + parseInt(sizes[key])) * quantity[key];
                    $('#total' + key).val('R ' + total[key]);

                });

                $('#tblPlaceOrders .size').change(function () {
                    var key = $(this).data('key');
                    var size = $('#size' + key).val();
                    total[key] -= parseInt(sizes[key]);
                    total[key] += parseInt(size);
                    sizes[key] = size;
                    $('#total' + key).val('R ' + total[key]);
                });

                $('#tblPlaceOrders .add-cart').click(function () {
                    var key = $(this).data('key');
                    $('#add' + key).attr('disabled', true);
                    $('#quantity' + key).attr('disabled', true);
                    $('#remove' + key).attr('disabled', false);

                    carts.total_amount = (parseInt(carts.total_amount) + total[key]).toString();

                    carts.orderItems.push({
                        key: key,
                        product_size_id: sizes[key] === "0" ? 1 : (parseInt(sizes[key]) / 10),
                        product_id: data.products[key].product_id,
                        product_quantity: quantity[key],
                        amount: total[key]
                    });

                    getCart();
                });


                $('#tblPlaceOrders .remove-cart').click(function () {
                    var key = $(this).data('key');
                    carts.total_amount = (parseInt(carts.total_amount) - total[key]).toString();

                    carts.orderItems = carts.orderItems.filter(function (order) {
                        return order['key'] !== key;
                    });

                    $('#size' + key).val(0);
                    $('#quantity' + key).val(0);
                    $('#quantity' + key).val(0);
                    total[key] = 0;
                    $('#total' + key).val('R ' + total[key]);

                    // $('#add' + key).attr('disabled', false);
                    $('#size' + key).attr('disabled', false);
                    $('#quantity' + key).attr('disabled', false);
                    $('#remove' + key).attr('disabled', true);

                    getCart();
                });
            }
        }

        $('#placeOrder').click(function () {
            carts.customer_id = $('#customerSelect').val();
            carts.payment_type_id = $('#paymentSelect').val();
            
            // card values
            carts.bankCardObj ={
                account_type_id: $('#cardType').val(),
                card_number: $('#cardNumber').val(),
                card_holder: $('#cardHolder').val(),,
                validity: getValidity()
            };
            
            //console.log(carts);

            //Submit.
            $.ajax({
                type: 'POST',
                crossDomain: true,
                data: JSON.stringify(carts),
                contentType: 'application/json; charset=utf-8',
                url: '/api/v1/customerorders',
                dataType: "json",
                cache: false,
                success: function (data) {
                    if (data.status == 0) {
                        toastr.error(data.message);
                    } else {
                        toastr.success(data.message);
                        //reload page to clear cart.
                        setTimeout(function () {
                            location.reload();
                        }, 500);
                    }
                },
                error: function (e) {
                    console.log(e);
                    message = 'Something went wrong';
                    toastr.error(message);
                }

            });

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

        var total_calc = '';
        $('#calc_total').val('R 0.00');
        $('#calc_change').val('R ' + (0 - parseFloat(carts.total_amount)).toFixed(2));

        $('#checkoutBtn').click(function () {
            $('#calc_change').val('R ' + (0 - parseFloat(carts.total_amount)).toFixed(2));
        });

        $('.calc-grid').on('click', '.number-calc', function () {
            var action = $(this).data('action');

            if (action === -1) {
                $('#calc_total').val('R 0.00');
                $('#calc_change').val('R ' + (0 - parseFloat(carts.total_amount)).toFixed(2));
                total_calc = '';
            } else {
                total_calc += action;
                var remainder = parseFloat(carts.total_amount);
                $('#calc_total').val('R ' + total_calc);
                $('#calc_change').val('R ' + (parseFloat(total_calc) - remainder).toFixed(2));
            }
            
            if((parseFloat(total_calc) - remainder).toFixed(2) > -1){
                $('#checkoutBtn').removeClass('hide-btn'); 
                $('#checkoutBtn').addClass('show-btn');
            }
            else{
                $('#checkoutBtn').removeClass('show-btn');
                $('#checkoutBtn').addClass('hide-btn');
                  
            }
        });
        
 
    }); // end of document ready
}(jQuery)); // end of jQuery name space
