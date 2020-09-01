const Table = require("cli-table3");

/** An array of objects with the property header indicating that the header should be replaced by the property value  */
let headerReplacements = [];
let columnWidths = [];

/** Global var to hold the table */
let displayTable;

function tableRenderer(arg_data){
    displayTable = new Table({
        head: ["header1", "header2", "header3"],
        chars:{
            "top-left": "\u250f", "top": "\u2501", "top-mid": "\u252f", "top-right": "\u2513",
            "left": "\u2503", "mid": " ", "mid-mid": " ", "middle": "\u2502", "right-mid": "\u2528", "right": "\u2503",
            "bot-left": "\u2517", "bot": "\u2501", "bot-mid": "\u2537", "bot-right": "\u251b"
        }
    });

    displayTable.push(
        ["col1", "col2", "col3"],
        ["row11", "row12", "row13"],
        ["row21", "row22", "row23"]
    );

    console.log(displayTable.toString());
}


// boldCorner_topLeft: "\u250f",
// boldCorner_topRight: "\u2513",
// boldCorner_botLeft: "\u2517",
// boldCorner_botRight: "\u251b",
// boldVert: "\u2503",
// boldVert_boldLeft: "\u252b",
// boldVert_boldRight: "\u2523",
// boldFlat: "\u2501",

// // Joining chars
// boldFlat_thinVert: "\u253f",
// boldFlat_thinVertDown: "\u252f",
// boldFlat_thinVertUp: "\u2537",
// boldVert_thinLeft: "\u2528",
// boldVert_thinRight: "\u2520",

// // Thin box chars
// thinVert: "\u2502",
// thinflat: "",
// thinCross: ""

tableRenderer();

module.exports = tableRenderer;