const express = require('express');
const app = express();
var bodyParser = require('body-parser')
const db = require('./database');
const utils = require('./utils');

// parse text as URL encoded data 

app.use(bodyParser.urlencoded({ extended: false }));
// parse text as JSON and expose the resulting object on req.body
app.use(bodyParser.json());

app.get('/testserver', function (req, res) {
    res.send("Server is running...");
});

app.post('/login', function (req, res) {
    const mobile = req.body.mobile;
    const password = utils.generateOTP();
    db.auth.login(mobile, password).then((success) => {
        res.json(success);
    });
});

app.post('/verify', function (req, res) {
    const mobile = req.body.mobile;
    const password = req.body.password;
    db.auth.verify(mobile, password).then((vendor) => {
        if (vendor.length > 0) {
            const vendorId = vendor[0].id;
            db.vendors.details(vendorId).then((vendorDetails) => {
                let response = {};
                response = vendorDetails[0][0];
                response.ratings = vendorDetails[2][0].ratings;
                response.services = vendorDetails[1];
                res.json(response);
            });
        } else {
            res.json(null);
        }

    });
});

app.get('/services', function (req, res) {
    const vendorId = req.query.vendorId;
    const serviceId = req.query.serviceId;
    db.services.list(vendorId, serviceId).then((services) => {
        if (services.length > 0) {
            res.json(services);
        } else {
            res.json(null);
        }

    });
});

app.get('/vendors', function (req, res) {
    const serviceId = req.query.serviceId;
    db.vendors.list(serviceId).then((vendors) => {
        res.json(vendors);
    });
});

app.put('/vendors', function (req, res) {
    const vendorInput = req.body;
    db.vendors.update(vendorInput).then((vendor) => {
        res.json(vendor);
    });
});

app.get('/vendors/details', function (req, res) {
    const vendorId = req.query.vendorId;
    db.vendors.details(vendorId).then((vendorDetails) => {
        let response = {};
        if (vendorDetails[0][0]) {
            response = vendorDetails[0][0];
            response.ratings = vendorDetails[2][0].ratings;
            response.services = vendorDetails[1];
        }
        res.json(response);
    });
});

app.post('/vendorservice', function (req, res) {
    const vendorId = req.query.vendorId;
    const serviceId = req.query.serviceId;
    db.vendorservice.create(vendorId, serviceId).then((service) => {
        res.json(service);
    });
});

app.delete('/vendorservice', function (req, res) {
    const vendorId = req.query.vendorId;
    const serviceId = req.query.serviceId;
    db.vendorservice.delete(vendorId, serviceId).then((success) => {
        res.json(success);
    });
});


app.post('/ratings', function (req, res) {
    const vendorId = req.body.vendorId;
    const serviceId = req.body.serviceId;
    const rating = req.body.rating;
    db.ratings.create(vendorId, serviceId, rating).then((success) => {
        res.json(success);
    });
});

app.get('/feedbacks', function (req, res) {
    db.feedbacks.list().then((feedbacks) => {
        var response = feedbacks;
        res.json(response);
    });
});

app.post('/feedbacks', function (req, res) {
    const feedback = req.body;
    db.feedbacks.create(feedback).then((success) => {
        res.json(success);
    });
});

app.use(express.static('public'));

app.listen(3000, function () {
    console.log("Server is running...");
});