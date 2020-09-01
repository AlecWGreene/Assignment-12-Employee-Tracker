// Dependencies
const mysql = require("mysql");
const fs = require("fs");
const inquirer = require("inquirer");
const path = require("path");
const colors = require("colors");
const util = require("util");

// Load lib scripts
const tableRenderer = require("./lib/tableRenderer");

// Custom colors theme
colors.setTheme({
    tableHeaders: ["brightBlue", "bold"],
    tableId: ["brightWhite", "bold"],
    tableMoney: ["green"],
    tableNames: ["brightCyan", "bold"],
    tableRowBG: []
});
const employeeColumns = ["manager_id"];


/** Encapsulates inquirer prompt */
const prompt = inquirer.createPromptModule(); 

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

// Promisified version of connection.query
let queryDB;

// Connect to database
connection.connect(() => {
    console.log("Connected to " + connection.threadId);

    // Promisfy 
    queryDB = util.promisify(connection.query).bind(connection);

    // Call main method
    app();
});



// ==============================================================================
// RUNTIME METHODs
// ==============================================================================
function app(){
    mainMenu();
}

async function mainMenu(){
    let t_running = true;
    console.clear();

    while(t_running){
        // Get user selection
        let {selection: t_selection} = await prompt({
            type: "list",
            name: "selection",
            message: "What would you like to do?",
            prefix: "",
            choices: ["View Information", "Update Information", "Setup Database", "Exit"],
        });

        // Handle user choice
        switch(t_selection){
            case "View Information":
                await viewInformationMenu();
                break;
            case "Update Information":
                await updateMenu();
                break;
            case "Setup Database":
                break;
            case "Exit":
                t_running = false;
                break;
        }
    }

    connection.end();
}



// ==============================================================================
// VIEW INFORMATION METHODS
// ==============================================================================
async function viewInformationMenu(){
    console.clear();

    // Helper variables
    let t_running = true;
    let t_message = "";

    // Get initial user selection for table to view
    let t_selection = await prompt({
        type: "list",
        name: "table",
        message: "What information would you like to view?",
        choices: ["Departments", "Employees", "Roles", "Return to Main Menu"],
        prefix: "",
        filter: function(arg_input){
            switch(arg_input){
                case "Departments":
                    return "department_table";
                case "Employees":
                    return "employee_table";
                case "Roles":
                    return "role_table";
                case "Return to Main Menu":
                    t_running = false;
                    break;
            }
        }
    });

    // Setup the query breadcrumbs
    let t_breadcrumbs = [t_selection.table];

    // Loop until user exits
    while(t_running){
        let t_info;
        let t_message;

        // If the user wants to view data, display it
        if(t_running && t_breadcrumbs.length > 0){
            let t_query = "SELECT ";

            // Add parameters to query
            if(t_breadcrumbs.length === 2){

                // Columns parameter
                t_query += (t_breadcrumbs[1]["columns"] && t_breadcrumbs[1]["columns"].length > 0) ? t_breadcrumbs[1].columns : "*";

                // Table parameter
                t_query += " FROM " + t_breadcrumbs[0];

                // Filter criteria
                if(t_breadcrumbs[1]["filters"] && t_breadcrumbs[1]["filters"].length > 0 ){
                    t_query += " WHERE ";
                    for(let i = 0; i < t_breadcrumbs[1]["filters"].length; i++){
                        t_query += `${t_breadcrumbs[1].filters[i].column} ${t_breadcrumbs[1].filters[i].operation} "${t_breadcrumbs[1].filters[i].value}" `;
                        if(i != t_breadcrumbs[1]["filters"].length - 1){ t_query += " AND "; }
                    }
                }

                // Sort critera
                if(t_breadcrumbs[1]["sort"] && t_breadcrumbs[1]["sort"] != {}){
                    t_query += ` ORDER BY ${t_breadcrumbs[1]["sort"].column} ${t_breadcrumbs[1]["sort"].direction}`;
                }
            }
            else{
                t_query += " * FROM " + t_breadcrumbs[0];
            }

            // Query database
            t_query += ";";
            t_info = await queryDB(t_query);
            
            // Clear console and display information
            console.clear();
            t_message = await displayTable(t_info, t_breadcrumbs);
        }

        // If the user is deciding what table to view
        if(t_breadcrumbs.length === 0){

            // Get user selection for a table
            let t_selection = await prompt({
                type: "list",
                name: "table",
                message: "What information would you like to view?",
                choices: ["Departments", "Employees", "Roles", "Return to Main Menu"],
                prefix: "",
                filter: function(arg_input){
                    switch(arg_input){
                        case "Departments":
                            return "department_table";
                        case "Employees":
                            return "employee_table";
                        case "Roles":
                            return "role_table";
                        case "Return to Main Menu":
                            t_running = false;
                            break;
                    }
                }
            });

            // Add breadcrumb for table
            t_breadcrumbs.push(t_selection.table);
        }
        // If the user is deciding how to view the data
        else if(t_breadcrumbs.length > 0){
            if(t_breadcrumbs.length === 1){
                t_breadcrumbs[1] = {}
            }
            
            // Get user input on method
            let t_view = await prompt({
                type: "list",
                name: "method",
                message: t_message + "How would you like to alter this view?",
                choices: ["Filter Rows", "Sort Columns", "Search Rows", "Select Visible Columns", "Select a Different Table"],
                prefix: ""
            });

            // Handle user selection
            switch(t_view.method){
                case "Filter Rows":
                    if(!t_breadcrumbs[1].filters){ t_breadcrumbs[1].filters = []; }
                    t_breadcrumbs[1].filters.push(await filterMenu(t_breadcrumbs[0]));
                    if(t_breadcrumbs[1].filters.find( (arg_value) => arg_value.column == "Revert")){
                        t_breadcrumbs[1].filters = []
                    }
                    break;
                case "Sort Columns":
                    t_breadcrumbs[1].sort = await sortMenu(t_breadcrumbs[0]);
                    break;
                case "Search Rows":
                    // Get search criteria
                    let t_search = await searchMenu(t_breadcrumbs[0]);

                    // If a search exists modify it
                    if(t_breadcrumbs[1].filters && t_breadcrumbs[1].filters.find((arg_value) => arg_value.operation === "REGEXP")){
                        t_breadcrumbs[1].filters = t_breadcrumbs[1].filters.map((arg_value) => {
                            // Only affect the search filter
                            if(arg_value.operation === "REGEXP"){
                                return t_search;
                            }
                        });
                    }
                    else{
                        t_breadcrumbs[1].filters = [t_search];
                    }
                    break;
                case "Select Visible Columns":
                    let t_columns = await columnsMenu(t_breadcrumbs[0]);
                    t_breadcrumbs[1].columns = t_columns.join(", ");
                    break; 
                case "Remove a Criteria":
                    break;
                case "Select a Different Table":
                    t_breadcrumbs = [];
                    break;
            }
        }
    }
}

async function filterMenu(arg_table){
    // Get table fields
    let t_response = await queryDB("SHOW COLUMNS FROM ??;", [arg_table]);
    let t_tableColumns = t_response.map((arg_value) => arg_value.Field);
    t_tableColumns.push(new inquirer.Separator(), "Revert");

    // Get user selection for columm, operation, and value
    return await prompt([{
        type: "list",
        name: "column",
        message: "What column would you like to filter by?",
        choices: t_tableColumns,
        prefix: "",
        loop: false
    },{
        type: "list",
        name: "operation",
        message: "How would you like to filter the data?",
        choices: ["=", ">=", "<=", ">", "<"],
        prefix: "",
    },{
        type: "input",
        name: "value",
        message: "What value would you like to filter off of?",
        prefix: "",
        validate: async function(arg_input, arg_answers){
            let t_column = await queryDB(`select column_name,data_type from information_schema.columns where table_schema = 'employee_tracker_db' and table_name = '${arg_table}' and column_name = '${arg_answers.column}';`);
            
            // Get the type of the column
            let t_regex;
            if(t_column[0].DATA_TYPE.match(/varchar|blob|text/i)){
                t_regex = /[a-z\s]+/gi;
            }
            else if(t_column[0].DATA_TYPE.match(/int|integer|decimal|money/i)){
                t_regex = /[0-9]+/gi;
            }

            if(arg_input.match(t_regex) != null && arg_input === arg_input.match(t_regex)[0]){
                return true;
            }
            else{
                return "Data type must be " + t_column[0].DATA_TYPE + ", not " + arg_input;
            }
        },
        when: function(arg_answers){
            return arg_answers.column === "Revert" ? false : true;
        }
    }]);
}

async function searchMenu(arg_table){
    // Get table fields
    let t_response = await queryDB("SHOW COLUMNS FROM ??;", [arg_table]);
    let t_tableColumns = t_response.map((arg_value) => arg_value.Field);

    // Get user input
    let return_keyword = await prompt([{
        type: "list",
        name: "column",
        message: "",
        choices: t_tableColumns,
        prefix: ""
    },{
        type: "confirm",
        name: "exact",
        message: "Would you like the search to match the whole entry?",
        prefix: ""
    },{
        type: "input",
        name: "value",
        message: "Enter a keyword to search",
        prefix: "",
        validate: function(arg_input){
            if(arg_input.match(/[a-z\s]/i)){
                return true;
            }
            else{
                return "Entry must be a string";
            }
        }
    }]);

    return_keyword["operation"] = "REGEXP";
    if(return_keyword.exact){ return_keyword.value = "^" + return_keyword.value.trim() + "$"; }

    return return_keyword;
}

async function sortMenu(arg_table){
    // Get table fields
    let t_response = await queryDB("SHOW COLUMNS FROM ??;", [arg_table]);
    let t_tableColumns = t_response.map((arg_value) => arg_value.Field);

    // Get user input
    let return_sort = await prompt([{
        type: "list",
        name: "column",
        message: "Which column would you like to sort by?",
        choices: t_tableColumns,
        prefix: ""
    }, {
        type: "list",
        name: "direction",
        message: "Which direction do you want to sort the data by?",
        choices: ["Ascending", "Descending"],
        prefix: "",
        filter: function(arg_input){
            return arg_input === "Ascending" ? "ASC" : "DESC";
        }
    }]);

    return return_sort;
}

async function columnsMenu(arg_table){
    // Get table fields
    let t_response = await queryDB("SHOW COLUMNS FROM ??;", [arg_table]);
    let t_tableColumns = t_response.map((arg_value) => arg_value.Field);

    // Get user input on columns
    let {checks: return_columns} = await prompt({
        type: "checkbox",
        name: "checks",
        message: "Which columns would you like to view",
        choices: t_tableColumns,
        prefix: ""
    });

    return return_columns;
}




// ==============================================================================
// DISPLAY METHODS
// ==============================================================================

/** @todo Implement */
async function displayTable(arg_data, arg_tableName){
    // Query to return all foreign keys in the table
    let t_query = `SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS 
    WHERE information_schema.TABLE_CONSTRAINTS.CONSTRAINT_TYPE = "FOREIGN KEY"
    AND information_schema.TABLE_CONSTRAINTS.TABLE_NAME = "${arg_tableName}"`;

    // Store all relevant references in a helper variable
    let t_refs = await queryDB(t_query);
    t_refs = t_refs.map(arg_value => arg_value["CONSTRAINT_NAME"].match(/\w+(?=_label)/g)[0]);

    // Filter out any references that aren't used by the data and add employee references if applicable
    let t_columns = Object.keys(arg_data[0]);
    t_refs = t_refs.filter( arg_value => t_columns.includes(arg_value + "_id"));

    // Add any columns that reference employee
    let t_employeeRefs = t_columns.filter(arg_value => employeeColumns.includes(arg_value));
    if(t_employeeRefs.length > 0){ 
        t_refs = t_refs.concat(t_employeeRefs.map(arg_value => arg_value.replace(/_id/g, ""))); 
    }

    // Replace references in data
    //let t_data = arg_data;
    let t_data = await updateDataIds(arg_data, t_refs);    

    // Console log the data
    return tableRenderer(t_data);
}

/** Replace id references in the data and supplied fields with their database values */
async function updateDataIds(arg_data, arg_refs){
    // Init helper variables
    let return_data = Array.from(arg_data);
    /** Stores query data from each relevant table */
    let t_tablesData = {}
    /** Stores which fields refer to which table data */
    let t_fieldKeyRef = {}

    // For each field 
    for(let t_field of arg_refs){
        
        // Get name of the appropriate table
        let t_name;
        switch(t_field){
            case "department":
                t_name = "department_table";
                break;
            case "role":
                t_name = "role_table";
                break;
            default:
                if(employeeColumns.includes(t_field + "_id")){
                    t_name = "employee_table";
                }
                break;
        }

        // Store refs
        if(!Object.keys(t_tablesData).includes(t_name)){
            t_tablesData[t_name] = await queryDB(`SELECT * FROM ${t_name};`);
        }
        t_fieldKeyRef[t_field] = t_name;

    }

    // For each row
    for(let i = 0; i < arg_data.length; i++){
        // For each cell to replace
        for(let t_key of arg_refs){

            let t_info, t_data;
            switch(t_key){
            case "department":
                // Use t_key and t_fieldKeyRef to find the correct table, then the value of the cell to get the correct value from the foreign table
                t_data = t_tablesData[t_fieldKeyRef[t_key]].find(arg_value => arg_value.id === arg_data[i][t_key+"_id"]);
                t_info = t_data.name;
                break;
            case "role":
                // Use t_key and t_fieldKeyRef to find the correct table, then the value of the cell to get the correct value from the foreign table
                t_data = t_tablesData[t_fieldKeyRef[t_key]].find(arg_value => arg_value.id === arg_data[i][t_key+"_id"]);
                t_info = t_data.title;
                break;
            default:
                if(employeeColumns.includes(t_key + "_id")){
                    // Use t_key and t_fieldKeyRef to find the correct table, then the value of the cell to get the correct value from the foreign table
                    t_data = t_tablesData["employee_table"].find(arg_value => arg_value.id === arg_data[i][t_key+"_id"]);
                    
                    // If data is returned
                    if(t_data){
                        t_info = t_data["first_name"] + " " + t_data["last_name"];
                    }
                    else{
                        t_info = "";
                    }
                }
                break;
            }

            // Update the cell with the retrieved info
            return_data[i][t_key + "_id"] = t_info;
        }
    }

    return return_data;
}

/** @todo Implement and utilize */
function displaySearchQuery(arg_query){
    return JSON.stringify(arg_query);
}



// ==============================================================================
// UPDATE INFORMATION METHODS
// ==============================================================================
async function updateMenu(){

    // Get user input
    let t_input = await prompt({
        type: "list",
        name: "choice",
        message: "Which category would you like to update?",
        choices: ["Departments", "Employees", "Roles", "Return to Main Menu"],
        prefix: ""
    });

    // Initialize helper variables
    let t_running = true;

    // Handle user selection
    switch(t_input.choice){
        case "Deparments":
        case "Employees":
        case "Roles":
        case "Return to Main Menu":
            t_running = false;
            break;
    }

    // While user is updating information
    while(t_running){

    }
}


// CATEGORY NAVIGATION
// ----------------------------------------------------------------------------

async function actionMenu(){

}

async function departmentMenu(){

}

async function employeeMenu(){

}

async function roleMenu(){

}

// OBJECT MUTATION 
// ----------------------------------------------------------------------------

async function addObject(arg_category){

}

async function updateObject(arg_category){

}

async function deleteObject(arg_category){

}
