var baseUrl = "http://localhost:3000";
var mobile = '';

function request(method, url, payload) {
    return new Promise((resolve) => {
        $.ajax({
            type: method,
            dataType: "json",
            data: JSON.stringify(payload),
            url: baseUrl + url,
            contentType: "application/json; charset=UTF-8",
            success: function(response) {
                resolve(response);
            },
            error: function(error) {
                alert("Some error occured");
                console.log(error);
            }
        });
    });
}

function submitFeedback() {
    // get values from the view
    var email = $('#email').val();
    var name = $('#name').val();
    var message = $('#message').val();
    // if needed - you can validate input here

    // make a http request with the data
    request('POST', '/feedbacks', {
        email: email,
        name: name,
        message: message
    }).then((success) => {
        if (success) {
            alert("Submitted successfully");
            var email = $('#email').val('');
            var name = $('#name').val('');
            var message = $('#message').val('');
        } else {
            alert("Some error occured");
        }
    });
    return false;
}

function validateMobileNumber(isResend) {
    mobile = $('#mobile').val();
    request('POST', '/login', {
        mobile: mobile
    }).then((success) => {
        if (success) {
            if (!isResend) {
                $('#mobileNumberModal').modal('toggle');
                $('#otpModal').modal('toggle');
            } else {
                alert("Otp sent!");
            }
        } else {
            alert("Error generating otp");
        }
    });
    return false;
};

function validateOtp() {
    const password = $('#otp').val();
    request('POST', '/verify', {
        mobile: mobile,
        password: password
    }).then((vendor) => {
        if (vendor) {
            localStorage.setItem("vendor", JSON.stringify(vendor));
            window.location.href = "http://localhost:3000/profile.html";   
        } else {
            alert("please enter correct otp");
        }
    });
    return false;
}