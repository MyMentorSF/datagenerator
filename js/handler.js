const api = require("./randomapi.js");

let legitList = [];
let mentorList = [];
let menteeList = [];
for (let i = 0; i < 40; i++) {
  let userReturn = api.randomPublicUser();
  let private = api.makePrivateUser(userReturn);
  delete private.mentors;
  delete private.mentees;
  delete private.agenda;
  legitList.push(private);
  if (private.isMentor) {
    mentorList.push(private)
  }
  if (private.isMentee) {
    menteeList.push(private)
  }
}

console.log(`Mentors: ${mentorList.length} Mentees: ${menteeList.length}`)

let privateUsers = "../private.json";
let appointments = "../appointments.json";
let connections = "../connections.json";
const fs = require('fs');
let writeStream = fs.createWriteStream(privateUsers);
legitList.forEach((us) => {
  writeStream.write(JSON.stringify(us), "utf8");
  writeStream.write("\n", "utf8");
})

// legitList.forEach((person) => {
//   if (person.isMentee) {
//     let ment = getRandomElement(mentorList);
//     while (ment.username != person.username) 
//     {
//       ment = getRandomElement(mentorList);
//     }

//   }
// })