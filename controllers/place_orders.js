(function ($) {
    'use strict';
    $(function () {
        var products;
        var total = [];
        var quantity = [];
        var sizes = [];
        var toppings = [];
        var basetypes = [];
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
        getToppings();
        getBaseTypes();
        getAccountTypes();
        getProductTypes();

        //onChange: to filter products by type.
        $(document).on('change', '#prodTypeSelect', function () {
            var typeId = $("#prodTypeSelect").val();
            
            if(typeId != 0){
                filterProductsByType(typeId);
            } else{
                getProducts();
            }

        });

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

        function filterProductsByType(productTypeId) {
            $.ajax({
                type: 'GET',
                crossDomain: true,
                contentType: 'application/json; charset=utf-8',
                url: '/api/v1/products/types/' + productTypeId,
                dataType: "json",
                cache: false,
                beforeSend: function () {
                    var wait = '<span class="mdl-chip mdl-color--blue-300"><span class="mdl-chip__text"><b>Waiting for data...</b></span></span>';
                    $("#tablePlaceOrders tbody").html(wait);
                },
                success: handleDisplayProducts,
                error: function (e) {
                    console.log(e);
                    message = "Something went wrong";
                    toastr.error(message);
                }
        
            });
        };

        function getProductTypes() {
            $.ajax({
                type: 'GET',
                crossDomain: true,
                contentType: 'application/json; charset=utf-8',
                url: '/api/v1/producttypes',
                dataType: "json",
                cache: false,
                success: function (data) {
                    $.each(data.product_types, function (key, value) {
                        $('#prodTypeSelect')
                            .append($("<option></option>")
                                .attr("value", value.product_type_id)
                                .text(value.product_type_name));
                    });
                },
                error: function (e) {
                    console.log(e);
                    message = "Something went wrong";
                    toastr.error(message);
                }
        
            });
        }

        function getToppings() {
            $.ajax({
                type: 'GET',
                crossDomain: true,
                contentType: 'application/json; charset=utf-8',
                url: '/api/v1/toppings',
                dataType: "json",
                cache: false,
                beforeSend: function () {

                },
                success: function (data) {
                    if (data.status === 1) {
                        toppings = data.toppings;
                    }

                },
                error: function (e) {
                    message = "Something went wrong";
                    toastr.error(message);
                }

            });
        };

        function getBaseTypes() {
            $.ajax({
                type: 'GET',
                crossDomain: true,
                contentType: 'application/json; charset=utf-8',
                url: '/api/v1/basetypes',
                dataType: "json",
                cache: false,
                beforeSend: function () {

                },
                success: function (data) {
                    if (data.status === 1) {
                        basetypes = data.base_types;
                    }

                },
                error: function (e) {
                    message = "Something went wrong";
                    toastr.error(message);
                }

            });
        };

        function getCardTypes() {
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


        function getProducts() {
            $.ajax({
                type: 'GET',
                crossDomain: true,
                contentType: 'application/json; charset=utf-8',
                url: '/api/v1/products/statuses/1',
                dataType: "json",
                cache: false,
                beforeSend: function () {
                    var wait = '<span class="mdl-chip mdl-color--blue-300"><span class="mdl-chip__text"><b>Waiting for data...</b></span></span>';
                    $("#tablePlaceOrders tbody").html(wait);
                },
                success: handleDisplayProducts,
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
            console.log(carts.orderItems);
            if (carts.orderItems.length > 0) {
                $('#checkoutBtn').removeAttr('disabled');
            } else {
                $('#checkoutBtn').attr('disabled', true);
            }

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
                            if ($(this).val() === '1') {
                                $('.cash').show();
                                $('.card').hide();
                                carts.bankCardObj = null;
                            } else {
                                $('.cash').hide();
                                $('.card').show();
                                carts.bankCardObj = {
                                    account_type_id: 1,
                                    card_number: '',
                                    card_holder: '',
                                    validity: ''
                                }
                            }
                        });
                        getProducts();
                    }
                },
                error: function (e) {
                    message = "Something went wrong";
                    toastr.error(message);
                }

            });
        }

        function handleDisplayProducts(data) {
            var html = '';

            if (data && data.status == 1 && data.products.length > 0) {
                products = data.products;

                for (var key = 0, size = products.length; key < size; key++) {
                    quantity.push(0);
                    total.push(0);
                    sizes.push(0);
                    var _toppingsHtml = '',
                        _basetypesHtml = '';
                    var disabled = '';
                    if (products[key].product_type_id === 1) {
                        //toppings
                        toppings.forEach(function (el) {
                            _toppingsHtml += '<option value=' + el.topping_id + '>' + el.topping_name + '</option>';
                        });

                        //basetypes.
                        basetypes.forEach(function (el) {
                            _basetypesHtml += '<option value=' + el.base_type_id + '>' + el.base_type_name + '</option>';
                        });

                    } else {
                        disabled = 'disabled';
                        _toppingsHtml = '<option value="0"></option>';
                        _basetypesHtml = '<option value="0"></option>';
                    }
                    html += '<tr >' +
                        '<td class="mdl-data-table__cell--non-numeric">' + products[key].product_name + '</td>' +
                        '<td class="mdl-data-table__cell--non-numeric truncate">R ' + products[key].product_price + '</td>' +
                        '<td class="mdl-data-table__cell--non-numeric"> <select class="size" id="size' + key + '"  data-key="' + key + '" disabled> ' +
                        '<option value="0">Small</option>' +
                        '<option value="20">Medium</option>' +
                        '<option value="30">Large</option>' +
                        '</select> </td>' +
                        '<td class="mdl-data-table__cell--non-numeric"><select class="topping" id="topping' + key + '" data-key="' + key + '" ' + disabled + ' >' + _toppingsHtml + '</select></td>' +
                        '<td class="mdl-data-table__cell--non-numeric"><select class="topping" id="basetype' + key + '" data-key="' + key + '" ' + disabled + ' >' + _basetypesHtml + '</select></td>' +
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
            $("#tablePlaceOrders tbody").html(html);
            if (data && data.status == 1 && data.products.length > 0) {
                $('#tablePlaceOrders .quantity').change(function () {
                    var key = $(this).data('key');
                    quantity[key] = $(this).val();
                    var size = 0;
                    var topping = 0;//delete if nw.

                    if (quantity[key] > 0) {
                        size = $('#size' + key).val();
                        topping = $('#topping' + key).val();//delete if nw
                        $('#size' + key).attr('disabled', false);
                        $('#topping' + key).attr('disabled', false);
                        $('#basetype' + key).attr('disabled', false);
                        $('#add' + key).attr('disabled', false);
                    } else {
                        $('#size' + key).attr('disabled', true);
                        size = 0;
                    }
                    var price = data.products[key].product_price;
                    sizes[key] = size;
                    console.log('topping: ' + topping, 'type: ' + typeof topping);
                    //increase amount by 10 if topping is chosen.
                    if(topping > 0){
                        total[key] = (price + parseInt(sizes[key]) + 10) * quantity[key];
                    }
                    else{
                        total[key] = (price + parseInt(sizes[key])) * quantity[key];
                    }
                    
                    $('#total' + key).val('R ' + total[key]);

                });

                $('#tablePlaceOrders .size').change(function () {
                    var key = $(this).data('key');
                    var size = $('#size' + key).val();
                    total[key] -= parseInt(sizes[key]);
                    total[key] += parseInt(size);
                    sizes[key] = size;
                    $('#total' + key).val('R ' + total[key]);
                });

                $('#tablePlaceOrders .add-cart').click(function () {
                    var key = $(this).data('key');
                    $('#add' + key).attr('disabled', true);
                    $('#quantity' + key).attr('disabled', true);
                    $('#remove' + key).attr('disabled', false);

                    carts.total_amount = (parseInt(carts.total_amount) + total[key]).toString();

                    carts.orderItems.push({
                        key: key,
                        product_size_id: sizes[key] === "0" ? 1 : (parseInt(sizes[key]) / 10),
                        topping_id: parseInt($('#topping' + key).val()),
                        base_type_id: parseInt($('#basetype' + key).val()),
                        product_id: data.products[key].product_id,
                        product_quantity: quantity[key],
                        amount: total[key]
                    });

                    getCart();
                });


                $('#tablePlaceOrders .remove-cart').click(function () {
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

        //checkbox for payment on collection.
        $(document).on('change', '#payOnCollection', function () {
            var isChecked = document.getElementById("payOnCollection").checked;

            if (isChecked == true) {
                $('.mdl-card ').hide();
                $('#placeOrder').removeAttr('disabled');

            } else {
                $('.mdl-card ').show();
                $('#placeOrder').attr('disabled', true);
            }

        });

        $('#placeOrder').click(function () {
            carts.customer_id = $('#customerSelect').val();
            carts.payment_type_id = $('#paymentSelect').val();
            var isChecked = document.getElementById("payOnCollection").checked;

            //if payment on collection is false, you pay before submitting and collect card/cash
            if (isChecked == false) {

                // card values
                if (carts.payment_type_id === '2') {
                    carts.bankCardObj = {
                        account_type_id: $('#cardType').val(),
                        card_number: $('#cardNumber').val(),
                        card_holder: $('#cardHolder').val(),
                        validity: $('#fromCardMonth').val() + '/' + $('#fromCardYear').val() + ' - ' + $('#toCardMonth').val() + '/' + $('#toCardYear').val()
                    };

                    if (($('#fromCardYear').val() >= $('#toCardYear').val()) ||
                        $('#fromCardYear').val().length > 2 || $('#toCardYear').val().length > 2 ||
                        $('#fromCardMonth').val().length > 2 || $('#toCardMonth').val().length > 2) {

                        toastr.error('Invalid Card Date Range!');
                        return;
                    }

                    //if bank card dialog is filled, payment received.
                    carts.payment_status_id = 1;

                } else {//payment type is cash, payment status is 1 (PAID)
                    carts.bankCardObj = null;
                    carts.payment_status_id = 1;
                }
            } else {
                //Payment will be received upon collection
                carts.bankCardObj = null;
                carts.payment_status_id = 2;
            }

            console.log(carts);

            //Submit order into the system..
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


        var total_calc = '';

        $('.form-close').click(function () {
            total_calc = '';
            $('#calc_total').val('R 0.00');
            $('#calc_change').val('R ' + (0 - parseFloat(carts.total_amount)).toFixed(2));
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


    }); // end of document ready
}(jQuery)); // end of jQuery name space