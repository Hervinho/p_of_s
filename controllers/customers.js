$(document).ready(function () {
    var message, customerID, genderFilterVal;

    LoadAllCustomers();

    $(document).on('change', '.form-control', function () {
        genderFilterVal = $("#customerFilterGender").val();

        if (genderFilterVal != 0) {
            FilterCustomersByGender(genderFilterVal);
        }
        else {
            LoadAllCustomers();
        }
    });
});

function LoadAllCustomers() {

    LoadAllGenders();

    //Reset all filters.
    $("#customerFilterGender").val(0);

    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/customers',
        dataType: "json",
        cache: false,
        beforeSend: function () {
            var wait = '<span class="mdl-chip mdl-color--blue-300"><span class="mdl-chip__text"><b>Waiting for data...</b></span></span>';
            $("#tblCustomers tbody").html(wait);
        },
        success: handleCustomersData,
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function LoadAllGenders() {
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/genders',
        dataType: "json",
        cache: false,
        success: function (data) {
            //console.log(data);
            var html = '<option value = "0"></option>';
            if (data.status == 1 && data.genders.length > 0) {
                var genders = data.genders;
                for (var key = 0, size = genders.length; key < size; key++) {
                    html += '<option value =' + genders[key].gender_id + ' >' +
                    genders[key].gender_name +
                        '</option>';
                }
            } else {
                html += '<option value = "0">No genders found</option>';
            }

            $("#customerFilterGender").html(html);
            $("#txtAddCustomerGender").html(html);
            $("#txtViewCustomerGender").html(html);
        },
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function FilterCustomersByGender(genderId){
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/customers/genders/' + genderId,
        dataType: "json",
        cache: false,
        beforeSend: function () {
            var wait = '<span class="mdl-chip mdl-color--blue-300"><span class="mdl-chip__text"><b>Waiting for data...</b></span></span>';
            $("#tblCustomers tbody").html(wait);
        },
        success: handleCustomersData,
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function ViewCustomerInfo(id){
    $("#lbSelectedCustomer").text(id);
    
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/customers/filter/' + id,
        dataType: "json",
        cache: false,
        success: function (data) {
            //console.log(data.customer);
            var customer = data.customer;
            var name = customer.customer_name;
            var phone = customer.customer_phone;
            var email = customer.customer_email;
            var date_added = customer.customer_date_added;
            var genderId = customer.customer_gender_id;
            var customerAddedBy = customer.employee_name;

            $("#txtViewCustomerGender").val(genderId);
            $("#txtViewCustomerName").val(name);
            $("#txtViewCustomerPhone").val(phone);
            $("#txtViewCustomerEmail").val(email);
            $("#txtViewCustomerDateAdded").val(date_added);
            $("#txtViewCustomerAddedBy").val(customerAddedBy);
        },
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

/*********** AJAX Callback functions ***********/

function handleCustomersData(data) {

    var html = '';
    if (data && data.status == 1 && data.customers.length > 0) {
        var customers = data.customers;
        for (var key = 0, size = customers.length; key < size; key++) {
            html += '<tr ><td class="mdl-data-table__cell--non-numeric">' +
            customers[key].customer_name + '</td><td class="mdl-data-table__cell--non-numeric truncate">' +
            customers[key].customer_phone + '</td><td class="mdl-data-table__cell--non-numeric">' +
            customers[key].customer_email + '</td><td class="mdl-data-table__cell--non-numeric">' +
            customers[key].customer_date_added + '</td><td class="mdl-data-table__cell--non-numeric">' +
            //customers[key].employee_name + '</td>' +
            '<a class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon modal-trigger"  data-target="#dialogViewCustomer" onclick="return ViewCustomerInfo(\'' + customers[key].customer_id + '\' )">' +
            '<i class="material-icons">visibility</i></a></td>' +
            '</tr>';
        }
    } else {
        html += '<span class="mdl-chip mdl-color--red-300"><span class="mdl-chip__text"><b>Oops!! No data found.</b></span></span>';
    }
    //console.log(html);
    $("#tblCustomers tbody").html(html);
}