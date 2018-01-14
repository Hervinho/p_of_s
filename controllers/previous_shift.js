$(document).ready(function () {
    
    GetPreviousShiftData();
 
 });

 function GetPreviousShiftData(){
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/customerorders/total/shifts',
        dataType: "json",
        cache: false,
        success: handlePreviousShiftData,
        error: function (e) {
            message = "Something went wrong";
            toastr.error(message);
        }

    });
 }

 /****** AJAX Callback functions ********/
 function handlePreviousShiftData(data){
    console.log(data);
    var message = data.message, name = data.shift_name, start = data.shift_start, end = data.shift_end, 
        total = data.total === undefined ? 0 : data.total, html = '', html_message = '';

    if(data.status == 1){
        html_message += '<p>Message: '+ message + '</p>';
    }
    else{
        html_message += '<p style="color: red;"><strong>Message: </strong>'+ message + '</p>';
    }

    html += '<p><strong>Previous Shift: </strong>'+ name + '</p>' +
        '<p><strong>Start - End: </strong>'+ start + ' -- ' + end + '</p>' +
        '<p><strong>Total: R </strong>'+ total + '</p>' + html_message;

    $("#PreviousShiftInfo ").html(html);
 }