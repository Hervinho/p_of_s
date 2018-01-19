var message, customerOrderID, orderFilterCustomerVal, orderFilterDateVal, orderFilterDateToVal;
var payment_types = [], paymentTypeNames = [], orderCountPaymentType = [];
var employees = [], employeeNames = [], orderCountEmployee = [];
var products = [], productNames = [], orderCountProduct = [];
var product_types = [], productTypeNames = [], orderCountProductType = [];
var maxArrayValue, maxValueIndex, topSoldProduct = {};

var colorsArray = [
        "#008000", "#808080", "#800000", "#FFFF00", "#00FFFF", "#008080",
        "#455C73", "#9B59B6", "#BDC3C7", "#26B99A", "#3498DB", "#CCEEFF",
        "#b399ff", "#ffff99", "#aaaa55", "#335966", "#bf8040", "#734d26",
        "#609f9f", "#333333"
    ],
    hoverArray = [
        "#0000FF", "#800080", "#C2C87D", "#129696", "##F9E79F", "#D7BDE2",
        "#34495E", "#B370CF", "#CFD4D8", "#36CAAB", "#49A9EA", "#00FF00",
    ];

$(document).ready(function () {
    //LoadAllShifts();
    LoadAllProducts();
    LoadAllProductTypes();
    LoadAllPaymentTypes();
    LoadAllEmployees();

    $(document).on('change', '.form-control, .any-date', function () {
        
    });
});

function LoadAllProducts() {

    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/products',
        dataType: "json",
        cache: false,
        success: handleProductsData,
        error: function (e) {
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function LoadAllProductTypes() {

    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/producttypes',
        dataType: "json",
        cache: false,
        success: handleProductTypesData,
        error: function (e) {
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function LoadAllPaymentTypes() {
    $.ajax({
        type: 'GET',
        crossDomain: true,
        contentType: 'application/json; charset=utf-8',
        url: '/api/v1/paymenttypes',
        dataType: "json",
        cache: false,
        success: handlePaymentTypeData,
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
        success: handleEmployeeData,
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
        success: handleShiftData,
        error: function (e) {
            console.log(e);
            message = "Something went wrong";
            toastr.error(message);
        }

    });
}

function ResetFilters(){
    
    $("#filterOrdersByDateTo").val("");
    $("#filterOrdersByDate").val("");
}

function FilterByProductAndDate(){
    //count number of customer orders of a certain product and date. and display in chart.
    var orderChartId = "orderPolarChartProduct", orderPolarChartId = "orderPolarChart";
    orderFilterDateVal = $("#filterOrdersByDate").val();
    orderFilterDateToVal = $("#filterOrdersByDateTo").val();
    isValidDate = moment(orderFilterDateVal.toString(), "YYYY-MM-DD", true).isValid();
    isValidDateTo = moment(orderFilterDateToVal.toString(), "YYYY-MM-DD", true).isValid();

    //clear the count arrays.
    orderCountProduct.length = 0;
    orderCountProductType.length = 0;

    if(isValidDate == true && isValidDateTo == false){
        //Products
        countOrdersPerProduct(products, orderFilterDateVal);
        displayDoughnutChart(productNames, orderCountProduct, orderChartId);

        //Prdocut types
        countOrdersPerProductType(product_types, orderFilterDateVal);
        displayPolarAreaChart(productTypeNames, orderCountProductType, orderPolarChartId);
    }
    else if(isValidDate == true && isValidDateTo == true){
        
        if(moment(orderFilterDateVal).format("YYYY-MM-DD") >= moment(orderFilterDateToVal).format("YYYY-MM-DD")){
            toastr.error("Date_From cannot be greater than or equal to Date_To");
            return;
        }

        //Products
        countOrdersPerProductInDateRange(products, orderFilterDateVal, orderFilterDateToVal);
        displayDoughnutChart(productNames, orderCountProduct, orderChartId);

        //Product types
        countOrdersPerProductTypeInDateRange(product_types, orderFilterDateVal, orderFilterDateToVal);
        displayPolarAreaChart(productTypeNames, orderCountProductType, orderPolarChartId);

    }
    else{
        toastr.info("Select either only one date from first datepicker or select from both datepickers");
    }
}

//function to count number of orders of certain product in given date.
function countOrdersPerProduct(array, date){
    for (var key = 0, size = array.length; key < size; key++) {
        $.ajax({
            type: 'GET',
            async: false,
            crossDomain: true,
            contentType: 'application/json; charset=utf-8',
            url: '/api/v1/customerorders/products/' + array[key].product_id + '/date/' + date + '/count',
            dataType: "json",
            cache: false,
            success: function (data) {
                orderCountProduct.push(data[0].orderCountProduct);
            },
            error: function (e) {
                message = "Something went wrong";
                toastr.error(message);
            }

        });
    }
    maxArrayValue = Math.max.apply(null, orderCountProduct), maxValueIndex = orderCountProduct.indexOf(maxArrayValue);
    topSoldProduct = products[maxValueIndex];

    /*console.log('orderCountProduct: ', orderCountProduct);
    console.log('Max value: ', maxArrayValue);
    console.log('Index of max value: ', maxValueIndex);*/
    console.log('Top Sold Product: ', topSoldProduct);
    $("#txtTopSoldProduct").text(topSoldProduct.product_name);
}

//function to count number of orders of certain product in given DATE RANGE
function countOrdersPerProductInDateRange(array, datefrom, dateto){
    for (var key = 0, size = array.length; key < size; key++) {
        $.ajax({
            type: 'GET',
            async: false,
            crossDomain: true,
            contentType: 'application/json; charset=utf-8',
            url: '/api/v1/customerorders/products/' + array[key].product_id + '/datefrom/' + datefrom + '/dateto/' + dateto +'/count',
            dataType: "json",
            cache: false,
            success: function (data) {
                orderCountProduct.push(data[0].orderCountProduct);
            },
            error: function (e) {
                message = "Something went wrong";
                toastr.error(message);
            }

        });
    }
    
    //console.log('orderCountProduct: ', orderCountProduct);
    maxArrayValue = Math.max.apply(null, orderCountProduct), maxValueIndex = orderCountProduct.indexOf(maxArrayValue);
    topSoldProduct = products[maxValueIndex];
    console.log('Top Sold Product: ', topSoldProduct);

    $("#txtTopSoldProduct").text(topSoldProduct.product_name);
}

//function to count number of orders of certain product TYPE in given date.
function countOrdersPerProductType(array, date){
    for (var key = 0, size = array.length; key < size; key++) {
        $.ajax({
            type: 'GET',
            async: false,
            crossDomain: true,
            contentType: 'application/json; charset=utf-8',
            url: '/api/v1/customerorders/producttypes/' + array[key].product_type_id + '/date/' + date + '/count',
            dataType: "json",
            cache: false,
            success: function (data) {
                orderCountProductType.push(data[0].orderCountProductType);
            },
            error: function (e) {
                message = "Something went wrong";
                toastr.error(message);
            }

        });
    }
    
    //console.log('orderCountProductType: ', orderCountProductType);
}

//function to count number of orders of certain product TYPE in given DATERANGE
function countOrdersPerProductTypeInDateRange(array, datefrom, dateto){
    for (var key = 0, size = array.length; key < size; key++) {
        $.ajax({
            type: 'GET',
            async: false,
            crossDomain: true,
            contentType: 'application/json; charset=utf-8',
            url: '/api/v1/customerorders/producttypes/' + array[key].product_type_id + '/datefrom/' + datefrom + '/dateto/' + dateto + '/count',
            dataType: "json",
            cache: false,
            success: function (data) {
                orderCountProductType.push(data[0].orderCountProductType);
            },
            error: function (e) {
                message = "Something went wrong";
                toastr.error(message);
            }

        });
    }
    
    //console.log('orderCountProductType: ', orderCountProductType);
}

//function to get number of customer orders of a certain payment type.
function countOrdersPerPaymentType(array) {

    for (var key = 0, size = array.length; key < size; key++) {
        $.ajax({
            type: 'GET',
            async: false,
            crossDomain: true,
            contentType: 'application/json; charset=utf-8',
            url: '/api/v1/customerorders/paymenttypes/' + array[key].payment_type_id + '/count',
            dataType: "json",
            cache: false,
            success: function (data) {
                orderCountPaymentType.push(data[0].ordersCountPaymentType);
            },
            error: function (e) {
                message = "Something went wrong";
                toastr.error(message);
            }

        });
    }
}

//function to get number of customer orders captured by a specific employee.
function countOrdersPerEmployee(array) {

    for (var key = 0, size = array.length; key < size; key++) {
        $.ajax({
            type: 'GET',
            async: false,
            crossDomain: true,
            contentType: 'application/json; charset=utf-8',
            url: '/api/v1/customerorders/employees/' + array[key].employee_id + '/count',
            dataType: "json",
            cache: false,
            success: function (data) {
                orderCountEmployee.push(data[0].orderCountEmployee);
            },
            error: function (e) {
                message = "Something went wrong";
                toastr.error(message);
            }

        });
    }
}

//function to display pie charts
function displayPieChart(namesArray, orderCount, divId) {

    var num_colors = [];

    //Randomly choose which colors will be on the chart.
    for (var key = 0, size = namesArray.length; key < size; key++) {
        num_colors[key] = colorsArray[Math.floor(Math.random() * colorsArray.length)];
    }

    if ($("#" + divId).length) {
        var f = document.getElementById(divId),
            i = {
                datasets: [{
                    data: orderCount,
                    backgroundColor: num_colors,
                    label: "Orders Chart"
                }],
                labels: namesArray
            };
        new Chart(f, {
            data: i,
            type: "pie",
            otpions: {
                legend: !1
            }
        })
    }

}

//function to display doughnut charts
function displayDoughnutChart(namesArray, orderCount, divId) {

    if ($("#" + divId).length) {
        var colors = [], hovers = [];

        //Randomly choose which colors will be on the chart.
        for (var key = 0, size = namesArray.length; key < size; key++) {
            colors[key] = colorsArray[Math.floor(Math.random() * colorsArray.length)];
            hovers[key] = hoverArray[Math.floor(Math.random() * hoverArray.length)];
        }
        var f = document.getElementById(divId),
            i = {
                labels: namesArray,
                datasets: [{
                    data: orderCount,
                    backgroundColor: colors,
                    hoverBackgroundColor: hovers
                }]
            };
        new Chart(f, {
            type: "doughnut",
            tooltipFillColor: "rgba(51, 51, 51, 0.55)",
            data: i
        });
    }

}

//function to display polar area charts
function displayPolarAreaChart(namesArray, orderCount, divId) {
    
    if ($("#" + divId).length) {
        var colors = [];

        //Randomly choose which colors will be on the chart.
        for (var key = 0, size = namesArray.length; key < size; key++) {
            colors[key] = colorsArray[Math.floor(Math.random() * colorsArray.length)];
        }
        
        var f = document.getElementById(divId),
            i = {
                datasets: [{
                    data: orderCount,
                    backgroundColor: colors,
                    label: "Polar Area Chart"
                }],
                labels: namesArray
            };
        new Chart(f, {
            data: i,
            type: "polarArea",
            options: {
                scale: {
                    ticks: {
                        beginAtZero: !0
                    }
                }
            }
        });
    }

}

/*********** AJAX Callback functions ***********/
function handleProductsData(data){
    //console.log('products: ', data.products);

    if (data.status == 1 && data.products.length > 0) {
        products = data.products;
        for (var key = 0, size = products.length; key < size; key++) {
            productNames[key] = products[key].product_name;
        }
    }
    //console.log(productNames);
}

function handleProductTypesData(data){
    //console.log('product_types: ', data.product_types);

    if (data.status == 1 && data.product_types.length > 0) {
        product_types = data.product_types;
        for (var key = 0, size = product_types.length; key < size; key++) {
            productTypeNames[key] = product_types[key].product_type_name;
        }
    }
    //console.log(productTypeNames);
}

function handlePaymentTypeData(data) {
    //console.log('payment_types: ', data);
    var orderChartId = "orderBarChartPaymentType";

    if (data.status == 1 && data.payment_types.length > 0) {
        payment_types = data.payment_types;
        for (var key = 0, size = payment_types.length; key < size; key++) {
            paymentTypeNames[key] = payment_types[key].payment_type_name;
        }
    }

    //count number of customer orders of a certain payment type. and display in chart.
    countOrdersPerPaymentType(payment_types);
    displayPieChart(paymentTypeNames, orderCountPaymentType, orderChartId);
}

function handleEmployeeData(data) {
    //console.log('payment_types: ', data);
    var orderChartId = "orderBarChartEmployee";

    if (data.status == 1 && data.employees.length > 0) {
        employees = data.employees;
        for (var key = 0, size = employees.length; key < size; key++) {
            employeeNames[key] = employees[key].employee_name;
        }
    }

    //count number of customer orders of a certain payment type. and display in chart.
    countOrdersPerEmployee(employees);
    displayPieChart(employeeNames, orderCountEmployee, orderChartId);
}

function handleShiftData(data) {

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

    $("#filterShift").html(html);
}