/** Global var to hold the columns returned by the database */
let columnWidths = [];
/** Global var to hold the fields requested to display */
let fields = [];

/** Groups of columns to apply stylings to */
const groupArrays = {
    id: ["id"],
    names: ["name", "first_name", "last_name"],
    money: ["salary"]
}

const boxChars = {
    // Bold box chars
    boldCorner_topLeft: "\u250f",
    boldCorner_topRight: "\u2513",
    boldCorner_botLeft: "\u2517",
    boldCorner_botRight: "\u251b",
    boldVert: "\u2503",
    boldVert_boldLeft: "\u252b",
    boldVert_boldRight: "\u2523",
    boldFlat: "\u2501",
    
    // Joining chars
    boldFlat_thinVert: "\u253f",
    boldFlat_thinVertDown: "\u252f",
    boldFlat_thinVertUp: "\u2537",
    boldVert_thinLeft: "\u2528",
    boldVert_thinRight: "\u2520",

    // Thin box chars
    thinVert: "\u2502",
    thinflat: "",
    thinCross: ""
}

function tableRenderer(arg_data){
    // Reset table data
    columnWidths = [];
    fields = [];

    // Declare variable to return
    let return_table = "\n";
    return_table += renderHeaders(arg_data);

    // Render each row
    for(let i = 0; i < arg_data.length; i++){
        return_table += "\n";
        return_table += renderRow(arg_data[i]);
    }

    return_table += "\n" + renderFooter() + "\n";

    return return_table;
}

function renderHeaders(arg_rowData){
    // Init 3 levels of strings with appropriate border
    let top_string = boxChars.boldCorner_topLeft;
    let bottom_string = boxChars.boldVert_boldRight;
    let middle_string = boxChars.boldVert;
    
    // Get the fields returned by the database
    fields = Object.keys(arg_rowData[0]);

    // Render the box for each column header
    for(let i = 0; i < fields.length; i++){
        
        // Add the width of the columns
        let t_width = arg_rowData.reduce( (arg_total, arg_value) => {
            if(arg_value[fields[i]] == null){
                return arg_total;
            }
            else{
                return arg_total >= arg_value[fields[i]].toString().length ? arg_total : arg_value[fields[i]].toString().length;
            }
        }, fields[i].length);
        columnWidths.push(t_width);

        // Place enouch -- characters to fit the largest entry in the column
        let t_length = fields[i].length;
        top_string += boxChars.boldFlat.repeat(2 + t_width);
        bottom_string += boxChars.boldFlat.repeat(2 + t_width);
        
        // Generator header
        let t_middle = [" ".repeat(Math.floor((t_width - t_length) / 2)), fields[i].tableHeaders, " ".repeat(Math.ceil((t_width - t_length) / 2))].join(" ");
        middle_string += t_middle;
        
        // Append connecting character
        if(i === fields.length - 1){
            top_string += boxChars.boldCorner_topRight;
            bottom_string += boxChars.boldVert_boldLeft;
            middle_string += boxChars.boldVert;
        }
        else{
            top_string += boxChars.boldFlat_thinVertDown;
            bottom_string += boxChars.boldFlat_thinVert;
            middle_string += boxChars.thinVert;
        }    
    }

    // Combine the 3 layers
    return_string = [top_string, middle_string, bottom_string].join("\n");
    return return_string;
}

function renderRow(arg_rowData){
    let middle_string = boxChars.boldVert;

    // Render each cell in the row
    for(let i = 0; i < columnWidths.length; i++){
        // Calculate length
        let t_length; 
        if(arg_rowData[fields[i]] == null){
            t_length = 0;
        }
        else{
            t_length = arg_rowData[fields[i]].toString().trim().length;
        }

        // Render middle layer
        let t_middle = [" ".repeat(Math.floor((columnWidths[i] - t_length) / 2)), 
        // Ternary sorting used to apply colors styling -- MUST BE DONE INLINE
        // Style id column
        (groupArrays.id.includes(fields[i])) ? arg_rowData[fields[i]].toString().tableId : 
            // Style name entries
            (groupArrays.names.includes(fields[i])) ? arg_rowData[fields[i]].toString().tableNames : 
                // Syle money entries
                (groupArrays.money.includes(fields[i])) ? arg_rowData[fields[i]].toString().tableMoney : arg_rowData[fields[i]], 
            " ".repeat(Math.ceil((columnWidths[i] - t_length) / 2))].join(" ");

        // Add the string 
        middle_string += t_middle;

        if(i === columnWidths.length - 1){
            middle_string += boxChars.boldVert;
        }
        else{
            middle_string += boxChars.thinVert;
        }
    }

    let return_string = [middle_string].join("\n");
    return return_string;
}

function renderFooter(){
    let t_string = boxChars.boldCorner_botLeft;

    // For each column
    for(let i = 0; i < columnWidths.length; i++){
        t_string += boxChars.boldFlat.repeat(2 + columnWidths[i]);

        // Append vertical divider
        if(i === columnWidths.length - 1){
            t_string += boxChars.boldCorner_botRight;
        }
        else{
            t_string += boxChars.boldFlat_thinVertUp;
        }
    }

    return t_string;
}



module.exports = tableRenderer;