async function getTableData(arg_connection, arg_table, arg_callback, arg_columns, arg_condition){
    // If table is invalid
    if(!["department_table", "role_table", "employee_table"].includes(arg_table)){
        throw new Error("getTableData was passed an invalid table name: " + arg_table);
    }
    else if(typeof arg_condition != "String" && typeof arg_condition != typeof undefined){
        throw new Error("getTableData argument condition must be a string, not: " + typeof arg_condition);
    }

    // Generate query
    let t_fields;
    if(arg_columns){
        t_fields = (arg_columns.length > 1) ? "(" + arg_columns.join(", ") + ")" : "(" + arg_columns + ")";
    }
    let t_string = `SELECT ${(typeof arg_columns === typeof undefined || arg_columns.length === 0) ? "*" : t_fields} FROM ${arg_table} ${arg_condition ? "WHERE " + arg_condition : " "};`; 
    
    // Connect to database
    await arg_connection.query(t_string, arg_callback);

}

module.exports = getTableData;