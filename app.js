const BamazonCustomer = require("./bamazonCustomer");
const BamazonManager = require("./bamazonManager");
const inquirer = require("inquirer");
const events = require("events");

let prompt = inquirer.createPromptModule();
let customerView = new BamazonCustomer();
let managerView = new BamazonManager();



function begin() {
    process.stdout.write("\x1B[2J\x1B[0f");
    console.log("\n\t\t**************************************");
    console.log("\t\t\t Welcome To Bamazon");
    console.log("\t\t\t\t MAIN");
    console.log("\t\t**************************************\n");

    prompt({
        type: "list",
        name: "userType",
        message: "I am a ... ",
        choices: ["Customer", "Manager", "Exit"]
    }).then((res) => {
        switch (res.userType) {
            case "Customer":
                customerView.enterStore();
                break;
            case "Manager":
                managerView.enterStore(function (res) {
                    begin();
                });
                break;
            case "Exit":
                done();
                break;
            default:
                console.log("This is not a valid user");
                done();
                break;
        }
    }).catch(e => console.log(e));
}

managerView.doneEventEmitter.on("done", function (res) {
    begin();
});

customerView.doneEventEmitter.on("done", function(res) {
    begin();
});

function done() {
    console.log("\n\t\t**************************************");
    console.log("\t\t\t\t GOODBYE");
    console.log("\t\t**************************************\n");
    process.exit(47);
}

begin();