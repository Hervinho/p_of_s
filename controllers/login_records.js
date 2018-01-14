$(document).ready(function () {
    var message, loginRecordFilterEmployeeVal, loginRecordFilterShiftVal, loginRecordFilterDateVal, isValidDate;
    
    LoadAllLoginRecords();
    
    $(document).on('change', '.form-control, .any-date', function () {
        loginRecordFilterEmployeeVal = $("#loginRecordFilterEmployee").val();
        loginRecordFilterShiftVal = $("#loginRecordFilterShift").val();
        loginRecordFilterDateVal = $("#loginRecordFilterDate").val();
        isValidDate = moment(loginRecordFilterDateVal.toString(), "YYYY-MM-DD", true).isValid();
        //console.log('Date: ', $("#loginRecordFilterDate").val());//testing
        
        if (loginRecordFilterEmployeeVal != 0 && loginRecordFilterShiftVal == 0 && loginRecordFilterDateVal.length <= 0) {
            FilterRecordsByEmployee(loginRecordFilterEmployeeVal);
        }
        else if(loginRecordFilterEmployeeVal == 0 && loginRecordFilterShiftVal != 0 && isValidDate){
            FilterRecordsByDayAndShift(loginRecordFilterShiftVal, loginRecordFilterDateVal);
            //toastr.info("Yay");
        }
    });
});

function LoadAllLoginRecords() {

    LoadAllEmployees();
    LoadAllShifts();

    //Reset all filters and date picker.
    $("#loginRecordFilterEmployee").val(0);
    $("#loginRecordFilterShift").val(0);
    $("#loginRecordFilterDate").val("");

    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/loginrecords',
        dataType: "json",
        cache: false,
        beforeSend: function () {
            var wait = '<span class="mdl-chip mdl-color--blue-300"><span class="mdl-chip__text"><b>Waiting for data...</b></span></span>';
            $("#tblLoginRecords tbody").html(wait);
        },
        success: handleRecordsData,
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function LoadAllEmployees() {
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/employees',
        dataType: "json",
        cache: false,
        success: function (data) {
            //console.log(data);
            var html = '<option value = "0"></option>';
            if (data.status == 1 && data.employees.length > 0) {
                var employees = data.employees;
                for (var key = 0, size = employees.length; key < size; key++) {
                    html += '<option value =' + employees[key].employee_id + ' >' +
                    employees[key].employee_name +
                        '</option>';
                }
            } else {
                html += '<option value = "0">No employees found</option>';
            }

            $("#loginRecordFilterEmployee").html(html);
        },
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function LoadAllShifts() {
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/shifts',
        dataType: "json",
        cache: false,
        success: function (data) {
            //console.log(data);
            var html = '<option value = "0"></option>';
            if (data.status == 1 && data.shifts.length > 0) {
                var shifts = data.shifts;
                for (var key = 0, size = shifts.length; key < size; key++) {
                    html += '<option value =' + shifts[key].shift_id + ' >' +
                    shifts[key].shift_name +
                        '</option>';
                }
            } else {
                html += '<option value = "0">No shifts found</option>';
            }

            $("#loginRecordFilterShift").html(html);
        },
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function FilterRecordsByEmployee(employeeId){
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/loginrecords/employees/' + employeeId,
        dataType: "json",
        cache: false,
        beforeSend: function () {
            var wait = '<span class="mdl-chip mdl-color--blue-300"><span class="mdl-chip__text"><b>Waiting for data...</b></span></span>';
            $("#tblLoginRecords tbody").html(wait);
        },
        success: handleRecordsData,
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function FilterRecordsByDayAndShift(shiftId, date){
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/loginrecords/shifts/' + shiftId + '/date/' + date,
        dataType: "json",
        cache: false,
        beforeSend: function () {
            var wait = '<span class="mdl-chip mdl-color--blue-300"><span class="mdl-chip__text"><b>Waiting for data...</b></span></span>';
            $("#tblLoginRecords tbody").html(wait);
        },
        success: handleRecordsData,
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

/*********** AJAX Callback functions ***********/

function handleRecordsData(data) {

    var html = '';
    if (data && data.status == 1 && data.login_records.length > 0) {
        var login_records = data.login_records;
        for (var key = 0, size = login_records.length; key < size; key++) {
            html += '<tr ><td class="mdl-data-table__cell--non-numeric">' +
            login_records[key].employee_name + '</td><td class="mdl-data-table__cell--non-numeric truncate">' +
            login_records[key].employee_code + '</td><td class="mdl-data-table__cell--non-numeric">' +
            login_records[key].login_timestamp + '</td>' +
            '</tr>';
        }
    } else {
        html += '<span class="mdl-chip mdl-color--red-300"><span class="mdl-chip__text"><b>Oops!! No data found.</b></span></span>';
    }
    //console.log(html);
    $("#tblLoginRecords tbody").html(html);
}