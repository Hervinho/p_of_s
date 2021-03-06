var message, customerObj = {};

$(document).ready(function () {
    //Pick up changes in all select elements.
    $(document).on('change', '.gender-change', function () {

    });
});

function UpdateCustomer() {
    customerObj = {
        customer_id: $("#lbSelectedCustomer").html().toString(),
        customer_name: $("#txtViewCustomerName").val(),
        customer_gender_id: parseInt($("#txtViewCustomerGender").val()),
        customer_phone: $("#txtViewCustomerPhone").val(),
        customer_email: $("#txtViewCustomerEmail").val()
    };

    //Validations
    if (validateEditCustomerForm(customerObj) == true) {
        //toastr.success('Oui');
        $.ajax({
            type: 'PUT',
            crossDomain: true,
            data: JSON.stringify(customerObj),
            contentType: 'application/json; charset=utf-8',
            url: '/api/v1/customers',
            dataType: "json",
            cache: false,
            success: function (data) {
                if (data.status == 0) {
                    toastr.error(data.message);
                } else {
                    toastr.success(data.message);
                    
                    //clear form.
                    $("#txtViewCustomerGender").val(0);
                    $("#txtViewCustomerName").val("");
                    $("#txtViewCustomerPhone").val("");
                    $("#txtViewCustomerEmail").val("");
                    $("#txtViewCustomerDateAdded").val("");
                    $("#txtViewCustomerAddedBy").val("");

                    //Reset label for selected event.
                    $("#lbSelectedCustomer").text('Selected Customer');

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

function validateEditCustomerForm(customerObj) {
    var flag = true;
    var isMobilePhone = validator.isMobilePhone(customerObj.customer_phone, 'en-ZA');
    var isEmail = validator.isEmail(customerObj.customer_email);
    var name_format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    var no_numbers = /\d/;

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
        message = 'Invalid email format for employee email.';
    }
    if (!isMobilePhone) {
        flag = false;
        message = 'Invalid Phone number.';
    }

    if (customerObj.customer_gender_id === 0 || customerObj.customer_gender_id === null || customerObj.customer_gender_id === undefined) {
        flag = false;
        message = 'No gender selected. Please select a gender';
    }

    return flag;
}