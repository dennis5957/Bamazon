/*jshint esversion:6 */

let BamazonDb = require("./bamazonDb");
let bamazon = new BamazonDb();

//testGetProducts();

function testGetProducts() {
    bamazon.getProducts().then((products) => {
        console.log(products);
    });
}


//testGetProductById(8);

function testGetProductById(aProductId) {
    bamazon.getProductById(aProductId).then((product) => {
        console.log(product);
    });
}



testGetProductsByDepartment("Clothing");

function testGetProductsByDepartment(aDepartment) {
    bamazon.getProductsByDepartment(aDepartment).then(products => {
        console.log(products);
    });
}