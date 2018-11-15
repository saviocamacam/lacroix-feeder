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

Array.prototype.indexOfId = function(id) {
  for (var i = 0; i < this.length; i++) {
    if (JSON.stringify(Object.keys(this[i])) === JSON.stringify(id)) {
      return i;
    }
  }
  return -1;
};

function feed_enrollments(nomeEscola) {
  axios
    .get(`http://localhost:3000/api/classroom?school=${idSchool}`, headers)
    .then(res => {
      classrooms = res.data.data;
      classrooms.forEach(classroom => {
        let b = { a: classroom.external_id };
        let a = Object.keys(b).reduce(
          (obj, key) => Object.assign({}, obj, { [b[key]]: key }),
          {}
        );
        let idTurma = Object.keys(a);
        let indice = json[nomeEscola]["turmas"].indexOfId(idTurma);
        students = json[nomeEscola]["turmas"][indice][idTurma]["alunos"];
        students = JSON.stringify(students);
        students = students.replace(/\./g, "");
        students = JSON.parse(students);

        students.forEach(student => {
          let filiacao = student.filiacao;
          delete student.filiacao;

          let contato = student.contato;
          delete student.contato;

          let endereco = student.endereco;
          delete student.endereco;

          axios
            .post(
              "http://localhost:3000/api/enrollment",
              {
                basic: student,
                filiacao: filiacao,
                contato: contato,
                endereco: endereco,
                classroom: classroom._id
              },
              headers
            )
            .then(function(response) {
              console.log(response);
            })
            .catch(err => {
              console.error(err);
            });
        });
      });
    })
    .catch(err => {
      console.log(err);
    });
}

feed_enrollments("PARIGOT DE SOUZA, E M-EI EF");
