var message, productId, productObj = {};

$(document).ready(function () {
    //Pick up changes in all select elements.
    $(document).on('change', '.product-type-change', function () {

    });
});

function UpdateProduct() {
    productId = $("#lbSelectedProduct").html().toString();
    productObj = {
        product_id: productId,
        product_name: $("#txtViewProductName").val(),
        product_type_id: parseInt($("#txtViewProductType").val()),
        product_status_id: parseInt($("#txtViewProductStatus").val()),
        product_desc: $("#txtViewProductDescription").val(),
        product_price: parseInt($("#txtViewProductPrice").val())
    };

    //Validations
    if (validateEditProductForm(productObj) == true) {
        //toastr.success('Oui');
        $.ajax({
            type: 'PUT',
            crossDomain: true,
            data: JSON.stringify(productObj),
            contentType: 'application/json; charset=utf-8',
            url: '/api/v1/products/',
            dataType: "json",
            cache: false,
            success: function (data) {
                if (data.status == 0) {
                    toastr.error(data.message);
                } else {
                    toastr.success(data.message);
                    //clear form.
                    $("#txtViewProductName").val("");
                    $("#txtViewProductDescription").val("");
                    $("#txtViewProductPrice").val("");
                    $("#txtViewProductType").val("");

                    //Reset label for selected event.
                    $("#lbSelectedProduct").text('Selected Product');

                    //Reload page.
                    setTimeout(function() {
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
    } else {
        toastr.error(message);
    }

}

function validateEditProductForm(productObj) {
    var flag = true;
    var name_format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    var no_numbers = /\d/;

    if (name_format.test(productObj.product_name) || no_numbers.test(productObj.product_name)) {
        flag = false;
        message = 'Product Name contains illegal characters.';
    }

    if (productObj.product_name.length <= 1) {
        flag = false;
        message = 'Product Name is too short.';
    }
    if (productObj.product_desc.length <= 5) {
        flag = false;
        message = 'Product description is too short.';
    }
    if (!$.isNumeric(productObj.product_price)) {
        flag = false;
        message = 'Invalid price for Product.';
    }
    if($.isNumeric(productObj.product_price) && productObj.product_price < 0){
        flag = false;
        message = 'Product price cannot be negative.';
    }
    if($.isNumeric(productObj.product_price) && productObj.product_price == 0){
        flag = false;
        message = 'Product price cannot be zero.';
    }
    if (productObj.product_type_id === 0 || productObj.product_type_id === null || productObj.product_type_id === undefined) {
        flag = false;
        message = 'No product type. Please select a Product Type';
    }
    if (productObj.product_status_id === 0 || productObj.product_status_id === null || productObj.product_status_id === undefined) {
        flag = false;
        message = 'No product status. Please select a Product Status';
    }

    return flag;
}
