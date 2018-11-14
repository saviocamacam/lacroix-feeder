let json = require("./compressed/cm_2018_10_1/cm_savio.json");
let axios = require("axios");

axios.defaults.headers.post["Content-Type"] =
  "application/x-www-form-urlencoded";

let idSchool = "5bde065cf4165438e4ba286f";
let headers = {
  headers: {
    "x-access-token":
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InByb2ZpbGVzIjpbeyJwcm9maWxlVHlwZSI6IlByb2ZpbGVQcm9mZXNzb3IiLCJfaWQiOiI1YmRlMGNiNmY0MTY1NDM4ZTRiYTI4NzYifSx7InByb2ZpbGVUeXBlIjoiUHJvZmlsZUNvdW50eSIsIl9pZCI6IjViZWFiMTRiYTI3YWE1NTQyMDExMWM0OCJ9XSwiX2lkIjoiNWJkZTA3ZjRmNDE2NTQzOGU0YmEyODc1Iiwic2hvcnROYW1lIjoic2F2aW9jYW1hY2FtIiwicGVvcGxlIjp7Il9pZCI6IjViZGUwN2Y0ZjQxNjU0MzhlNGJhMjg3NCIsIm5hbWUiOiJTYXZpbyBkZSBPbGl2ZWlyYSBDYW1hY2FtIn19LCJpYXQiOjE1NDIxMjE2MzgsImV4cCI6MTU0MjI5NDQzOH0.jaCfDCMGi9r2L7dGtsDQtJ6aOzkqngvsC_B_i5OFmhk"
  }
};

function readTextFile(file, callback) {
  // console.log(Object.keys(json));
  let turmas = json["PARIGOT DE SOUZA, E M-EI EF"]["turmas"];
  // console.log(turmas);
  turmas.forEach(turma => {
    let idTurma = Object.keys(turma);
    // console.log(idTurma);
    let infos = turma[idTurma]["infos"];
    // console.log(infos);
    let students = JSON.stringify(turma[idTurma]["alunos"]);
    students = students.replace(/\./g, "");
    console.log(infos["diasFuncionamento"]);
    axios
      .post(
        "http://localhost:3000/api/classroom",
        {
          school: idSchool,
          course: infos["Curso"],
          shift: infos["Turno"],
          subClass: infos["Turma"],
          series: infos["Seriação"],
          hour: infos["Horário"],
          days: infos["diasFuncionamento"],
          students: JSON.parse(students)
        },
        headers
      )
      .then(function(response) {
        console.log(response);
      })
      .catch(err => {
        // console.log(err);
      });
  });
}

readTextFile("");
