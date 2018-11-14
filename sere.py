import json
from time import sleep
from hashlib import md5
from os.path import exists
from urllib3 import disable_warnings
from collections import OrderedDict
from re import sub as re_sub, compile as re_compile, search as re_search

from requests import Session
from requests_html import HTML
from bs4 import BeautifulSoup as bs
from selenium.webdriver import Chrome, ChromeOptions
from selenium.webdriver.support.ui import Select

disable_warnings()

BASE = "https://www.sere.pr.gov.br/sere"
URLS = {
    "teste": f"{BASE}/escola/turma/frm_pesq_turmas.jsp?nextForm=/consultas/frm_pesq_consulta_padrao_turma2.jsp",
    "pesquisa": f"{BASE}/escola/consultas/frm_pesq_consulta_padrao_turma2.jsp",
    "cidades": f"{BASE}/index.do?action=carregarEstabelecimentos",
    "valida_cidade": f"{BASE}/index.do?action=validarEstabelecimento",
    "aluno": f"{BASE}/escola/consultas/frm_pesq_consulta_padrao_aluno.jsp"
}

DIAS = [
    "DOMINGO",
    "SEGUNDA-FEIRA",
    "TERÇA-FEIRA",
    "QUARTA-FEIRA",
    "QUINTA-FEIRA",
    "SEXTA-FEIRA",
    "SÁBADO",
]

cookies = {
    'SENTINELA_COOKIE_LOGIN': '40646868',
    '_ga': 'GA1.4.555647020.1520718142',
    'JSESSIONID': 'C6776C355F4AAE0A03256A83CE9DEB9F.node2',
    '_gid': 'GA1.4.1682670204.1521856655',
}

headers = {
    'Origin': 'https://www.sere.pr.gov.br',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9,pt;q=0.8',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Cache-Control': 'max-age=0',
    'Referer': 'https://www.sere.pr.gov.br/sere/index.do?action=validarEstabelecimento',
    'Connection': 'keep-alive',
}

s = Session()
s.cookies.update(cookies)
s.headers.update(headers)

opt = ChromeOptions()
driver = Chrome(chrome_options=opt)
cache_hit = False


def loga():
    driver.get(BASE)

    driver.implicitly_wait("10")

    nome = driver.find_element_by_id("CHAVE")
    senha = driver.find_element_by_id("CHAVE_ENCRIPT")
    btn = driver.find_element_by_class_name("login_botao")

    nome.clear()
    senha.clear()

    nome.send_keys("40646868")
    senha.send_keys("5jbse29t")
    sleep(1)
    btn.click()
    update_cookie()


def execute_script(script: str, *arguments):
    global driver

    return driver.execute_script(script, *arguments)


def handle_alert():
    global driver

    try:
        alert = driver.switch_to_alert()
    except Exception:
        pass
    else:
        alert.dismiss()


def handle_modal():
    global driver

    code = driver.find_element_by_tag_name("iframe").get_attribute("name")
    driver.switch_to_frame(code)
    sleep(2)
    driver.find_element_by_name("btnVoltar").click()
    driver.switch_to_default_content()


def have_modal():
    global driver

    script = "return document.querySelector(arguments[0])"
    return execute_script(script, ".dialog") is not None


def update_cookie():
    global driver

    cookies_ = execute_script("return document.cookie")
    cookies_ = [a.split("=")[1].strip(";") for a in cookies_.split()][1]
    cookies["JSESSIONID"] = cookies_
    s.cookies.update(cookies)


def check_ano_letivo() -> bool:
    global driver

    header = driver.find_element_by_class_name("infocabec")
    header = header.text.split()

    return "2018" in header


def create_menus():
    global driver, cache_hit

    level_1, level_2 = 18, 19

    if have_modal():
        handle_modal()
        level_1, level_2 = 20, 21

    selectors = [f"body > div:nth-child({level_1}) > div:nth-child(9)",
                 f"body > div:nth-child({level_2}) > div:nth-child(2)"]

    execute_script(
        'document.getElementById("divoCMenu0_0").dispatchEvent(new MouseEvent("mouseover"))')
    execute_script(
        'document.querySelector(arguments[0]).dispatchEvent(new MouseEvent("mouseover"))', selectors[0])
    execute_script(
        "document.querySelector(arguments[0]).click();", selectors[1])
    if not cache_hit:
        sleep(2)


def select_cidade_escolas(value):
    loga()

    s = Select(driver.find_element_by_name("codMunicipio"))
    s.select_by_value("430")  # CM
    s = Select(driver.find_element_by_name("codEstab"))
    s.select_by_value(value)

    sleep(1)
    driver.find_element_by_name("Submit").click()
    sleep(2)

    handle_alert()
    update_cookie()
    create_menus()


def get_payload_aluno(cod_turma, *info):
    cgm, num_matricula = info
    return [
        ('cgm', cgm),
        ('numMatricula', num_matricula),
        ('codTurma', cod_turma)
    ]


def get_payload(codigo_municipio: str,
                codigo_escola: str = "",
                submit: bool = False) -> list:
    body = [
        ('Municipiob', ''),
        ('nEstabelecimento', ''),
        ('codNREUsuario', '0'),
        ('strDependenciaADM', '0'),
        ('codMunicipio', codigo_municipio),
        ('SENTINELA', ''),
    ]

    if submit:
        body.append(('Submit', 'ok'))

    if codigo_escola:
        body.append(('codEstab', codigo_escola))

    return body


def send_request(url: str, data: dict = None, post=False):
    if data or post:
        response = s.post(url, data=data, verify=False)
    else:
        response = s.get(url, verify=False)

    return response.text if response.ok else None


def validate_response(response):
    dom = bs(response, "lxml")
    flag = True
    if dom.find(text=re_compile("Turma sem alunos matriculados!")):
        flag = False
    return flag


def check_cache(hash: str) -> bool:
    return exists(f"cache/{hash}")


def get_dom(url: str, data: dict=None, post=False, selenium=False):
    global cache_hit

    hash = md5((url + str(data)).encode()).hexdigest()
    print(hash, data)
    if check_cache(hash):
        # cache_hit = True
        with open(f"cache/{hash}") as f:
            response = f.read()
    else:
        if selenium:
            response = driver.page_source
        else:
            response = send_request(url, data, post)

        with open(f"cache/{hash}", "w") as f:
            f.write(str(response))

    if validate_response(response):
        return HTML(html=response)  # bs(response.text, "lxml")

    return None


def get_escolas(codigo_municipio: str) -> dict:
    dom = get_dom(URLS["cidades"], get_payload(codigo_municipio))

    if not dom:
        return None

    escolas = dom.find("select[name=codEstab] > option")
    escolas_json = []
    for escola in escolas:
        attrs = escola.attrs
        if not attrs.get("disabled") and attrs["value"][0] != "-":
            codigo = attrs["value"]
            nome = escola.text.strip()
            escolas_json.append({"nome": nome, "codigo": codigo, "turmas": []})
    return escolas_json


def get_cidades() -> dict:
    dom = get_dom(URLS["cidades"])

    if not dom:
        return None

    cidades = dom.find("select[name=codMunicipio] > option")[1:]
    cidades_json = {"cidades": []}

    for cidade in cidades:
        nome = cidade.text.strip()
        codigo = cidade.attrs["value"]
        cidades_json["cidades"].append({"cidade": nome, "codigo": codigo})
    return cidades_json


def get_info_pessoais(infoname: str, payload: dict) -> dict:
    dom = bs(get_dom(URLS["aluno"], payload, True).html, "lxml")

    if not dom:
        return {}

    ps = dom.find_all(class_="titulo_n2")

    for p in ps:
        if re_search(infoname, p.text):
            break

    table = p.find_next_sibling()
    string = [i.text.strip() for i in table.select("td") if i.text.strip()]
    string = [r.split(":") for r in string]

    res = OrderedDict()
    for campo, dado in string:
        campo, dado = campo.strip(), dado.strip()
        res[campo] = None if not dado else dado

    return res


def get_dados_aluno(header: list, data) -> tuple:
    payload = extract_values(data.find("a", first=True))
    data = data.text.strip().split("\n")[1:]
    return OrderedDict(zip(header, data)), payload


def get_info_curso(tag) -> dict:
    strings = [t.text.strip() for t in tag if t.text.strip()]
    keys_values = list(zip(strings[0::2], strings[1::2]))
    return {i.strip(": "): j for i, j in keys_values}


def get_info(tabela) -> dict:
    texto = tabela.text.strip(" :\n").split("\n")
    texto = [t.strip(" :") for t in texto if t]
    return OrderedDict(zip(texto[0::2], texto[1::2]))


def get_dados_turma(data: dict, cod_turma: str) -> dict:
    dom = get_dom(URLS["pesquisa"], data)

    if not check_ano_letivo():
        return "ANO_INVALIDO"

    if not dom:
        return {data["codTurma"]: {}}

    tabela_alunos = dom.find("#tb_alunos", first=True)

    tabela_header = tabela_alunos.find("thead", first=True)
    header = tabela_header.text.strip().split("\n")[1:-1]

    tabela_curso, tabela_funcionamento = dom.find(
        "#frmEnvio > table", first=True).find("td > table")[:2]

    tr_horario, tr_dias = tabela_funcionamento.find("tr")

    curso = get_info(tabela_curso)
    horario = get_info(tr_horario)

    input_dias = tr_dias.find("input")
    zip_dias = zip(DIAS, input_dias)
    dias_de_funcionamento = {i: 1 if j.attrs.get(
        "unchecked") is None else 0 for i, j in zip_dias}

    alunos = []

    for linha in tabela_alunos.find("tr")[1:]:
        aluno, payload = get_dados_aluno(header, linha)
        payload = get_payload_aluno(cod_turma, *payload)
        pais = get_info_pessoais("Filiação", payload)
        endereco = get_info_pessoais("Endereço", payload)
        contato = get_info_pessoais("Contato", payload)
        aluno["filiacao"] = pais
        aluno["endereco"] = endereco
        aluno["contato"] = contato
        alunos.append(aluno)

    return OrderedDict({
        data["codTurma"]: OrderedDict({
            "infos": OrderedDict({
                **curso,
                "diasFuncionamento": dias_de_funcionamento,
                **horario
            }),
            "alunos": alunos
        })
    })


def extract_values(values: str) -> tuple:
    return eval(re_sub("javascript:\w+", "", values.attrs["href"]))


def get_payloads_turma(payload: dict, dom=None) -> tuple:
    cods_turma, payloads = [], []
    if not dom:
        select_cidade_escolas(payload[-1][-1])
        dom = get_dom(URLS["teste"], post=True, selenium=True)

        if not dom:
            return None

    form_keys = ["nCurso", "codTurma", "turno",
                 "curso", "seriacao", "nTurma",
                 "nSeriacao", "nTurno", "codFormaOrganizacaoCurso"]

    form = dom.find("#frmEnvio", first=True)
    if not form:
        raise Exception("ERRO AO PEGAR TABELA COM TURMAS")

    form_values = form.find("[href*='javascript']")
    set_form_values = {extract_values(values) for values in form_values}

    for form_value in set_form_values:
        keys_values = OrderedDict(zip(form_keys, form_value))
        payloads.append(keys_values)
        cods_turma.append(form_value[1])

    return payloads, cods_turma


if __name__ == "__main__":
    loga()
    cidades = get_cidades()

    target = list(filter(lambda x: x["codigo"] == "430", cidades["cidades"]))
    for cidade in target:  # cidades["cidades"]:
        id_cidade = cidade["codigo"]
        cidade["escolas"] = get_escolas(id_cidade)

        count = 1
        for escola in cidade["escolas"]:
            cache_hit = False

            print(f"ESCOLA {count} de {len(cidade['escolas'])}")
            id_escola = escola["codigo"]
            main_payload = get_payload(id_cidade, id_escola, True)
            payloads, cods_turma = get_payloads_turma(main_payload)
            fodase = len(payloads)
            inner_count = 1
            while payloads:
                payload = payloads.pop(0)
                cod_turma = cods_turma.pop(0)
                print(f"\tTurma {inner_count} de {fodase}")
                inner_count += 1
                try:
                    dados = get_dados_turma(payload, cod_turma)
                except Exception as e:
                    print(payload)
                else:
                    if dados == "ANO_INVALIDO":
                        break
                    elif dados:
                        escola["turmas"].append(dados)
            count += 1
            # break

    driver.close()

    # with open("a.json", "w") as f:
    #    f.write(json.dumps(cidade, ensure_ascii=False, indent=2))
