let json = require('/Users/savio/Documents/cm/cm.json');
let axios = require('axios');

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

function readTextFile(file, callback) {
    console.log(Object.keys(json));

    let {
        cidade,
        codigo
    } = json;

    axios.post('http://localhost:3000/api/county', {
            name: cidade,
            external_id: codigo,
            available: true
        })
        .then(countyResponse => {
            let {
                _id
            } = countyResponse.data;
            console.log(countyResponse.data);
            axios.post('http://localhost:3000/api/institution', {
                    county: _id,
                    name: 'SECRETARIA CAMPO MOURÃO',
                })
                .then((institutionResponse) => {
                    console.log(institutionResponse.data);
                    let {
                        escolas
                    } = json;
                    escolas.forEach(e => {

                        axios.post('http://localhost:3000/api/institution', {
                                county: _id,
                                name: e.nome,
                            })
                            .then((schoolResponse) => {
                                if (e.nome == 'PARIGOT DE SOUZA, E M-EI EF') {
                                    console.log(Object.keys(e));
                                    e.turmas.forEach(t => {
                                        let id = Object.keys(t);
                                        console.log(id);
                                        let infos = t[id]['infos'];
                                        // console.log(infos);

                                        axios.post('http://localhost:3000/api/classroom', {
                                                school: schoolResponse.data._id,
                                                external_id: e['codigo'],
                                                course: infos['Curso'],
                                                shift: infos['Turno'],
                                                subClass: infos['Turma'],
                                                series: infos['Seriação'],
                                                hour: infos['Horário'],
                                            })
                                            .then(response => {
                                                let alunos = t[id]['alunos'];
                                                alunos.forEach(a => {
                                                    axios.post('http://localhost:3000/api/enrollment/externalfeed', {
                                                            classroom: response.data._id,
                                                            a
                                                        })
                                                        .then(response => {
                                                            // console.log(response.data);
                                                        })
                                                        .catch(error => {
                                                            // console.log(error);
                                                        });
                                                });
                                            })
                                            .catch(error => {
                                                console.log(error);
                                            });
                                    });
                                }
                            })
                            .catch(schoolError => {
                                console.error(schoolError);
                            });
                    });

                })
                .catch((err) => {
                    console.log(err);
                });
        })
        .catch(error => {
            console.log(error);
        });
}

//usage:
readTextFile("/Users/savio/Documents/cm/cm.json");