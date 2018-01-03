var message, shiftID;
$(document).ready(function () {

    LoadAllShifts();

});

function LoadAllShifts() {
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/shifts',
        dataType: "json",
        cache: false,
        beforeSend: function () {
            var wait = '<span class="mdl-chip mdl-color--blue-300"><span class="mdl-chip__text"><b>Waiting for data...</b></span></span>';
            $("#tblShifts tbody").html(wait);
        },
        success: handleShiftsData,
        error: function (e) {
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function ViewShiftInfo(id) {
    $("#lbSelectedShift").text(id);

    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/shifts/' + id,
        dataType: "json",
        cache: false,
        success: function (data) {
            //console.log(data);
            var shift = data.shift;
            var shiftName = shift.shift_name;
            var shiftStartTime = shift.shift_start_time;
            var shiftEndTime = shift.shift_end_time;

            $("#txtViewShiftName").val(shiftName);
            $("#txtViewShiftStartTime").val(shiftStartTime);
            $("#txtViewShiftEndTime").val(shiftEndTime);
        },
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

/*********** AJAX Callback functions ***********/

function handleShiftsData(data) {

    var html = '';
    if (data && data.status == 1 && data.shifts.length > 0) {
        var shifts = data.shifts;
        for (var key = 0, size = shifts.length; key < size; key++) {
            html += '<tr ><td class="mdl-data-table__cell--non-numeric">' +
                shifts[key].shift_name + '</td><td class="mdl-data-table__cell--non-numeric truncate">' +
                shifts[key].shift_start_time + '</td><td class="mdl-data-table__cell--non-numeric">' +
                shifts[key].shift_end_time + '</td><td class="mdl-data-table__cell--non-numeric">' +
                '<a class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon modal-trigger"  data-target="#dialogViewShift" onclick="return ViewShiftInfo(\'' + shifts[key].shift_id + '\' )">' +
                '<i class="material-icons">visibility</i></a></td>' +
                '</tr>';
        }
    } else {
        html += '<span class="mdl-chip mdl-color--red-300"><span class="mdl-chip__text"><b>Oops!! No data found.</b></span></span>';
    }
    //console.log(html);
    $("#tblShifts tbody").html(html);
    //$("#tblShifts").dataTable({processing:true});
}