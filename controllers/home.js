$(document).ready(function () {
    var message, productID, productFilterTypeVal, productFilterStatusVal;

    LoadAllProducts();

    $(document).on('change', '.form-control', function () {
        productFilterTypeVal = $("#productFilterType").val();
        productFilterStatusVal = $("#productFilterStatus").val();

        if (productFilterTypeVal != 0 && productFilterStatusVal == 0) {
            FilterProductsByType(productFilterTypeVal);
        }
        else if(productFilterTypeVal == 0 && productFilterStatusVal != 0){
            FilterProductsByStatus(productFilterStatusVal);
        } else {
            LoadAllProducts();
        }
    });
});

function LoadAllProducts() {

    LoadAllProductTypes();
    LoadAllProducStatuses();

    //Reset all filters.
    $("#productFilterType").val(0);

    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/products',
        dataType: "json",
        cache: false,
        beforeSend: function () {
            var wait = '<span class="mdl-chip mdl-color--blue-300"><span class="mdl-chip__text"><b>Waiting for data...</b></span></span>';
            $("#tblProducts tbody").html(wait);
        },
        success: handleProductsData,
        error: function (e) {
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function ViewProductInfo(id) {
    productID = id;
    $("#lbSelectedProduct").text(productID);

    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/products/' + productID,
        dataType: "json",
        cache: false,
        success: function (data) {
            //console.log(data);
            var product = data.product;
            var productName = product.product_name;
            var productDesc = product.product_desc;
            var productPrice = product.product_price;
            var productTypeId = product.product_type_id;
            var productStatusId = product.product_status_id;
            var productAddedBy = product.employee_name;

            $("#txtViewProductName").val(productName);
            $("#txtViewProductType").val(productTypeId);
            $("#txtViewProductDescription").val(productDesc);
            $("#txtViewProductPrice").val(productPrice);
            $("#txtViewProductStatus").val(productStatusId);
            $("#txtViewProductAddedBy").val(productAddedBy);
        },
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function LoadAllProductTypes() {
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/producttypes',
        dataType: "json",
        cache: false,
        success: function (data) {
            var html = '<option value = "0"></option>';
            if (data.status == 1 && data.product_types.length > 0) {
                var product_types = data.product_types;
                for (var key = 0, size = product_types.length; key < size; key++) {
                    html += '<option value =' + product_types[key].product_type_id + ' >' +
                        product_types[key].product_type_name +
                        '</option>';
                }
            } else {
                html += '<option value = "0">No product types found</option>';
            }

            $("#productFilterType").html(html);

            //Also Populate product types in the dialogViewProduct and dialogAddProduct
            $("#txtViewProductType").html(html);
            $("#txtAddProductType").html(html);
        },
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function LoadAllProducStatuses(){
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/productstatuses',
        dataType: "json",
        cache: false,
        success: function (data) {
            var html = '<option value = "0"></option>';
            if (data.status == 1 && data.product_statuses.length > 0) {
                var product_statuses = data.product_statuses;
                for (var key = 0, size = product_statuses.length; key < size; key++) {
                    html += '<option value =' + product_statuses[key].product_status_id + ' >' +
                    product_statuses[key].product_status_name +
                        '</option>';
                }
            } else {
                html += '<option value = "0">No product statuses found</option>';
            }

            $("#productFilterStatus").html(html);

            //Also Populate product types in the dialogViewProduct
            $("#txtViewProductStatus").html(html);
        },
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function FilterProductsByType(productTypeId) {
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/products/types/' + productTypeId,
        dataType: "json",
        cache: false,
        beforeSend: function () {
            var wait = '<span class="mdl-chip mdl-color--blue-300"><span class="mdl-chip__text"><b>Waiting for data...</b></span></span>';
            $("#tblProducts tbody").html(wait);
        },
        success: handleProductsData,
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function FilterProductsByStatus(productStatusId) {
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/products/statuses/' + productStatusId,
        dataType: "json",
        cache: false,
        beforeSend: function () {
            var wait = '<span class="mdl-chip mdl-color--blue-300"><span class="mdl-chip__text"><b>Waiting for data...</b></span></span>';
            $("#tblProducts tbody").html(wait);
        },
        success: handleProductsData,
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function UpdateProductStatus(opval, prodId){
    var obj = {
        operation_value: opval,
        product_id: prodId
    };

    console.log(obj);
    $.ajax({
        type: 'PUT',
        crossDomain: true,
        data: JSON.stringify(obj),
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/products/statuses',
        dataType: "json",
        cache: false,
        success: function (data) {
            if (data.status == 0) {
                toastr.error(data.message);
            } else {
                toastr.success(data.message);
                
            }
        },
        error: function (e) {
            console.log(e);
            message = 'Something went wrong';
            toastr.error(message);
        }

    });
}

/*********** AJAX Callback functions ***********/

function handleProductsData(data) {

    var html = '';
    if (data && data.status == 1 && data.products.length > 0) {
        var products = data.products;
        for (var key = 0, size = products.length; key < size; key++) {
            html += '<tr ><td class="mdl-data-table__cell--non-numeric">' +
                products[key].product_name + '</td><td class="mdl-data-table__cell--non-numeric truncate">' +
                products[key].product_desc + '</td><td class="mdl-data-table__cell--non-numeric">' +
                'R ' + products[key].product_price + '</td><td class="mdl-data-table__cell--non-numeric">' +
                products[key].employee_name + '</td><td class="mdl-data-table__cell--non-numeric">' +
                '<a class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon modal-trigger"  data-target="#dialogViewProduct" onclick="return ViewProductInfo(\'' + products[key].product_id + '\' )">' +
                '<i class="material-icons">visibility</i></a></td>' +
                '</tr>';
        }
    } else {
        html += '<span class="mdl-chip mdl-color--red-300"><span class="mdl-chip__text"><b>Oops!! No data found.</b></span></span>';
    }
    //console.log(html);
    $("#tblProducts tbody").html(html);
    //$('#tblProducts').dataTable({processing:true});
}
