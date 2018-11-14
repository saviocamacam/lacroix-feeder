import re
import json
from time import sleep

import requests
from bs4 import BeautifulSoup as bs

BASE_URL = "http://idebescola.inep.gov.br/ideb"
BASE_URL_ESCOLA = f"{BASE_URL}/escola"

URLS = {
    "main": f"{BASE_URL}/consulta-publica",
    "municipios-by-uf": f"{BASE_URL}/get-municipio-by-uf",
    "escola": {
        "main": f"{BASE_URL_ESCOLA}/dadosEscola",
        "complex-gestao": f"{BASE_URL_ESCOLA}/complexidadeDaGestaoEscolar",
        "pratica-pedagogica": f"{BASE_URL_ESCOLA}/praticaPedagogicaInclusiva",
        "infra-basica": f"{BASE_URL_ESCOLA}/infraestruturaBasica",
        "espaco-eq": f"{BASE_URL_ESCOLA}/espacoDeAprendizagemEquipamentos",
        "organizacao": f"{BASE_URL_ESCOLA}/organizacao",
        "prova-brasil": f"{BASE_URL_ESCOLA}/provaBrasil",
        "indice": f"{BASE_URL_ESCOLA}/indiceDeDesenvolvimentoDaEducacaoBasica",
        # "posicao": f"{BASE_URL_ESCOLA}/posicaoEscola",
        # "indicadores": f"{BASE_URL_ESCOLA}/conhecaOsIndicadores"
    }
}


def get_ufs() -> dict:
    res = requests.get(URLS["main"])
    dom = bs(res.content.decode("utf-8", "ignore"), "lxml")

    select = dom.select_one("#pkCodEstado")
    options = select.select("option")[1:]

    ufs = {opt.text: opt["value"] for opt in options}
    return ufs


def get_municipios_by_uf(uf_id: str) -> dict:
    res = requests.post(URLS["municipios-by-uf"],
                        data={"pkCodEstado": uf_id})
    res = res.json()

    municipios = {mun["text"]: mun["value"] for mun in res}
    return municipios


def get_escolas_by_municipio(uf_id: str, municipio_id: int) -> dict:
    res = requests.post(URLS["main"],
                        data={"pkCodEstado": uf_id,
                              "pkCodMunicipio": municipio_id})
    dom = bs(res.content.decode("utf-8", "ignore"), "lxml")

    rows = [tuple(map(lambda x: x.text, row.select("td")[:2]))
            for row in dom.select("tr.coluna")]

    escolas = {row[1]: row[0] for row in rows}
    return escolas


def clear_response(item: dict):
    for key in ["arrGraficoLinhaInicial", "arrGraficoLinhaFinal"]:
        if key in item:
            item.pop(key)
    item = str(item).replace("'", '"')
    item = re.sub(" \[\w*\]|\[\w*\]", "", item)
    item = re.sub("Z{3} ", "/", item)

    return json.loads(item)


def get_main_info(dom: bs) -> dict:
    res = {}
    rows = dom.select("table.table-dados-escola tr")

    for row in rows:
        name, value = list(row.stripped_strings)
        res[name] = value

    return res


def get_escola_info(escola_id: str) -> dict:
    urls = {key: URLS["escola"][key] +
            f"/{escola_id}" for key in URLS["escola"]}

    res = {"id": escola_id}
    for key, url in urls.items():
        response = requests.get(url)
        if key == "main":
            dom = bs(response.content.decode("utf-8", "ignore"), "lxml")
            res[key] = get_main_info(dom)
        else:
            res[key] = clear_response(response.json())

    return res


if __name__ == "__main__":
    res = {"PARANÁ": {}}

    '''
    for uf, uf_id in get_ufs().items():
        res[uf] = {}
        for mun, mun_id in get_municipios_by_uf(uf_id).items():
            res[uf][mun] = {}
            for nome, _id in get_escolas_by_municipio(uf_id, mun_id).items():
                res[uf][mun][nome] = get_escola_info(_id)

    '''
    parana = get_ufs()["PARANÁ"]
    for mun, mun_id in get_municipios_by_uf(parana).items():
        # print(mun)
        if mun != "CAMPO MOURAO":
            continue
        res["PARANÁ"][mun] = {}
        for nome, _id in get_escolas_by_municipio(parana, mun_id).items():
            res["PARANÁ"][mun][nome] = get_escola_info(_id)
            sleep(10)

    with open("teste.json", "w") as f:
        f.write(json.dumps(res, ensure_ascii=False))
