var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "weddingBliss"
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});


var auth = {

    login: function (mobile, password) {
        return new Promise((resolve, reject) => {
            query = 'INSERT INTO vendors(mobile, password) VALUES("' +
                mobile + '", "' + password + '") ON DUPLICATE KEY' +
                ' UPDATE password="' + password + '"';
            con.query(query, (err, rows) => {
                if (err) reject(err);
                resolve(rows && rows.affectedRows > 0);
            });
        });
    },

    verify: function (mobile, password) {
        return new Promise((resolve, reject) => {
            query = 'SELECT * FROM vendors WHERE mobile="' + mobile + '" AND' +
                ' password="' + password + '"';
            con.query(query, (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

}
module.exports.auth = auth;

var services = {

    list: function (vendorId, serviceId) {
        return new Promise((resolve, reject) => {
            let query = 'SELECT * FROM services';
            if (serviceId)
                query = 'SELECT * FROM services WHERE id='+serviceId;
            else if (vendorId)
                query = 'SELECT * FROM services INNER JOIN vendorservice' +
                    ' ON services.id=vendorservice.serviceId' +
                    ' WHERE vendorservice.vendorId=' + vendorId;
            con.query(query, (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

}
module.exports.services = services;

var vendors = {

    list: function (serviceId) {
        return new Promise((resolve, reject) => {
            let query = 'SELECT * FROM vendors';
            if (serviceId)
                query = 'SELECT vendors.*, ratings.ratings, vendorservice.serviceId FROM vendorservice' +
                    ' INNER JOIN vendors ON vendorservice.vendorId=vendors.id' +
                    ' LEFT JOIN ratings ON ratings.vendorId=vendorservice.vendorId' +
                    ' AND ratings.serviceId=vendorservice.serviceId' +
                    ' WHERE vendorservice.serviceId=' + serviceId;
            con.query(query, (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

    update: function (vendor) {
        return new Promise((resolve, reject) => {
            let query = 'UPDATE vendors SET' +
                ' name="' + vendor.name + '",' +
                ' email="' + vendor.email + '",' +
                ' address="' + vendor.address + '"' +
                ' WHERE id=' + vendor.id;
            con.query(query, (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

    details: function (vendorId) {
        let p_vendor = new Promise((resolve, reject) => {
            con.query('SELECT * FROM vendors WHERE id=' + vendorId, (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
        let p_services = new Promise((resolve, reject) => {
            con.query('SELECT services.* FROM vendorservice INNER JOIN services ON' +
                ' vendorservice.serviceId=services.id WHERE vendorservice.vendorId=' + vendorId, (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                });
        });
        let p_rating = new Promise((resolve, reject) => {
            con.query('SELECT avg(ratings) as ratings FROM ratings WHERE vendorId=' + vendorId, (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
        return Promise.all([p_vendor, p_services, p_rating]);
    }

}
module.exports.vendors = vendors;

var feedbacks = {

    create: function (feedback) {
        return new Promise((resolve, reject) => {
            if (feedback) {
                query = 'INSERT INTO feedbacks (name, email, message) VALUES ("' +
                    feedback.name + '", "' + feedback.email + '", "' + feedback.message + '")';
                con.query(query, (err, rows) => {
                    if (err) reject(err);
                    resolve(rows && rows.affectedRows > 0);
                });
            }
        });
    },

    list: function () {
        return new Promise((resolve, reject) => {
            query = 'SELECT * FROM feedbacks';
            con.query(query, (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

}
module.exports.feedbacks = feedbacks;

var vendorservice = {

    create: function (vendorId, serviceId) {
        return new Promise((resolve, reject) => {
            if (vendorId && serviceId) {
                query = 'INSERT INTO vendorservice VALUES (' + vendorId + ', ' + serviceId + ')';
                con.query(query, (err, rows) => {
                    if (err) reject(err);
                    if(rows && rows.affectedRows > 0) {
                        services.list(null, serviceId).then(service => resolve(service[0]));
                    } else {
                        resolve(false);
                    }
                });
            }
        });
    },

    delete: function (vendorId, serviceId) {
        return new Promise((resolve, reject) => {
            if (vendorId && serviceId) {
                query = 'DELETE FROM vendorservice WHERE' +
                    ' vendorId=' + vendorId + ' AND serviceId=' + serviceId;
                con.query(query, (err, rows) => {
                    if (err) reject(err);
                    resolve(rows && rows.affectedRows > 0);
                });
            }
        });
    }

}
module.exports.vendorservice = vendorservice;

var ratings = {

    create: function (vendorId, serviceId, rating) {
        return new Promise((resolve, reject) => {
            if (vendorId && serviceId && rating) {
                query = 'INSERT INTO ratings VALUES (' + vendorId + ', ' + serviceId + ', ' + rating + ')';
                con.query(query, (err, rows) => {
                    if (err) reject(err);
                    resolve(rows && rows.length > 0);
                });
            }
        });
    }


}
module.exports.ratings = ratings;