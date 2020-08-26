/** Global var to hold the columns returned by the database */
let columnWidths = [];

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

function tableRenderer(arg_data, arg_fields){
    // Declare variable to return
    let return_table = "\n \n";
    console.table(arg_data);
    return_table += renderHeaders(arg_data, arg_fields);

    // Render each row
    for(let i = 0; i < arg_data; i++){

    }

    console.log(return_table);
    return return_table;
}

function renderHeaders(arg_data, arg_fields){
    // ---------- Create top/bottom borders ----------
    let top_string = boxChars.boldCorner_topLeft;
    let bottom_string = boxChars.boldVert_boldRight;
    let middle_string = boxChars.boldVert;
    
    // For each field
    for(let i = 0; i < arg_fields.length; i++){
        
        // Add the width of the columns
        let t_width = arg_data.reduce( (arg_total, arg_value) => arg_total >= arg_value[arg_fields[i].name].toString().length ? arg_total : arg_value[arg_fields[i].name].toString().length, arg_fields[i].name.length);
        columnWidths.push(t_width);

        // Place enouch -- characters to fit the largest entry in the column
        let t_length = arg_fields[i].name.length;
        top_string += boxChars.boldFlat.repeat(2 + t_width);
        bottom_string += boxChars.boldFlat.repeat(2 + t_width);
        
        // Generator header
        let t_middle = [" ".repeat(Math.floor((t_width - t_length) / 2)), arg_fields[i].name, " ".repeat(Math.floor((t_width - t_length) / 2))].join(" ");
        middle_string += t_middle;
        
        // Append connecting character
        if(i === arg_fields.length - 1){
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

    return_string = top_string + "\n" + middle_string + "\n" + bottom_string;
    return return_string;
}

function renderRow(){

}

module.exports = tableRenderer;