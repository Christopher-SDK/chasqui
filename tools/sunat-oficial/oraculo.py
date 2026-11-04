"""Oráculo de conformidad: aplica las reglas XSL oficiales de SUNAT (paquete SFS/OSE).

Entrada (stdin):  JSON [{"tipo": "01"|"03"|"07"|"08", "nombre": "<RUC>-<tipo>-<serie>-<num>.xml", "xml": "<...>"}]
Salida (stdout):  JSON [{"estado": "ok"|"rechazo", "codigo": "2074"|null, "observaciones": ["4309", ...]}]

Las reglas oficiales están escritas para IBM DataPower. Se adaptan EN MEMORIA, sin tocar los
archivos descargados (docs/adr/0003):
- `func` se declara como prefijo de extensión (DataPower lo tolera sin declarar; libxslt no).
- `current-date()` (XSLT 2.0) se reemplaza por FECHA_ORACULO: el oráculo es determinista.
- `matches(x, re, '!')` (Saxon, regex con sintaxis Java) pasa a una función de Python.
- `dyn:evaluate("document('cat')/ruta")` se resuelve aquí, porque libxslt no expone document()
  dentro de dyn:evaluate.
- Variables redefinidas en una misma plantilla (XSLT 1.0 lo prohíbe; DataPower lo tolera): la
  redefinición se renombra a `nombre__N` y las referencias posteriores apuntan a ella.
"""
import json, os, re, sys
from lxml import etree

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../.cache/sunat-oficial/validation')
XSL = {
    '01': 'xsl/2.X/ValidaExprRegFactura-2.0.1.xsl',
    '03': 'xsl/2.X/ValidaExprRegBoleta-2.0.1.xsl',
    '07': 'xsl/2.X/ValidaExprRegNC-2.0.1.xsl',
    '08': 'xsl/2.X/ValidaExprRegND-2.0.1.xsl',
}
FECHA = os.environ.get('FECHA_ORACULO', '2026-11-03')
CHQ = 'urn:chasqui:oraculo'

etree.FunctionNamespace('http://www.datapower.com/extensions')['variable'] = lambda ctx, *a: ''

def _texto(v):
    # Semántica de string() en XPath: un conjunto de nodos vale el texto de su primer nodo.
    if isinstance(v, list):
        if not v:
            return ''
        v = v[0]
    if isinstance(v, etree._Element):
        return ''.join(v.itertext())
    return str(v)

_rx = {}
def coincide(ctx, valor, patron):
    p = _texto(patron)
    rx = _rx.get(p) or _rx.setdefault(p, re.compile(p))
    return rx.search(_texto(valor)) is not None

_docs = {}
def evaluar(ctx, expr):
    m = re.match(r"document\('([^']+)'\)(.*)$", expr, re.S)
    url = os.path.normpath(os.path.join(BASE, 'error', m.group(1)))
    doc = _docs.get(url) or _docs.setdefault(url, etree.parse(url))
    return doc.xpath('/' + m.group(2).lstrip('/'))

etree.FunctionNamespace(CHQ)['coincide'] = coincide
etree.FunctionNamespace(CHQ)['evaluar'] = evaluar

def parchear(src):
    if 'xmlns:func=' in src:
        src = src.replace('extension-element-prefixes="dp"', 'extension-element-prefixes="dp func"')
    src = src.replace('current-date()', f"'{FECHA}'")
    src = re.sub(r"\bmatches\(([^,]+),([^,]+),\s*'!'\)", r"chq:coincide(\1,\2)", src)
    src = src.replace('dyn:evaluate(', 'chq:evaluar(')
    src = src.replace('<xsl:stylesheet ', f'<xsl:stylesheet xmlns:chq="{CHQ}" ', 1)
    return desambiguar_variables(re.sub(r'^\ufeff?<\?xml[^>]*\?>', '', src))

X = '{http://www.w3.org/1999/XSL/Transform}'

def _renombrar(texto, alcance):
    for nombre, alias in alcance.items():
        if alias != nombre:
            texto = re.sub(r'\$' + re.escape(nombre) + r'(?![\w.-])', '$' + alias, texto)
    return texto

def _desambiguar(nodo, alcance, contador):
    for hijo in nodo:
        if not isinstance(hijo.tag, str):
            continue
        for k, v in hijo.attrib.items():
            if '$' in v and k != 'name':
                hijo.set(k, _renombrar(v, alcance))
        es_var = hijo.tag in (X + 'variable', X + 'param')
        # El contenido de una variable ve la definición anterior, no la propia.
        _desambiguar(hijo, dict(alcance), contador)
        if es_var:
            n = hijo.get('name')
            if n in alcance:
                contador[n] = contador.get(n, 1) + 1
                alias = f'{n}__{contador[n]}'
                hijo.set('name', alias)
                alcance[n] = alias
            else:
                alcance[n] = n

def desambiguar_variables(src):
    raiz = etree.fromstring(src.encode())
    for plantilla in raiz.iter(X + 'template', '{http://exslt.org/functions}function'):
        _desambiguar(plantilla, {}, {})
    return etree.tostring(raiz, encoding='unicode')

class Resolver(etree.Resolver):
    def resolve(self, url, pubid, ctx):
        if url.endswith('.xsl'):
            with open(url.removeprefix('file://'), encoding='utf-8') as f:
                return self.resolve_string(parchear(f.read()), ctx)

_xslt = {}
def hoja(tipo):
    if tipo not in _xslt:
        ruta = os.path.join(BASE, XSL[tipo])
        parser = etree.XMLParser()
        parser.resolvers.add(Resolver())
        with open(ruta, encoding='utf-8') as f:
            _xslt[tipo] = etree.XSLT(etree.fromstring(parchear(f.read()).encode(), parser, base_url=ruta))
    return _xslt[tipo]

def validar(caso):
    xslt = hoja(caso['tipo'])
    res = {'estado': 'ok', 'codigo': None, 'observaciones': []}
    try:
        xslt(etree.fromstring(caso['xml'].encode()), nombreArchivoEnviado=etree.XSLT.strparam(caso['nombre']))
    except etree.XSLTApplyError as e:
        res['estado'] = 'rechazo'
        m = re.search(r'errorCode (\d{4})', str(e))
        res['codigo'] = m.group(1) if m else str(e)
    for m in xslt.error_log:
        # El rechazo llega como ' error: ...'; las observaciones (addWarning) sin ese prefijo.
        w = re.search(r'errorCode (\d{4})', m.message)
        if w and not m.message.lstrip().startswith('error:'):
            res['observaciones'].append(w.group(1))
    return res

if __name__ == '__main__':
    print(json.dumps([validar(c) for c in json.load(sys.stdin)]))
