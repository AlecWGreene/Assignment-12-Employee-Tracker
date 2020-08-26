// Dependencies
const mysql = require("mysql");
const fs = require("fs");
const inquirer = require("inquirer");
const path = require("path");

// Load lib scripts
const getTableData = require("./lib/SQL-Generator/getTableData");
const postTableData = require("./lib/SQL-Generator/postTableData");
const tableRenderer = require("./lib/SQL-Generator/tableRenderer");

/** Encapsulates inquirer prompt */
const prompt = inquirer.createPromptModule(); 

/** Main Menu question */
const mainMenuQuestion = {
    type: "list",
    name: "selection",
    message: "What would you like to do?",
    choices: ["View Information", "Update Information", "Load Example Information", "Exit"],
}

/** View Information menu question */
const viewMenuQuestion = {
    type: "list",
    name: "selection",
    message: "Which data would you like to view?",
    choices: ["Departments", "Salaried Positions", "Employees", "Return to Main Menu"],
    filter: function(arg_input){
        switch(arg_input){
            case "Departments":
                return "department_table";
            case "Salaried Positions":
                return "role_table";
            case "Employees":
                return "employee_table";
            case "Return to Main Menu":
                return "main_menu";
        }
    }
}

// Get password
const pw = fs.readFileSync("password.txt", "utf-8");

// Create connection
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: pw,
    database: "employee_tracker_db"
});

// Connect to database
connection.connect(() => {
    console.log("Connected to " + connection.threadId);

    // Call main method
    app();
});


async function app(){
    // Get user input
    let t_input = await prompt(mainMenuQuestion);

    switch(t_input.selection){
        case "View Information":
            await viewInformationMenu();
            break;
        case "Update Information":
            break;
    }
}

async function viewInformationMenu(){
    /** Default input to start loop */
    let t_input = { selection: " " };

    while(t_input.selection != "main_menu"){
        // Get user selection for table to display
        await prompt(viewMenuQuestion);

        // Display the information
        await getTableData(connection, "employee_table", displayInfo);
    }
}

function displayInfo(arg_error, arg_response, arg_fields){
    if(arg_error){ console.log(arg_error); }
    
    tableRenderer(arg_response, arg_fields);
}