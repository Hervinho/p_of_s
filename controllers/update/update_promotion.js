var message, promotionId, promotionObj = {}, products = [], newArray = [];

$(document).ready(function () {
    
});

function UpdatePromotion() {
    
    //get checkbox values.
    $("input:checkbox[name=product]:checked").each(function () {
        products.push({
            product_id: parseInt($(this).val())
        });
    });
    console.log(products);
    promotionId = $("#lbSelectedPromotion").html().toString();
    promotionObj = {
        promotion_id: promotionId,
        promotion_name: $("#txtViewPromotionName").val(),
        valid_from_date: $("#txtViewPromotionValidFrom").val(),
        valid_to_date: $("#txtViewPromotionValidUntil").val(),
        promotion_desc: $("#txtViewPromotionDescription").val(),
        promotion_price: parseInt($("#txtViewPromotionPrice").val()),
        products: products
    };
    
    //Validations
    if (validateEditPromotionForm(promotionObj) == true) {
        //toastr.info("Yay");
        
        $.ajax({
            type: 'PUT',
            crossDomain: true,
            data: JSON.stringify(promotionObj),
            contentType: 'application/json; charset=utf-8',
            url: '/api/v1/promotions/',
            dataType: "json",
            cache: false,
            success: function (data) {
                if (data.status == 0) {
                    toastr.error(data.message);
                } else {
                    toastr.success(data.message);
                    //clear form.
                    $("#txtViewPromotionName").val("");
                    $("#txtViewPromotionType").val(0);
                    $("#txtViewPromotionDescription").val("");
                    $("#txtViewPromotionPrice").val("");
                    $("#txtViewPromotionValidUntil").val("");
                    $("#txtViewPromotionValidFrom").val("");

                    //Reset label for selected event.
                    $("#lbSelectedPromotion").text('Selected Promotion');

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

function validateEditPromotionForm(promotionObj) {
    var flag = true;
    var productArray = promotionObj.products;
    var name_format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    var no_numbers = /\d/;
    var fromdate = promotionObj.valid_from_date, todate = promotionObj.valid_to_date;
    var isValid_from_date = moment(fromdate.toString(), "YYYY-MM-DD", true).isValid(), 
        isValid_to_date = moment(todate, "YYYY-MM-DD", true).isValid();

    if (name_format.test(promotionObj.promotion_name) || no_numbers.test(promotionObj.promotion_name)) {
        flag = false;
        message = 'Promotion Name contains illegal characters.';
    }

    if (promotionObj.promotion_name.length <= 1) {
        flag = false;
        message = 'Promotion Name is too short.';
    }
    if (promotionObj.promotion_desc.length <= 5) {
        flag = false;
        message = 'Promotion description is too short.';
    }
    if (!$.isNumeric(promotionObj.promotion_price)) {
        flag = false;
        message = 'Invalid price for Promotion.';
    }
    if($.isNumeric(promotionObj.promotion_price) && promotionObj.promotion_price < 0){
        flag = false;
        message = 'Promotion price cannot be negative.';
    }
    if($.isNumeric(promotionObj.promotion_price) && promotionObj.promotion_price == 0){
        flag = false;
        message = 'Promotion price cannot be zero.';
    }
    if(!isValid_from_date || !isValid_to_date){
        flag = false;
        message = 'Invalid dates provided.';
    }

    if (productArray.length == 0) {
        flag = false;
        message = 'No Products selected. Please select at least one Product';
    }

    return flag;
}
