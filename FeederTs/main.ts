import { CountyManagement } from "./countyManagement";

let county: CountyManagement;
let op;
do {
  var stdin = process.openStdin();

  stdin.addListener("data", function(d) {
    // note:  d is an object, and when converted to a string it will
    // end with a linefeed.  so we (rather crudely) account for that
    // with toString() and then substring()
    console.log("you entered: [" + d.toString().trim() + "]");
  });
  op = prompt("Please enter an option: ");
  console.log("1: Authenticate");
  console.log("2: List Counties from atlaensino.com");
  console.log("3: List Counties from atlaensinodev.com");
  console.log("3: List Counties from atlaensinobreak.com");
} while (op != 9);
