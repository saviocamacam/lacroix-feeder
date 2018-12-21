let json = require("./compressed/cm_2018_10_1/cm_savio.json");
let axios = require("axios");

axios.defaults.headers.post["Content-Type"] =
  "application/x-www-form-urlencoded";

let idSchool = "5ba9517bbde4ef0013e30f56";
let apiUrl = "https://www.atlaensino.com/api";
let nome_escola = "CONSTANTINO L DE MEDEIROS, E M-EI EF";
let headers = {
  headers: {
    "x-access-token":
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InByb2ZpbGVzIjpbeyJwcm9maWxlVHlwZSI6IlByb2ZpbGVQcm9mZXNzb3IiLCJfaWQiOiI1YmUwM2U0ZWI1NmVkODAwMTMzNTdjYTYifSx7InByb2ZpbGVUeXBlIjoiUHJvZmlsZVNjaG9vbCIsIl9pZCI6IjViZTRkNTRmNzVjZGIzMDAxMzY5MTQ5NyIsInJvbGUiOnsiX190IjoiUm9sZVNjaG9vbCIsIl9pZCI6IjViZTRkNTRmNzVjZGIzMDAxMzY5MTQ5NiIsInNjaG9vbCI6IjViYTk1MTdiYmRlNGVmMDAxM2UzMGY1NyIsInR5cGUiOiJwZWRBZHZpc29yIiwiX192IjowfX0seyJwcm9maWxlVHlwZSI6IlByb2ZpbGVDb3VudHkiLCJfaWQiOiI1YmY1OTg4MGNmOGYxMzAwMTM0YWFiNTUiLCJyb2xlIjp7Il9fdCI6IlJvbGVDb3VudHkiLCJfaWQiOiI1YmY1OTg4MGNmOGYxMzAwMTM0YWFiNTQiLCJjb3VudHkiOiI1YmE5NTE3YWJkZTRlZjAwMTNlMzBlYWUiLCJ0eXBlIjoicGVkQ2hpZWYiLCJfX3YiOjB9fSx7InByb2ZpbGVUeXBlIjoiUHJvZmlsZVNjaG9vbCIsIl9pZCI6IjViZjllNzIzNDE5YzI2MDAxM2MzODIyNCIsInJvbGUiOnsiX190IjoiUm9sZVNjaG9vbCIsIl9pZCI6IjViZjllNzIzNDE5YzI2MDAxM2MzODIyMyIsInNjaG9vbCI6IjViYTk1MTdjYmRlNGVmMDAxM2UzMGY3YiIsInR5cGUiOiJwZWRBZHZpc29yIiwiX192IjowfX0seyJwcm9maWxlVHlwZSI6IlByb2ZpbGVTY2hvb2wiLCJfaWQiOiI1YmZkYjQxZmI2OWFmNDAwMTNlZWUzZmEiLCJyb2xlIjp7Il9fdCI6IlJvbGVTY2hvb2wiLCJfaWQiOiI1YmZkYjQxZmI2OWFmNDAwMTNlZWUzZjkiLCJzY2hvb2wiOiI1YmE5NTE3Y2JkZTRlZjAwMTNlMzBmODkiLCJ0eXBlIjoic3ViZGlyZWN0b3IiLCJfX3YiOjB9fV0sIl9pZCI6IjViYTk3MTk2YmRlNGVmMDAxM2UzMGY5NyIsIm1haW5QaG9uZSI6IjViYTk3MTM4YmRlNGVmMDAxM2UzMGY5NCIsInNob3J0TmFtZSI6InNhdmlvY2FtYWNhbSIsInBlb3BsZSI6eyJfaWQiOiI1YmE5NzE5NmJkZTRlZjAwMTNlMzBmOTYiLCJuYW1lIjoiU2F2aW8gZGUgT2xpdmVpcmEgQ2FtYWNhbSJ9LCJtYWluUHJvZmlsZSI6IjViZTAzZTRlYjU2ZWQ4MDAxMzM1N2NhNiJ9LCJpYXQiOjE1NDMzNTMzNzYsImV4cCI6MTU0NDIxNzM3Nn0.dXiCbQ3wQGfBEaQZcKQg32ksCPZIDuWoYTlwredQbMc"
  }
};

function readTextFile(file, callback) {
  // console.log(Object.keys(json));
  let turmas = json[nome_escola]["turmas"];
  // console.log(turmas);
  turmas.forEach(turma => {
    let idTurma = Object.keys(turma);
    // console.log(idTurma);
    let infos = turma[idTurma]["infos"];
    // console.log(infos);
    let students = JSON.stringify(turma[idTurma]["alunos"]);
    students = students.replace(/\./g, "");
    students = JSON.parse(students);

    axios
      .post(
        `${apiUrl}/classroom`,
        {
          school: idSchool,
          course: infos["Curso"],
          shift: infos["Turno"],
          subClass: infos["Turma"],
          series: infos["Seriação"],
          hour: infos["Horário"],
          days: infos["diasFuncionamento"],
          external_id: idTurma
        },
        headers
      )
      .then(res => {
        console.log(res);
      })
      .catch(err => {
        // console.log(err);
      });
  });
}

readTextFile("");
