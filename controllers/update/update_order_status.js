var message, orderObj, orderFilterStatusVal;

$(document).ready(function () {
 
     $(document).on('change', '.form-control', function () {
        //orderFilterStatusVal = $("#orderFilterStatus").val();
     });
 });

 function UpdateOrderStatus(){
    orderId = $("#lbSelectedNewCustomerOrder").html().toString();
     orderObj = {
        customer_order_id: orderId,
        order_status_id: parseInt($("#orderFilterStatus").val())
     };

     if(validate(orderObj) == true){
        //toastr.success('Oui');
        $.ajax({
            type: 'PUT',
            crossDomain: true,
            data: JSON.stringify(orderObj),
            contentType: 'application/json; charset=utf-8',
            url: '/api/v1/customerorders/status',
            dataType: "json",
            cache: false,
            success: function (data) {
                if (data.status == 0) {
                    toastr.error(data.message);
                } else {
                    if(data.status_id == 2){
                        toastr.info(data.message);
                    }
                    else if(data.status_id == 3){
                        toastr.success(data.message);
                    }
                    
                    //update select dropdown.
                    $("#orderFilterStatus").val(data.status_id);
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
     }
     else{
        toastr.error(message);
     }
 }

 function validate(orderObj){
    var flag = true;

    if(orderObj.customer_order_id == 0){
        flag = false;
        message = 'No order selected.';
    }
    if(orderObj.order_status_id == 0){
        flag = false;
        message = 'No status selected. Please select a status.';
    }

    if(orderObj.order_status_id == 1){
        flag = false;
        message = 'Order cannot be updated to New again.';
    }

    return flag;
 }