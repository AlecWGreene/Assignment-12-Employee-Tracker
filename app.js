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
    tableRowBG: [],
    deleteText: ["red"],
    warningText: ["yellow", "bold"]
});
const employeeColumns = ["manager_id", "head_id"];
let databaseIssues = [];


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

    // Promisfy connection.query
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
            choices: ["View Information", "Update Information", "Validate Database", "Exit"],
        });

        // Handle user choice
        switch(t_selection){
            case "View Information":
                await viewInformationMenu();
                break;
            case "Update Information":
                await updateMenu();
                break;
            case "Validate Database":
                console.log(await updateDatabaseIssues());
                await prompt({
                    type: "confirm",
                    name: "choice",
                    message: "Press any key to continue...",
                    prefix: ""
                });
                mainMenu();
                return;
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

                // Group criteria
                if(t_breadcrumbs[1]["Groups"] && t_breadcrumbs[1]["Groups"].length > 0){
                    t_query += " GROUP BY "     
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
            if(process.env.DEBUG){ /** @todo Interrogate max on how to do this */
                console.table(t_info);
                console.table(t_breadcrumbs);
            }
            t_message = await displayTable(t_info, t_breadcrumbs[0]);
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
            
            // List of choices for the user
            let t_choices = ["Filter Rows",  "Search Rows", "Sort Columns", "Select Visible Columns", "Select a Different Table"];

            // Get user input on method
            console.log(t_message);
            let t_view = await prompt({
                type: "list",
                name: "method",
                message: "How would you like to alter this view?",
                choices: t_choices,
                prefix: ""
            });

            // Handle user selection
            switch(t_view.method){
                case "Filter Rows":
                    if(!t_breadcrumbs[1].filters){ t_breadcrumbs[1].filters = []; }
                    t_breadcrumbs[1].filters.push(await filterMenu(t_breadcrumbs[0]));
                    if(t_breadcrumbs[1].filters.find( (arg_value) => arg_value.column == "Revert")){
                        t_breadcrumbs[1].filters = [];
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
        when: function(arg_answers){
            return arg_answers.column === "Revert" ? false : true;
        }
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
    let t_data = await updateDataIds(arg_data, t_refs);    

    // Return log the data
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

// ==============================================================================
// UPDATE INFORMATION METHODS
// ==============================================================================
async function updateMenu(){

    // Initialize helper variables
    let t_running = true;

    // While user is updating information
    while(t_running){
        console.clear();

        // Get user input on category selection
        let t_input = await prompt({
            type: "list",
            name: "choice",
            message: "Which category would you like to update?",
            choices: ["Departments", "Employees", "Roles", "Return to Main Menu"],
            prefix: ""
        });

        // Handle user selection
        switch(t_input.choice){
            case "Departments":
                await updateTableMenu("department");
                break;
            case "Employees":
                await updateTableMenu("employee");
                break;
            case "Roles":
                await updateTableMenu("role");
                break;
            case "Return to Main Menu":
                t_running = false;
                break;
        }
    }
}



// CATEGORY NAVIGATION
// ----------------------------------------------------------------------------

async function updateTableMenu(arg_table){
    console.clear();

    let t_running = true;

    while(t_running){

        // Display current departments
        let t_data = await queryDB(`SELECT * FROM ${arg_table}_table`);
        let t_message = await displayTable(t_data, `${arg_table}_table`);

        // Get user input on category selection
        let t_input = await prompt({
            type: "list",
            name: "choice",
            message: t_message + "How would you like to modify this data?",
            choices: ["Create New Entry", "Update Existing Entry", "Delete Existing Entry", "Select a Different Category"],
            prefix: ""
        });

        // Handle user selection
        switch(t_input.choice){
            case "Create New Entry":
                await addObject(arg_table);
                break;
            case "Update Existing Entry":
                await updateObject(arg_table);
                break;
            case "Delete Existing Entry":
                await deleteObject(arg_table);
                break;
            case "Select a Different Category":
                t_running = false;
                break;
        }
    }
}



// OBJECT MUTATION 
// ----------------------------------------------------------------------------
/** Templates to use for dynamic prompt generation */
const objectQuestions = {
    // Prompts for creation methods
    add: {
        department: [{type: "input", name: "name", message: "Give the department a name: ", prefix: ""},
                     {type: "number", name: "budget", message: "Assign a budget to the new department: ", prefix: ""},
                     {type: "list", name: "head_id", message: "Assign a department head: ", prefix: "", choices: ["PLACEHOLDER"], filter: function(arg_input){ return arg_input.match(/\d+(?=\s--)/g); }},
                     {type: "list", name: "new members", message: "Select unassigned employees to add to the department: ", prefix: "", choices: function(arg_hash){
                        return new Promise((arg_resolve) => {
                            queryDB("SELECT id, first_name, last_name FROM employee_table WHERE department_id = 0 OR department_id = NULL").then((arg_response) => {
                                arg_resolve(arg_response.map(arg_value => arg_value.id + " -- " + arg_value.first_name + " " + arg_value.last_name));
                            }
                        );});
                     }
                    , filter: function(arg_input){
                        return arg_input.match(/\d+(?=\s--)/g);
                     }, when: function(arg_input){
                        return new Promise((arg_resolve) => {
                            queryDB("SELECT id, first_name, last_name FROM employee_table WHERE department_id = 0 OR department_id = NULL").then((arg_response) => {
                                if(arg_response.length > 0){
                                    arg_resolve(true);
                                }
                                else{
                                    arg_resolve(false);
                                }
                            });
                        });
                     }}],
        employee: [{type: "input", name: "name", message: "Enter the employee's name: ", prefix: ""},
                   {type: "list", name: "department_id", message: "Which department does this employee work in?", prefix: "", choices: ["PLACEHOLDER"]},
                   {type: "list", name: "role_id", message: "What role does the employee perform?", prefix: "", choices: ["PLACEHOLDER"]},
                   {type: "list", name: "manager_id", message: "Who is the employee's manager?", prefix: "", choices: ["PLACEHOLDER"], filter: function(arg_input){ return arg_input.match(/\d+(?=\s--)/g); }}],
        role: [{type: "input", name: "title", message: "Enter the role's title: ", prefix: ""},
               {type: "number", name: "salary", message: "Assign a salary to the role: ", prefix: ""}]
    },

    // Prompts to select an item and feature for update
    update: { 
        department: [{type: "list", name: "id", message: "Which department would you like to update?", prefix: "", filter: function(arg_input){ // Question -- select a department to update
                            return arg_input.match(/\d+(?=\s--)/g);
                        }, choices: function(){ // Question -- which department to update?
                            return new Promise( (arg_resolve, arg_reject) => {
                                queryDB("SELECT id, name FROM department_table;").then(arg_response => {
                                    arg_resolve(arg_response.map(arg_value => arg_value.id +" -- "+arg_value.name));
                                });
                            });
                        }, filter: function(arg_input){ return arg_input.match(/\d+(?=\s--)/g); }},
                     {type: "checkbox", name:"features", message: "Which features would you like to update?", prefix: "", filter: function(arg_input){ // Question -- select features to update
                            return arg_input.map(arg_value => { 
                                switch(arg_value){
                                    case "Name":
                                        return "name";
                                    case "Budget":
                                        return "budget";
                                    case "Department Head":
                                        return "head_id";
                                }
                            });
                        }, choices: ["Name", "Budget", "Department Head"]},
                     {type: "input", name: "name", message: "Update the department name: ", prefix: "", filter: function(arg_input){ // Question -- enter new department name
                        return arg_input.toLowerCase().replace(/\b\w/g, arg_char => arg_char.toUpperCase());
                     }, when: function(arg_input){
                         if(arg_input.features.includes("name")){
                            return true;
                         }

                         return false;
                     }},
                     {type: "number", name: "budget", message: "Assign a new budget to the department: ", prefix: "", validate: function(arg_input){ // Question -- give department a budget
                         if(arg_input === 0){
                            return "Cannot designate a department's budget as zero";
                         }
                         else if(arg_input < 0){
                            return "Budget cannot be a negative number";
                         }
                         else{
                            return true;
                         }
                     }, when: function(arg_input){
                        if(arg_input.features.includes("budget")){
                           return true;
                        }

                        return false;
                    }},
                     {type: "list", name: "head_id", message: "Select a new head of the department:", prefix: "", choices: function(arg_hash){ // Question -- Select new head of the department
                         return new Promise((arg_resolve, arg_reject) => {
                             queryDB(`SELECT id, first_name, last_name FROM employee_table WHERE department_id = ${arg_hash.id};`).then( arg_response => {
                                if(arg_response.length === 0){
                                    queryDB("SELECT id, first_name, last_name FROM employee_table;").then(arg_response2 => arg_resolve(arg_response2.map(arg_value => arg_value.id + " -- " + arg_value.first_name + " " + arg_value.last_name)));
                                }
                                else{
                                    // Else return the list of employees from the department
                                    arg_resolve(arg_response.map(arg_value => arg_value.id + " -- " + arg_value.first_name + " " + arg_value.last_name));
                                }
                             }); 
                         }); 
                     }, filter: function(arg_input){
                        return arg_input.match(/\d+(?=\s--)/g);
                     }, when: function(arg_input){
                        if(arg_input.features.includes("head_id")){
                           return true;
                        }

                        return false;
                    }}],
        employee: [{type: "list", name: "id", message: "Which employee would you like to update?", prefix: "", choices: function(){ // Question -- select an employee
                            return new Promise( arg_resolve => {
                                queryDB("SELECT id, first_name, last_name FROM employee_table").then(arg_response => {
                                    arg_resolve(arg_response.map(arg_value => arg_value.id + " -- " + arg_value.first_name +" "+arg_value.last_name));
                                });
                            });
                        }, filter: function(arg_input){ return arg_input.match(/\d+(?=\s--)/g); }},
                   {type: "checkbox", name: "features", message: "Which features would you like to update?", prefix: "", choices: ["Name", "Department", "Role", "Manager"], filter: function(arg_input){ // Question -- select featrues to update
                            return arg_input.map(arg_value => {  
                                switch(arg_value){
                                    case "Name":
                                        return "name";
                                    case "Department":
                                        return "department_id";
                                    case "Role":
                                        return "role_id";
                                    case "Manager":
                                        return "manager_id";
                                }
                            });
                        }},
                   {type: "input", name: "name", message: "Update the employee's name using the format Firstname Lastname: ", prefix: "", filter: function(arg_input){ // Question -- select a name for the employee
                            return arg_input;
                        }, when: function(arg_hash){
                            if(arg_hash.features.includes("name")){
                                return true;
                            }
                            else{
                                return false;
                            }
                        }},
                   {type: "list", name: "department_id", message: "Select a department to assign the employee to: ", prefix: "", filter: function(arg_input){ // Question -- select a department_id
                            return arg_input.match(/\d+(?=\s--)/g);
                        }, choices: function(arg_hash){
                            return new Promise( arg_resolve => {
                                queryDB("SELECT id, name FROM department_table WHERE NOT id = (SELECT department_id FROM employee_table WHERE id = " + arg_hash.id + ");").then(arg_response => {
                                    arg_resolve(arg_response.map(arg_value => arg_value.id + " -- " + arg_value.name));
                                });
                            });
                        }, when: function(arg_hash){
                            if(arg_hash.features.includes("department_id")){
                                return true;
                            }
                            else{
                                return false;
                            }
                        }},
                   {type: "list", name: "role_id", message: "", prefix: "", filter: function(arg_input){ // Question -- select a role_id
                            return arg_input.match(/\d+(?=\s--)/g);
                        }, choices: function(arg_hash){
                            return new Promise( arg_resolve => {
                                queryDB("SELECT id, title FROM role_table WHERE NOT id = (SELECT role_id FROM employee_table WHERE id = " + arg_hash.id + ");").then(arg_response => { 
                                    arg_resolve(arg_response.map(arg_value => arg_value.id + " -- " + arg_value.title));
                                });
                            });
                        }, when: function(arg_hash){
                            if(arg_hash.features.includes("role_id")){
                                return true;
                            }
                            else{
                                return false;
                            }
                        }},
                   {type: "list", name: "manager_id", message: "Select a manager for the employee: ", prefix: "", filter: function(arg_input){ // Question -- select a manager_id
                            return arg_input.match(/\d+(?=\s--)/g);
                        }, choices: function(arg_hash){
                            return new Promise( arg_resolve => {
                                // Find the deparment id
                                let t_deparmentId;
                                queryDB(`(SELECT department_id FROM employee_table WHERE id = ${arg_hash.id})`).then( arg_response2 => {
                                    if(arg_hash.features.includes("department_id")){
                                        t_deparmentId = arg_hash.department_id;
                                    }
                                    else{
                                        t_deparmentId = arg_response2;
                                    }

                                    // Get possible managers
                                    queryDB("SELECT id, first_name, last_name FROM employee_table WHERE department_id = " + t_deparmentId + ";").then(arg_response => {
                                        let t_array = arg_response.map(arg_value => arg_value.id + " -- " + arg_value.first_name + " " + arg_value.last_name);
                                        if(t_array == undefined || t_array.length === 0){
                                            t_array = ["No Valid Managers Found"];
                                        }
                                        arg_resolve(t_array);
                                    });
                                });
                            });
                        }, when: function(arg_hash){
                            if(arg_hash.features.includes("manager_id")){
                                return true;
                            }
                            else{
                                return false;
                            }
                        }}],
        role: [{type: "list", name: "id", message: "Which role would you like to update?", prefix: "", choices: function(arg_hash){ // Question -- select role to update
                        return new Promise(arg_resolve => {
                            queryDB("SELECT id, title FROM role_table;").then(arg_response => {
                                arg_resolve(arg_response.map(arg_value => arg_value.id + " -- " + arg_value.title));
                            });
                        });
                    }, filter: function(arg_input){ return arg_input.match(/\d+(?=\s--)/g); }},
                    {type: "checkbox", name: "features", message: "Which features would you like to update?", prefix: "", choices: ["Title", "Salary"], filter: function(arg_input){ // Question -- select features to update
                        return arg_input.map(arg_value => {  
                            switch(arg_value){
                                case "Title":
                                    return "title";
                                case "Salary":
                                    return "salary";
                            }
                        });
                    }},
               {type: "input", name: "title", message: "Update the role's designation: ", prefix: "", filter: function(arg_input){ // Question -- update role's title
                        return arg_input;
                    }, when: function(arg_hash){
                        if(arg_hash.features.includes("title")){
                            return true;
                        }
                        else{
                            return false;
                        }
                    }},
               {type: "number", name: "salary", message: "Assign a salary to the position", prefix: "", filter: function(arg_input){ // Question -- update role's salary
                        return arg_input;
                    }, when: function(arg_hash){
                        if(arg_hash.features.includes("salary")){
                            return true;
                        }
                        else{
                            return false;
                        }
                    }}]
     },
    
    // Promptes to select an item for deletion
    delete: {
        department: [{type: "list", name: "id", message: "Which department would you like to update?", prefix: "", filter: function(arg_input){ // Question -- select a department to delete
                            return arg_input.match(/\d+(?=\s--)/g);
                        }, choices: function(){ 
                            return new Promise( (arg_resolve, arg_reject) => {
                                queryDB("SELECT id, name FROM department_table;").then(arg_response => {
                                    arg_resolve(arg_response.map(arg_value => arg_value.id +" -- "+arg_value.name));
                                });
                            });
                        }, filter: function(arg_input){ return arg_input.match(/\d+(?=\s--)/g); }},
                    {type: "confirm", name: "confirmation", prefix: "", message: function(arg_hash){
                            return new Promise(arg_resolve => {
                                queryDB("SELECT * FROM department_table WHERE id = " + arg_hash.id + ";").then(arg_response => {
                                    let t_string = "Name: " + arg_response[0].name.deleteText + "\n Budget: " + arg_response[0].budget.toString().deleteText + "\n Department Head: " + arg_response[0].head_id.toString().deleteText + "\n";
                                    arg_resolve(t_string + "Would you like to delete this department?");
                                });
                            });
                        }
                    }],
        employee: [{type: "list", name: "id", message: "Which employee would you like to delete?", prefix: "", filter: function(arg_input){ // Question -- select a department to delete
                            return arg_input.match(/\d+(?=\s--)/g);
                        }, choices: function(){ 
                            return new Promise( (arg_resolve, arg_reject) => {
                                queryDB("SELECT id, first_name, last_name FROM employee_table;").then(arg_response => {
                                    arg_resolve(arg_response.map(arg_value => arg_value.id +" -- "+arg_value.first_name +" "+arg_value.last_name));
                                });
                            });
                        }, filter: function(arg_input){ return arg_input.match(/\d+(?=\s--)/g); }},
                    {type: "confirm", name: "confirmation", prefix: "", message: function(arg_hash){
                            return new Promise(arg_resolve => {
                                queryDB("SELECT * FROM employee_table WHERE id = " + arg_hash.id + ";").then(arg_response => {
                                    let t_string = "Name: " + arg_response[0].first_name.deleteText + " " + arg_response[0].last_name.deleteText + "\n Department: " + arg_response[0].department_id.toString().deleteText + "\n Role: " + arg_response[0].role_id.toString().deleteText + "\n Manager: " + arg_response[0].manager_id.toString().deleteText + "\n";
                                    arg_resolve(t_string + "Would you like to delete this employee?");
                                });
                            });
                        }
                    }],
        //let t_string = "Name: " + arg_response.first_name + " " + arg_response.last_name + " Department Id: " + arg_response.department_id + " Role Id: " + arg_response.role_id + " Manager Id: " + arg_response.manager_id + "\n";
        role: [{type: "list", name: "id", message: "Which role would you like to delete?", prefix: "", filter: function(arg_input){ // Question -- select a department to delete
                            return arg_input.match(/\d+(?=\s--)/g);
                        }, choices: function(){ 
                            return new Promise( (arg_resolve, arg_reject) => {
                                queryDB("SELECT id, title FROM role_table;").then(arg_response => {
                                    arg_resolve(arg_response.map(arg_value => arg_value.id +" -- "+arg_value.title));
                                });
                            });
                        }, filter: function(arg_input){ return arg_input.match(/\d+(?=\s--)/g); }},
                    {type: "confirm", name: "confirmation", prefix: "", message: function(arg_hash){
                            return new Promise(arg_resolve => {
                                queryDB("SELECT * FROM role_table WHERE id = " + arg_hash.id + ";").then(arg_response => {
                                    let t_string = "Title: " + arg_response[0].title.deleteText + "\n Salary: " + arg_response[0].salary.toString().deleteText  + "\n";
                                    arg_resolve(t_string + "Would you like to delete this role?");
                                });
                            });
                        }
                    }]
    }
}

async function addObject(arg_category){
    let t_questions = objectQuestions.add[arg_category];

    switch(arg_category){
        case "department":
            // Get valid list of candidates for department heads
            let t_query = await queryDB("SELECT id, first_name, last_name FROM employee_table WHERE (id) NOT IN (SELECT head_id FROM department_table);");
            t_questions[2].choices = t_query.map( arg_value => arg_value.id + " -- " + arg_value.first_name + " " + arg_value.last_name );
            t_questions[2].choices.push("Leave Empty");
            break;
        case "employee":
            // Get valid list of departments
            let t_data = await queryDB("SELECT id, name FROM department_table");
            t_questions[1].choices = t_data.map( arg_value => arg_value.name);
            t_questions[1].choices.push("Leave Empty");

            // Get valid list of roles
            t_data = await queryDB("SELECT id, title FROM role_table");
            t_questions[2].choices = t_data.map( arg_value => arg_value.title);
            t_questions[2].choices.push("Leave Empty");

            // Get employees to select as manager
            t_data = await queryDB("SELECT id, first_name, last_name FROM employee_table;");
            t_questions[3].choices = t_data.map( arg_value => arg_value.id + " -- " + arg_value.first_name + " " + arg_value.last_name );
            t_questions[3].choices.push("Leave Empty");
            break;
        case "role":
            break;
    }

    // Get object information
    let t_info = await prompt(t_questions);
    
    // Insert a new row into the relevant table
    let t_query = `INSERT INTO ${arg_category}_table` ;
    let t_columns = "(", t_values = " VALUES (";
    for(let t_key of Object.keys(t_info)){
        t_columns += t_key + ", ";
        t_values += processInputForQuery(t_info[t_key], t_key) + ", ";
    }

    // Format the strings
    t_columns = t_columns.replace(/,\s$/g,""); t_values = t_values.replace(/,\s$/g, "");
    t_columns += ")"; t_values += ");";
    t_query += t_columns + t_values;
    
    // Perform the query
    await queryDB(t_query);
}

async function updateObject(arg_category){
    let t_questions = objectQuestions.update;

    // Retrieve object information through prmopts
    let t_input;
    switch(arg_category){
    case "department":
        t_input = await prompt(t_questions.department);
        break;
    case "employee":
        t_input = await prompt(t_questions.employee);
        break;
    case "role":
        t_input = await prompt(t_questions.role);
        break;
    }

    // Generate update query
    let t_query = "UPDATE " + arg_category + "_table SET ";
    for(let t_feature of t_input.features){
        // Split up employee names into 2 parts
        if(arg_category === "employee" && t_feature === "name"){
            let t_data = t_input[t_feature].split(" ");
            t_query += `first_name = "${t_data[0]}", last_name = "${t_data[1]}", `;
        }
        else{
            t_query += t_feature + " = " + processInputForQuery(t_input[t_feature], t_feature) + ", ";
        }
    }
    t_query += ` WHERE id = ${t_input.id};`;
    t_query = t_query.replace(/\,\s(?=\sWHERE)/g, "");

    await queryDB(t_query);

    if(t_category === "department"){
        await queryDB("CALL update_department_expenses();");
    }
}

async function deleteObject(arg_category){
    let t_questions = objectQuestions.delete;

    // Retrieve object information through prmopts
    let t_input;
    switch(arg_category){
    case "department":
        t_input = await prompt(t_questions.department);
        break;
    case "employee":
        t_input = await prompt(t_questions.employee);
        break;
    case "role":
        t_input = await prompt(t_questions.role);
        break;
    }

    // Generate update query
    let t_query = "DELETE FROM " + arg_category + "_table WHERE id = " + t_input.id + ";";

    await queryDB(t_query);
}

function processInputForQuery(arg_value, arg_field){
    let t_stringFields = ["name", "title", "first_name", "last_name"];
    if(t_stringFields.includes(arg_field)){
        return "\"" + arg_value + "\"";
    }
    return arg_value;
}



// DATABASE ISSUE HANDLING
// -----------------------------------------------------------------------------

/** Rules for updateDatabaseIssues to check against the database */
const databaseRules = [
    // RULE 1 -- Employee's must have managers from the same department
    { returnData: [], requirementData: "Employee", validator: function(arg_employeeData){

        // For each employee
        for(let t_emp of arg_employeeData){

            // If employee's department doesn't match their manager's department
            if(t_emp["department_id"] != t_emp["manager_department_id"] && t_emp != undefined){
                this.returnData.push(t_emp);
            }
        }
    },  message: function(arg_employee){
        let return_string = "WARNING".warningText + ` The following employees have a manager from a different department: `;
        for(let t_emp of this.returnData){
            return_string += `\n${t_emp.id} -- ${t_emp.first_name} ${t_emp.last_name}`;
        }

        return return_string;
    }},
    // RULE 2 -- Department heads must belong to their department
    { returnData: [], requirementData: "Department", validator: function(arg_departmentData){
        // For each employee
        for(let t_dept of arg_departmentData){

            // If employee's department doesn't match their manager's department
            if(t_dept["id"] != t_dept["head_department_id"] && t_dept != undefined){
                this.returnData.push(t_dept);
            }
        }
    },  message: function(){
        let return_string = "WARNING".warningText + ` The following departments have a head from a different department: `;
        
        for(let t_dept of this.returnData){
            return_string += `\n${t_dept.id} -- ${t_dept.name}`;
        }

        return return_string;
    }}
];

/**  */
async function updateDatabaseIssues(){
    // Get database data
    let t_employeeData = await queryDB(`SELECT emp.*, emp2.department_id AS "manager_department_id" FROM employee_table AS emp LEFT JOIN employee_table AS emp2 ON emp.manager_id = emp2.id;`);
    let t_departmentData = await queryDB(`SELECT dept.*, emp.department_id AS "head_department_id" FROM department_table AS dept LEFT JOIN employee_table AS emp ON dept.head_id = emp.id;`);
    
    // Helper variables
    let t_flag = false;
    let return_string = "";

    // For each rule
    for(let i = 0; i < databaseRules.length; i++){
        switch(databaseRules[i].requirementData){
            case "Department":
                databaseRules[i].validator(t_departmentData);
                break;
            case "Role":
                console.log("You should not be here");
                break;
            case "Employee":
                databaseRules[i].validator(t_employeeData);
                break;
        }
        
        // If the database found violations
        if(databaseRules[i].returnData.length > 0){
            t_flag = true;
            return_string += "\n" +  databaseRules[i].message();
        }
    }

    if(t_flag){
        return return_string;
    }
    else{
        return "No database inconsistencies found."
    }
}

