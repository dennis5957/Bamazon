const mysql = require('mysql');
const inquirer = require("inquirer");


const BamazonDb = function () {
    let pool = mysql.createPool({
        host: 'localhost',
        user: 'webUser',
        password: 'webUser',
        database: 'bamazon'
    });


    this.getDepartments = function () {
        return new Promise(function (resolve, reject) {
            pool.getConnection((err, conn) => {
                let q = "SELECT DISTINCT department_name FROM products ORDER BY department_name";
                conn.query(q, (err, departments) => {
                    departments = JSON.parse(JSON.stringify(departments));
                    if (err) return reject(err);
                    conn.release();
                    return resolve(departments);
                });
            });
        });
    };


    this.getProducts = function () {
        return new Promise(function (resolve, reject) {
            pool.getConnection((err, conn) => {
                let q = "SELECT * FROM products ORDER BY department_name, product_name";
                conn.query(q, (err, products) => {
                    if (err) {
                        return reject(err);
                    }
                    conn.release();
                    return resolve(JSON.parse(JSON.stringify(products)));
                });
            });
        });
    };


    this.getProductById = function (aProductId) {
        return new Promise(function (resolve, reject) {
            pool.getConnection((err, conn) => {
                let q = "SELECT * FROM products WHERE item_id = ?";
                conn.query(q, [aProductId], (err, product) => {
                    product = JSON.parse(JSON.stringify(product[0]));
                    if (err) {
                        return reject(err);
                    }
                    conn.release();
                    return resolve(product);
                });
            });
        });
    };


    this.getProductsByDepartment = function (aDepartment) {
        return new Promise(function (resolve, reject) {
            pool.getConnection((err, conn) => {
                let q = "SELECT * FROM products WHERE department_name = ?";
                conn.query(q, [aDepartment], (err, products) => {
                    if (err) {
                        return reject(err);
                    }
                    conn.release();
                    products = JSON.parse(JSON.stringify(products));
                    var dept = {
                        department: {
                            name: aDepartment,
                            value: aDepartment
                        },
                        prods: products
                    };
                    return resolve(dept);
                });
            });
        });
    };


    this.getLowInventoryProducts = function (aLowInventoryLimit) {
        return new Promise(function (resolve, reject) {
            pool.getConnection((err, conn) => {
                if (err) reject(err);
                let q = "SELECT * FROM products WHERE stock_quantity < ? ORDER BY department_name, product_name";
                conn.query(q, [aLowInventoryLimit], (err, products) => {
                    conn.release();
                    products = JSON.parse(JSON.stringify(products));
                    return resolve(products);
                });
            });
        });
    };


    this.purchaseProduct = function (aProduct, aQuantity) {
        return new Promise(function (resolve, reject) {
            var newQuantity = aProduct.stock_quantity - aQuantity;
            pool.getConnection((err, conn) => {
                let q = "UPDATE products SET stock_quantity = ? WHERE item_id = ?";
                conn.query(q, [newQuantity, aProduct.item_id],
                    (err, products) => {
                        if (err) return reject(err);
                        return resolve();
                    });
            });
        });
    };


    this.addNewProduct = function (aProduct) {
        return new Promise(function (resolve, reject) {
            pool.getConnection((err, conn) => {
                let q = "INSERT INTO products VALUES(?,?,?,?,?)";
                let values = [null, aProduct.product_name, aProduct.department_name, aProduct.price, aProduct.stock_quantity];
                conn.query(q, values, (err, res) => {
                    if (err) return reject(err);
                    return resolve(`${aProduct.product_name} Added!!!`);
                });
            });
        });
    };


    this.modifyProduct = function (aModifiedProduct) {
        console.log(aModifiedProduct);
        let mp = aModifiedProduct;
        return new Promise(function (resolve, reject) {
            pool.getConnection((err, conn) => {
                let q = "UPDATE products SET product_name = ?, department_name = ?, price = ?, stock_quantity = ? WHERE item_id = ?";
                conn.query(q, [mp.product_name, mp.department_name, mp.price, mp.stock_quantity, mp.item_id],
                    (err, res) => {
                        if (err) return reject(err);
                        return resolve("Product Quantity Update Complete !");
                    }
                );
            });
        });
    };

};


module.exports = BamazonDb;