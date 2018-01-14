var message, customerObj = {};

$(document).ready(function () {
    //Pick up changes in all select elements.
    $(document).on('change', '.gender-change', function () {

    });
});

function AddCustomer() {
    customerObj = {
        customer_name: $("#txtAddCustomerName").val(),
        customer_gender_id: parseInt($("#txtAddCustomerGender").val()),
        customer_email: $("#txtAddCustomerEmail").val(),
        customer_phone: $("#txtAddCustomerPhone").val()
    };

    //Validations
    if (validateAddCustomerForm(customerObj) == true) {
        //toastr.success('HEY');
        //console.log(customerObj);
        $.ajax({
            type: 'POST',
            crossDomain: true,
            data: JSON.stringify(customerObj),
            contentType: 'application/json; charset=utf-8',
            url: '/api/v1/customers/',
            dataType: "json",
            cache: false,
            success: function (data) {
                if (data.status == 0) {
                    toastr.error(data.message);
                } else {
                    toastr.success(data.message);
                    //clear form.
                    $("#txtAddCustomerName").val("");
                    $("#txtAddCustomerGender").val(0);
                    $("#txtAddCustomerEmail").val("");
                    $("#txtAddCustomerPhone").val(0);

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

function validateAddCustomerForm(customerObj) {
    var flag = true;
    var name_format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    var no_numbers = /\d/;
    var isMobilePhone = validator.isMobilePhone(customerObj.customer_phone, 'en-ZA');
    var isEmail = validator.isEmail(customerObj.customer_email);

    if (name_format.test(customerObj.customer_name) || no_numbers.test(customerObj.customer_name)) {
        flag = false;
        message = 'Customer Name contains illegal characters.';
    }

    if (customerObj.customer_name.length <= 1) {
        flag = false;
        message = 'Customer Name is too short.';
    }
    if (!isEmail) {
        flag = false;
        message = 'Invalid email format for customer email.';
    }
    if(!isMobilePhone){
        flag = false;
        message = 'Invalid Phone format for customer.';
    }
    if (customerObj.customer_gender_id === 0 || customerObj.customer_gender_id === null || customerObj.customer_gender_id === undefined) {
        flag = false;
        message = 'No gender selected. Please select a gender';
    }

    return flag;
}
