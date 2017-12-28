$(document).ready(function () {
    var message, employeeID, roleFilterTypeVal;

    LoadAllEmployees();

    $(document).on('change', '.form-control', function () {
        roleFilterTypeVal = $("#roleFilterType").val();

        if (roleFilterTypeVal != 0) {
            FilterEmployeesByRole(roleFilterTypeVal);
        } else {
            LoadAllEmployees();
        }
    });
});

function LoadAllEmployees() {

    LoadAllRoles();

    //Reset all filters.
    $("#roleFilterType").val(0);

    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/employees',
        dataType: "json",
        cache: false,
        beforeSend: function () {
            var wait = '<span class="mdl-chip mdl-color--blue-300"><span class="mdl-chip__text"><b>Waiting for data...</b></span></span>';
            $("#tblEmployees tbody").html(wait);
        },
        success: handleEmployeesData,
        error: function (e) {
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function ViewProductInfo(id) {
    employeeID = id;
    $("#lbSelectedProduct").text(employeeID);

    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/products/' + employeeID,
        dataType: "json",
        cache: false,
        success: function (data) {
            //console.log(data);
            var product = data.product;
            var productName = product.product_name;
            var productDesc = product.product_desc;
            var productPrice = product.product_price;
            var productTypeId = product.product_type_id;

            $("#txtViewProductName").val(productName);
            $("#txtViewProductType").val(productTypeId);
            $("#txtViewProductDescription").val(productDesc);
            $("#txtViewProductPrice").val(productPrice);
        },
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function LoadAllRoles() {
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/roles',
        dataType: "json",
        cache: false,
        success: function (data) {
            console.log(data);
            var html = '<option value = "0"></option>';
            if (data.status == 1 && data.roles.length > 0) {
                var roles = data.roles;
                for (var key = 0, size = roles.length; key < size; key++) {
                    html += '<option value =' + roles[key].role_id + ' >' +
                    roles[key].role_name +
                        '</option>';
                }
            } else {
                html += '<option value = "0">No roles found</option>';
            }

            $("#employeeFilterRole").html(html);

            //Also Populate product types in the dialogViewProduct
            $("#txtViewProductType").html(html);
        },
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function FilterEmployeesByRole(productTypeId) {
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
        success: handleEmployeesData,
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

/*********** AJAX Callback functions ***********/

function handleEmployeesData(data) {

    var html = '';
    if (data && data.status == 1 && data.employees.length > 0) {
        var employees = data.employees;
        for (var key = 0, size = employees.length; key < size; key++) {
            html += '<tr ><td class="mdl-data-table__cell--non-numeric">' +
            employees[key].employee_id_number + '</td><td class="mdl-data-table__cell--non-numeric truncate">' +
            employees[key].employee_name + '</td><td class="mdl-data-table__cell--non-numeric">' +
                employees[key].employee_phone + '</td><td class="mdl-data-table__cell--non-numeric">' +
                employees[key].employee_code + '<td class="mdl-data-table__cell--non-numeric">' +
                '<a class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon modal-trigger"  data-target="#dialogViewProduct" onclick="return ViewProductInfo(\'' + employees[key].employee_id + '\' )">' +
                '<i class="material-icons">visibility</i></a></td><td class="mdl-data-table__cell--non-numeric">' +
                '</tr>';
        }
    } else {
        html += '<span class="mdl-chip mdl-color--red-300"><span class="mdl-chip__text"><b>Oops!! No data found.</b></span></span>';
    }
    //console.log(html);
    $("#tblEmployees tbody").html(html);
}
