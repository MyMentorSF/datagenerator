// Documentation: https://randomapi.com/documentation
// Your awesome API code here...
let pronouns = ["He", "She", "They"];
let colleges = [
  "University of Texas at Dallas",
  "Texas A&M",
  "University of Texas at Arlingtion",
  "Southern Methodist University",
  "Harvard",
  "Yale",
];
let majors = [
  "Psychology",
  "Marketing",
  "Business Analytics",
  "Computer Science",
  "Computer Engineering",
  "Music",
];
let interests = [
  "Graphql",
  "AWS",
  "React",
  "Data Science",
  "Data Analytics",
  "Machine Learning",
  "Leadership",
  "Claims",
];

let degreeType = ["Associates", "Bachelors", "Masters", "Phd"];
let locations = ["Atlanta", "Dallas", "Bloomington", "Phoenix"];
let roles = ["Sotware Engineer", "Manager", "Technical Analyst"];
let departments = ["ET", "Labs", "Data", "Claims"];

var faker = require("faker");

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomElements(n, arr) {
  let ret = [];
  for (let i = 1; i < n; i++) {
    let item = getRandomElement(arr);
    if (ret.includes(item)) {
      i--;
    } else {
      ret.push(item);
    }
  }
  return ret;
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomInterests() {
  let num = randomNumber(3, interests.length);
  return getRandomElements(num, interests);
}

function randomPublicUser(
  mentee = Math.random() >= 0.5,
  mentor = Math.random() >= 0.5
) {
  return {
    username: faker.internet.userName(),
    email: faker.internet.email(), //String
    firstName: faker.name.firstName(), //String
    lastName: faker.name.lastName(), //String
    pronoun: getRandomElement(pronouns), //String
    age: mentee ? randomNumber(18, 30) : randomNumber(22, 80), //Number
    yearsOfExperience: mentee ? randomNumber(1, 4) : randomNumber(1, 50), //Number
    description: faker.lorem.sentences(2), //String
    isMentor: mentee ? Math.random() >= 0.5 : true, //Boolean
    isMentee: mentee,
    role: mentee ? "Intern" : getRandomElement(roles),
    department: getRandomElement(departments), //String
    location: getRandomElement(locations), //String
    interests: getRandomInterests(), //Array of Strings
    education: {
      school: getRandomElement(colleges), //String,
      gradDate: mentee ? faker.date.future() : faker.date.past(), //String,
      major: getRandomElement(majors), //String,
      degreeType: getRandomElement(degreeType), //String
    },
  };
}

function mentors() {
  let num = randomNumber(1, 6);
  let ret = [];
  for (let i = 0; i < num; i++) {
    ret.push(randomPublicUser(Math.random() >= 0.5, true));
  }
  return ret;
}

function mentees() {
  let num = randomNumber(1, 10);
  let ret = [];
  for (let i = 0; i < num; i++) {
    ret.push(randomPublicUser(true, Math.random() >= 0.5));
  }
  return ret;
}

function addDays(date, days) {
  const copy = new Date(Number(date));
  copy.setDate(date.getDate() + days);
  return copy;
}

function getRandomDate() {
  var date = new Date();
  date.setHours(0, 0, 0, 0);
  return addDays(date, randomNumber(0, 30));
}

function scheduleAppointment(user1, user2) {
  let host = user1;
  let guest = user2;
  let startTime = new Date(
    getRandomDate().getTime() +
    randomNumber(7, 16) * 60 * 60000 +
    randomNumber(0, 12) * 5 * 60000
  );
  let endTime = new Date(startTime.getTime() + 60000 * randomNumber(1, 2) * 30);
  return {
    title: faker.lorem.words(5),
    summary: faker.lorem.sentences(2),
    location: getRandomElement(locations),
    startDate: startTime,
    endDate: endTime,
    id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), // Don't send from client side
    host: host.username,
    guest: guest.username,
    hostEmail: host.email,
    guestEmail: guest.email,
    guestConfirmed: true, // Don't send. Will be auto confirmed in lambda
  };
}

function generateAppointments(user, users) {
  let ret = [];
  let amount_of_appointments = randomNumber(0, users.length);
  let appointees = getRandomElements(amount_of_appointments, users);
  appointees.forEach((user2) => {
    ret.push(scheduleAppointment(user, user2));
  });
  return ret;
}

function makePrivateUser(user) {
  let _mentors = user.isMentee ? mentors() : [];
  let _mentees = user.isMentor ? mentees() : [];
  return {
    uuid: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    username: user.username,
    email: user.email,
    firstName: user.firstName, //String
    lastName: user.lastName, //String
    pronoun: user.pronoun,
    age: user.age,
    yearsOfExperience: user.yearsOfExperience,
    description: user.description,
    isMentor: user.isMentor,
    isMentee: user.isMentee,
    mentors: _mentors,
    mentees: _mentees,
    agenda: generateAppointments(user, _mentors.concat(_mentees)),
    role: user.role,
    department: user.department,
    location: user.location,
    interests: user.interest,
    education: user.education,
  };
}

// let userReturn = randomPublicUser();
// api.publicProfile = userReturn;
// let private = makePrivateUser(userReturn);
// api.privateProfile = private
let legitList = [];
let mentorList = [];
let menteeList = [];
for (let i = 0; i < 40; i++) {
  let userReturn = randomPublicUser();
  let private = makePrivateUser(userReturn);
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