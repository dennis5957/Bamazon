const BamazonDb = require("./BamazonDb");
const inquirer = require("inquirer");
const events = require("events");

let BamazonCustomer = function () {
    this.bamazon = new BamazonDb();
    this.prompt = inquirer.createPromptModule();
    this.departments = null;
    this.selectedProduct = null;
    this.doneEventEmitter = new events.EventEmitter();

    this.enterStore = function () {
        console.log("\x1Bc"); // Clear console
        console.log("\n\t\t**************************************");
        console.log("\t\t\t BAMAZON - CUSTOMER");
        console.log("\t\t\t\t ENTER");
        console.log("\t\t**************************************\n");

        this.bamazon.getDepartments().then(depts => {

            departments = depts.map(function (item) {
                return {
                    name: item.department_name,
                    value: item.department_name
                };
            });

            departments.push({
                name: "Exit",
                value: "Exit"
            });

            this.promptForDepartment();
        });
    };


    this.promptForDepartment = function () {
        this.prompt({
            type: "list",
            name: "dept",
            message: "Which department are you interested in?",
            choices: departments
        }).then((res) => {
            if (res.dept === "Exit") {
                this.done();
            } else {
                this.promptForProduct(res.dept);
            }
        }).catch(err => {
            console.log(err);
        });
    };



    this.promptForProduct = function (aDepartment) {
        this.bamazon.getProductsByDepartment(aDepartment).then((products) => {
            let prodChoices = products.prods.map(function (p) {
                return {
                    name: p.product_name + ":\t\t$" + p.price,
                    value: p.item_id
                };
            });
            this.prompt({
                type: "list",
                name: "prodId",
                message: "Which item would you like to purchase today?",
                choices: prodChoices
            }).then((res) => {
                this.promptForQuantity(res.prodId);
            }).catch((err) => {
                console.log(err);
            });
        });
    };


    this.promptForQuantity = function (aProductId) {
        this.bamazon.getProductById(aProductId).then((prod) => {
            selectedProduct = prod;
            this.prompt({
                type: "input",
                name: "qty",
                message: "How many would you like?"
            }).then((res) => {
                if (res.qty > 0) {
                    this.promptConfirmOrder(selectedProduct, res.qty);
                } else {
                    console.log("You Entered An Invalid Quantity of '" + res.qty + "'");
                    this.promptForQuantity(aProductId);
                    //promptForRestart();
                }
            }).catch((err) => {
                console.log(err);
            });
        }).catch(err => console.log(err));
    };


    this.promptConfirmOrder = function (aProduct, aQuantity) {
        let name = aProduct.product_name;
        let price = aProduct.price;
        let currentQty = aProduct.stock_quantity;
        let requestQty = aQuantity;
        console.log("Your Order -> Qty: " + requestQty + "x " + name + ",  totaling $" + (requestQty * aProduct.price).toFixed(2) + " ?");
        this.prompt({
            type: "confirm",
            name: "accept",
            message: "Process Your Order?"
        }).then((res) => {
            if (res.accept) {
                this.processPurchase(aProduct, aQuantity);
            } else {
                console.log("Purchase Cancelled !");
                this.promptForRestart();
            }
        });
    };


    this.processPurchase = function (aProduct, aQuantity) {
        let name = aProduct.product_name;
        let price = aProduct.price;
        let currentQty = aProduct.stock_quantity;
        let requestQty = aQuantity;
        if (requestQty > currentQty) {
            if (currentQty > 0) {
                console.log("We apologize but we only have " + currentQty + " " + name + "(s)");
                this.prompt({
                    type: "confirm",
                    name: "accept",
                    message: "Would you like to purchase the " + currentQty + " " + name + "(s) we have, totaling $" + (currentQty * aProduct.price).toFixed(2) + " ?"
                }).then((answer) => {
                    if (answer.accept) {
                        this.bamazon.purchaseProduct(aProduct, currentQty).then((res) => {
                            console.log("Purchase Completed !");
                            this.promptForRestart();
                        }).catch(err => console.log(err));
                    } else {
                        console.log("Purchase Cancelled !");
                        this.promptForRestart();
                    }
                }).catch(function (err) {
                    console.log(err);
                });
            } else {
                console.log("We apologize but we are completely out of stock for this item");
                this.promptForRestart();
            }
        } else {
            this.bamazon.purchaseProduct(aProduct, aQuantity).then((res) => {
                console.log("Purchase Completed !");
                this.promptForRestart();
            }).catch(err => console.log(err));
        }
    };


    this.promptForRestart = function () {
        this.prompt({
            type: "confirm",
            name: "accept",
            message: "Would you like to make another purchase?"
        }).then((answer) => {
            if (answer.accept) {
                this.enterStore();
            } else {
                this.done();
            }
        }).catch(err => console.log(err));
    };


    this.done = function () {
        console.log("\n\t\t**************************************");
        console.log("\t\t\t BAMAZON - CUSTOMER");
        console.log("\t\t\t\t EXIT");
        console.log("\t\t**************************************\n");
        this.doneEventEmitter.emit("done");
    };
};

module.exports = BamazonCustomer;