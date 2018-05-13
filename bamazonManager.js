const events = require("events");
const BamazonDb = require("./BamazonDb");
const inquirer = require("inquirer");
const __ = require("./util");

let BamazonManager = function (aCallback) {
    this.bamazon = new BamazonDb();
    this.prompt = inquirer.createPromptModule();
    this.departments = null;
    this.originalProduct = null;
    this.doneEventEmitter = new events.EventEmitter();


    this.enterStore = function () {
        process.stdout.write("\x1B[2J\x1B[0f");
        console.log("\n\t\t**************************************");
        console.log("\t\t\t BAMAZON - MANAGER");
        console.log("\t\t\t\t ENTER");
        console.log("\t\t**************************************\n");

        this.bamazon.getDepartments().then(depts => {
            this.departments = depts;
            this.promptForAction();
        }).catch(e => console.log(e));
    };


    this.viewProductsForSale = function () {
        this.bamazon.getProducts().then((products) => {
            this.departments.forEach(d => {
                console.log(__.centerize(d.department_name.toUpperCase(), "/\\", 56), "\n");
                let filteredProducts = products.filter((p) => {
                    return p.department_name === d.department_name;
                });
                filteredProducts.forEach(p => {
                    console.log(`id: ${__.columnize(p.item_id.toString(), 5, false)} name: ${__.columnize(p.product_name, 30, false)} price: $${__.columnize(p.price.toString(), 20, false)} quantity: ${p.stock_quantity.toString()}`);
                    console.log("-".repeat(100)); // looks like table row lines
                });
            });
            this.promptForAction();
        }).catch(e => console.log(e));
    };


    this.viewLowInventory = function () {
        this.bamazon.getLowInventoryProducts(200).then(products => {
            this.departments.forEach(d => {
                console.log(__.centerize(d.department_name.toUpperCase(), "/\\", 100), "\n");
                let filteredProducts = products.filter((p) => {
                    return p.department_name === d.department_name;
                });
                filteredProducts.forEach(p => {
                    console.log(`id: ${__.columnize(p.item_id.toString(), 5, false)} name: ${__.columnize(p.product_name, 30, false)} price: $${__.columnize(p.price.toString(), 20, false)} quantity: ${p.stock_quantity.toString()}`);
                    console.log("-".repeat(100)); // looks like table row lines
                });
            });
            this.promptForAction();
        });
    };


    this.adjustInventory = function () {
        this.promptForDepartment("quantity");
    };


    this.setPrice = function () {
        this.promptForDepartment("price");
    };


    this.addNewProduct = function () {
        this.promptForDepartment("add");
    };


    ////////////////////////////////   PROMPTS   ////////////////////////////////////////

    this.promptForAction = function () {
        //console.log("\x1Bc");
        console.log("\n");
        this.prompt({
            type: "list",
            name: "action",
            message: "What would you like to do?",
            choices: ["View Products For Sale",
                "View Low Inventory",
                "Adjust Inventory",
                "Set Price",
                "Add New Product",
                "Exit"
            ]
        }).then((res) => {
            switch (res.action) {
                case "View Products For Sale":
                    console.log("\x1Bc");
                    this.viewProductsForSale();
                    break;
                case "View Low Inventory":
                    console.log("\x1Bc");
                    this.viewLowInventory();
                    break;
                case "Adjust Inventory":
                    console.log("\x1Bc");
                    this.adjustInventory();
                    break;
                case "Set Price":
                    console.log("\x1Bc");
                    this.setPrice();
                    break;
                case "Add New Product":
                    console.log("\x1Bc");
                    this.addNewProduct();
                    break;
                case "Exit":
                    console.log("\x1Bc");
                    this.done();
                    break;
                default:
                    console.log("Invalid Action");
                    break;
            }
        }).catch(err => {
            console.log(err);
        });
    };


    this.promptForDepartment = function (aAction) {
        let departmentChoices = this.departments.map((d) => {
            return {
                name: d.department_name
            };
        });
        this.prompt({
            type: "list",
            name: "dept",
            message: "Select A Department",
            choices: departmentChoices
        }).then((res) => {
            switch (aAction) {
                case "add":
                    let newProduct = {
                        item_id: null,
                        product_name: "New Product",
                        department: res.dept,
                        price: 1.01,
                        stock_quantity: 0
                    };
                    this.originalProduct = JSON.parse(JSON.stringify(newProduct));
                    newProduct.department_name = res.dept.trim();
                    this.promptNewProductName(newProduct);
                    break;
                case "quantity":
                case "price":
                    this.promptForProductSelection(res.dept, aAction);
                    break;
                default:
                    break;
            }
        }).catch(err => {
            console.log(err);
        });
    };

    this.promptNewProductName = function (aNewProduct) {
        this.prompt({
            type: "input",
            name: "newName",
            message: "New Item Name?"
        }).then((res) => {
            aNewProduct.product_name = res.newName;
            this.promptForPrice(aNewProduct);
        }).catch(err => console.log(err));
    };

    this.promptForProductSelection = function (aDepartment, aAction) {
        this.bamazon.getProductsByDepartment(aDepartment).then((products) => {
            let prodChoices = products.prods.map(function (p) {
                return {
                    name: p.product_name + ":\t\t$" + p.price,
                    value: p
                };
            });
            this.prompt({
                type: "list",
                name: "prodId",
                message: "Select A Product?",
                choices: prodChoices
            }).then((res) => {
                let selectedProduct = JSON.parse(JSON.stringify(res.prodId));
                this.originalProduct = JSON.parse(JSON.stringify(selectedProduct));
                switch (aAction) {
                    case "price":
                        this.promptForPrice(selectedProduct);
                        break;
                    case "quantity":
                        this.promptForQuantity(selectedProduct);
                        break;
                    default:
                        console.log(`Cannot perform the action: ${aAction}`);
                        break;
                }
            }).catch((err) => {
                console.log(err);
            });
        });
    };

    this.promptForPrice = function (aProduct) {
        let promptMessage = "Enter a prices for this product";
        this.prompt({
            type: "input",
            name: "price",
            message: promptMessage
        }).then((res) => {
            aProduct.price = res.price;
            if (aProduct.item_id === null) {
                this.promptForQuantity(aProduct);
            } else {
                this.promptConfirmOrder(aProduct);
            }
        }).catch(err => console.log(err));
    };


    this.promptForQuantity = function (aProduct) {
        let promptMessage = aProduct.item_id === null ? "Initial Inventory Quantity ?" : "Change amount (negative | positive acceptable) ?";
        this.prompt({
            type: "input",
            name: "qty",
            message: promptMessage
        }).then((res) => {
            if (aProduct.item_id === null) {
                aProduct.stock_quantity = Math.abs(parseInt(res.qty));
            } else {
                aProduct.stock_quantity = parseInt(aProduct.stock_quantity) + parseInt(res.qty);
            }
            this.promptConfirmOrder(aProduct);
        }).catch(err => console.log(err));
    };

    this.promptConfirmOrder = function (aProduct) {
        console.log(`OLD --> ProductId: ${this.originalProduct.item_id}, Name: ${this.originalProduct.product_name}, Department: ${this.originalProduct.department_name}, Price: $${this.originalProduct.price} , Qty: ${this.originalProduct.stock_quantity}`);
        console.log(`NEW --> ProductId: ${aProduct.item_id}, Name: ${aProduct.product_name}, Department: ${aProduct.department_name},  Price: $${aProduct.price} , Qty: ${aProduct.stock_quantity}`);
        this.prompt({
            type: "confirm",
            name: "accept",
            message: "Process Your Order?"
        }).then((res) => {
            if (res.accept) {
                if (aProduct.item_id === null) {
                    this.bamazon.addNewProduct(aProduct).then(res => {
                        console.log(res);
                        this.promptForAction();
                    }).catch(e => console.log(e));
                } else {
                    this.bamazon.modifyProduct(aProduct).then(res => {
                        console.log(res);
                        this.promptForAction();
                    }).catch(err => console.log(err));
                }
            } else {
                console.log("Purchase Cancelled !");
                this.promptForAction();
            }
        });
        this.originalProduct = null;
    };

    this.done = function () {
        console.log("\n\t\t**************************************");
        console.log("\t\t\t BAMAZON - CUSTOMER");
        console.log("\t\t\t\t EXIT");
        console.log("\t\t**************************************\n");
        this.doneEventEmitter.emit("done");
    };
};

module.exports = BamazonManager;