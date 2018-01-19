var message, promotionID, promotionFilterStatusVal, promotionFilterTypeVal;

$(document).ready(function () {
   LoadAllPromotions();

    $(document).on('change', '.form-control', function () {
        promotionFilterStatusVal = $("#promotionFilterStatus").val();
        promotionFilterTypeVal = $("#promotionFilterType").val();

        if (promotionFilterStatusVal != 0 && promotionFilterTypeVal == 0) {
            FilterPromotionsByStatus(promotionFilterStatusVal);
        } 
        else if(promotionFilterStatusVal == 0 && promotionFilterTypeVal != 0){
            FilterPromotionsByProduct(promotionFilterTypeVal);
        }
        else {
            LoadAllPromotions();
        }
    });
});

function LoadAllPromotions(){
    LoadAllPromotionStatuses();
    LoadAllProducts();

    //Reset all filters.
    $("#promotionFilterStatus").val(0);
    $("#promotionFilterType").val(0);

    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/promotions',
        dataType: "json",
        cache: false,
        beforeSend: function () {
            var wait = '<span class="mdl-chip mdl-color--blue-300"><span class="mdl-chip__text"><b>Waiting for data...</b></span></span>';
            $("#tblPromotions tbody").html(wait);
        },
        success: handlePromotionsData,
        error: function (e) {
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function FilterPromotionsByStatus(statusId){
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/promotions/statuses/' + statusId,
        dataType: "json",
        cache: false,
        beforeSend: function () {
            var wait = '<span class="mdl-chip mdl-color--blue-300"><span class="mdl-chip__text"><b>Waiting for data...</b></span></span>';
            $("#tblPromotions tbody").html(wait);
        },
        success: handlePromotionsData,
        error: function (e) {
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function FilterPromotionsByProduct(productId){
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/promotions/products/' + productId,
        dataType: "json",
        cache: false,
        beforeSend: function () {
            var wait = '<span class="mdl-chip mdl-color--blue-300"><span class="mdl-chip__text"><b>Waiting for data...</b></span></span>';
            $("#tblPromotions tbody").html(wait);
        },
        success: handlePromotionsData,
        error: function (e) {
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function LoadAllPromotionStatuses(){
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/promotionstatuses',
        dataType: "json",
        cache: false,
        success: function (data) {
            var html = '<option value = "0"></option>';
            if (data.status == 1 && data.promotion_statuses.length > 0) {
                var promotion_statuses = data.promotion_statuses;
                for (var key = 0, size = promotion_statuses.length; key < size; key++) {
                    html += '<option value =' + promotion_statuses[key].promotion_status_id + ' >' +
                    promotion_statuses[key].promotion_status_name +
                        '</option>';
                }
            } else {
                html += '<option value = "0">No promotion statuses found</option>';
            }

            $("#promotionFilterStatus").html(html);

            //Also Populate promotion statuses in the dialogViewPromotion
            $("#txtViewPromotionStatus").html(html);
        },
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function LoadAllProducts() {
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/products',
        dataType: "json",
        cache: false,
        success: function (data) {
            var html = '<option value = "0"></option>', htmlCheckbox = '';
            if (data.status == 1 && data.products.length > 0) {
                var products = data.products;
                for (var key = 0, size = products.length; key < size; key++) {
                    html += '<option value =' + products[key].product_id + ' >' +
                        products[key].product_name +
                        '</option>';
                    
                    //checkbox
                    htmlCheckbox += '<label>' + products[key].product_name +
                        '</label><input type="checkbox" id="txtProductId' + products[key].product_id + '" value=' + 
                        products[key].product_id + ' name=product>';
                }
            } else {
                html += '<option value = "0">No product found</option>';
            }
            
            $("#promotionFilterType").html(html);

            //Also Populate productss in the dialogViewPromotion and dialogAddPromotion
            var htmlLabel = '<label class="mdl-textfield__label" for="">Products</label>';
            $("#txtAddProductCheckboxes").html(htmlCheckbox + htmlLabel);
            $("#txtViewProductCheckboxes").html(htmlCheckbox + htmlLabel);
        },
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function ViewPromotionInfo(id){
    //promotionID = id;
    $("#lbSelectedPromotion").text(id);

    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/promotions/' + id,
        dataType: "json",
        cache: false,
        success: function (data) {
            //console.log(data.products);
            var promotion = data.promotion;
            var promotionName = promotion.promotion_name;
            var promotionDesc = promotion.promotion_desc;
            var promotionPrice = promotion.promotion_price;
            var promotionValidFrom = promotion.valid_from_date;
            var promotionValidUntil = promotion.valid_to_date;
            var promotionStatusId = promotion.promotion_status_id;
            var promotionAddedBy = promotion.employee_name;
            var products = data.products;

            $("#txtViewPromotionName").val(promotionName);
            $("#txtViewPromotionStatus").val(promotionStatusId);
            $("#txtViewPromotionValidFrom").val(promotionValidFrom);
            $("#txtViewPromotionValidUntil").val(promotionValidUntil);
            $("#txtViewPromotionDescription").val(promotionDesc);
            $("#txtViewPromotionPrice").val(promotionPrice);
            $("#txtViewPromotionAddedBy").val(promotionAddedBy);

            //First uncheck all checkboxes.
            $("input:checkbox[name=product]").each(function () {
                this.checked = false;
            });
            console.log(products);
            //Only check checkboxes having products of the promotion.
            for(var key = 0, size = products.length; key < size; key++){
                $("input:checkbox[name=product]").each(function () {
                    if(products[key].product_id == parseInt($(this).val())){
                        this.checked = true;
                    }
                });
            }
        },
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function UpdatePromotionStatus(opval, promId, promName, promPrice){
    var obj = {
        operation_value: opval,
        promotion_id: promId,
        promotion_name: promName,
        promotion_price: promPrice
    };

    console.log(obj);
    $.ajax({
        type: 'PUT',
        crossDomain: true,
        data: JSON.stringify(obj),
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/promotions/statuses',
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

function handlePromotionsData(data) {
    var html = '';
    if (data && data.status == 1 && data.promotions.length > 0) {
        var promotions = data.promotions;
        for (var key = 0, size = promotions.length; key < size; key++) {
            html += '<tr ><td class="mdl-data-table__cell--non-numeric">' +
                promotions[key].promotion_name + '</td><td class="mdl-data-table__cell--non-numeric truncate">' +
                promotions[key].valid_from_date + '</td><td class="mdl-data-table__cell--non-numeric">' +
                promotions[key].valid_to_date + '</td><td class="mdl-data-table__cell--non-numeric">' +
                'R ' + promotions[key].promotion_price + '</td><td class="mdl-data-table__cell--non-numeric">' +
                promotions[key].employee_name + '</td><td class="mdl-data-table__cell--non-numeric">' +
                '<button class="mdl-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" style="background-color: #2ECF33;" type="button" onclick="return UpdatePromotionStatus(1,\'' + promotions[key].promotion_id + '\', \'' + promotions[key].promotion_name + '\', \'' + promotions[key].promotion_price + '\');">Activate</button>  ' + 
                '<button class="mdl-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" style="background-color: #EE4A4A;" type="button" onclick="return UpdatePromotionStatus(2,\'' + promotions[key].promotion_id + '\', \'' + promotions[key].promotion_name + '\', \'' + promotions[key].promotion_price + '\');">Expire</button></td><td class="mdl-data-table__cell--non-numeric">' +
                '<a class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon modal-trigger"  data-target="#dialogViewPromotion" onclick="return ViewPromotionInfo(\'' + promotions[key].promotion_id + '\' )">' +
                '<i class="material-icons">visibility</i></a></td>' +
                '</tr>';
        }
    } else {
        html += '<span class="mdl-chip mdl-color--red-300"><span class="mdl-chip__text"><b>Oops!! No data found.</b></span></span>';
    }
    //console.log(html);
    $("#tblPromotions tbody").html(html);
}