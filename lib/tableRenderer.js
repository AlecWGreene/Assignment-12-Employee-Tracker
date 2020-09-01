/** Global var to hold the columns returned by the database */
let columnWidths = [];

/** Global var to hold the fields requested to display */
let fields = [];

/** Groups of columns to apply stylings to */
const groupArrays = {
    id: ["id"],
    names: ["name", "first_name", "last_name", "title"],
    money: ["salary"]
}

const boxChars = {
    // Bold box chars
    boldCorner_topLeft: "\u2554",
    boldCorner_topRight: "\u2557",
    boldCorner_botLeft: "\u255A",
    boldCorner_botRight: "\u255D",
    boldVert: "\u2551",
    boldVert_boldLeft: "\u2563",
    boldVert_boldRight: "\u2560",
    boldFlat: "\u2550",
    
    // Joining chars
    boldFlat_thinVert: "\u256A",
    boldFlat_thinVertDown: "\u2564",
    boldFlat_thinVertUp: "\u2567",
    boldVert_thinLeft: "\u2562",
    boldVert_thinRight: "\u255F",

    // Thin box chars
    thinVert: "\u2502".gray,
    thinflat: "\u2500".gray,
    thinCross: "\u253C".gray
}

/** Generates a string representing the table of data */
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
        return_table += renderRow(arg_data[i], i % 2 === 0);
        if(i != arg_data.length - 1){ return_table += "\n" + renderRowDivider();}
    }

    return_table += "\n" + renderFooter() + "\n";

    return return_table;
}

/** Render headers for a table */
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

        // Place enough -- characters to fit the largest entry in the column
        let t_length = fields[i].length;
        top_string += boxChars.boldFlat.repeat(2 + t_width);
        bottom_string += boxChars.boldFlat.repeat(2 + t_width);
        
        // Generator header
        let t_middle = [" ".repeat(Math.floor((t_width - t_length) / 2)), renderHeaderText(fields[i]).tableHeaders, " ".repeat(Math.ceil((t_width - t_length) / 2))].join(" ");
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
            //middle_string += boxChars.thinVert;
            middle_string += "\u2502";
        }    
    }

    // Combine the 3 layers
    return_string = [top_string, middle_string, bottom_string].join("\n");
    return return_string;
}

/** Translates mysql labels into display format */
function renderHeaderText(arg_text){

    // Init helper variables
    let t_length = arg_text.length; 
    let return_text = "";

    // If header is an id label
    if(arg_text.match(/\w+(?=_id)/i)){
        return_text = arg_text.match(/[a-z]+(?=_)/gi).join(" ");
    }
    // If header is multiple words
    else if(arg_text.match(/\w+_\w+/i)){
        return_text = arg_text.match(/[a-z]+/gi).join(" ");
    }
    else{  
        return_text = arg_text;
    }

    // Capitalize the first letter of each word
    return_text = return_text.replace(/\b\w/gi, arg_char => arg_char.toUpperCase());

    // Adjust the length to match the original length
    let t_diff = t_length - return_text.length;
    return_text = [" ".repeat(Math.ceil(t_diff / 2)), return_text, " ".repeat(Math.floor(t_diff / 2))].join("");

    return return_text;
}

/** Render a row of data from a table */
function renderRow(arg_rowData, arg_background){
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
        let t_rowData = styleRow(arg_rowData);
        let t_middle = [" ".repeat(Math.floor((columnWidths[i] - t_length) / 2)), t_rowData[fields[i]], " ".repeat(Math.ceil((columnWidths[i] - t_length) / 2))].join(" ");

        // Add the string 
        middle_string += arg_background ? t_middle.tableRowBG : t_middle;

        // Append end of cell box char
        if(i === columnWidths.length - 1){
            middle_string += boxChars.boldVert;
        }
        else{
            middle_string += arg_background ? boxChars.thinVert.tableRowBG : boxChars.thinVert;
        }
    }

    let return_string = [middle_string].join("\n");
    return return_string;
}

function renderRowDivider(){
    let return_string = boxChars.boldVert_thinRight;

    // For each column
    for(let i = 0; i < fields.length; i++){
        return_string += boxChars.thinflat.repeat(2 + columnWidths[i]);

        if(i === columnWidths.length - 1){
            return_string += boxChars.boldVert_thinLeft;
        }
        else{
            return_string += boxChars.thinCross;
        }
    }

    return return_string;
}

/** Render the bottom border */
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

/** Applies color styles to the string */
function styleRow(arg_rowData){
    let return_array = {};

    // For each column
    for(let i = 0; i < fields.length; i++){

        // Switch based on the column data type
        if(groupArrays.id.includes(fields[i])){
            return_array[fields[i]] = arg_rowData[fields[i]].toString().tableId;
        }
        else if(groupArrays.names.includes(fields[i])){
            return_array[fields[i]] = arg_rowData[fields[i]].toString().tableNames;
        }
        else if(groupArrays.money.includes(fields[i])){
            return_array[fields[i]] = arg_rowData[fields[i]].toString().tableMoney;
        }
        else{
            return_array[fields[i]] = arg_rowData[fields[i]];
        }

    }

    return return_array;
}

console.log(renderHeaderText("deparment_id"));
console.log(renderHeaderText("first_name"));
console.log(renderHeaderText("id"));
console.log(renderHeaderText("title"));

module.exports = tableRenderer;