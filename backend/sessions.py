from openai import OpenAI
import json
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def get_arena_config(arena: str):
    if "Diamante" in arena:
        tier = "Diamante"
    elif "Oro" in arena:
        tier = "Oro"
    elif "Plata" in arena:
        tier = "Plata"
    else:
        tier = "Bronce"

    configs = {
        "Bronce": {
            "dificultad": "básica",
            "num_incidentes": 3,
            "num_alertas": "2-3",
            "num_logs": "6-8",
            "senuelos": "1 log claramente irrelevante mezclado con los relevantes",
            "tipo": "decisiones simples, amenazas identificables sin correlación compleja",
            "amenazas": "brute force, phishing simple, malware básico, acceso no autorizado",
            "falsos_positivos": "0-1 alertas que parecen sospechosas pero son legítimas",
            "tiempo": 15,   # reducido de 20 → 15 min
            "contexto_empresa": "PYME de 50 empleados con infraestructura básica",
        },
        "Plata": {
            "dificultad": "intermedia",
            "num_incidentes": 3,
            "num_alertas": "3-4",
            "num_logs": "8-10",
            "senuelos": "2 logs irrelevantes o misleading mezclados con los importantes",
            "tipo": "correlación de eventos entre sistemas, decisiones con contexto ambiguo",
            "amenazas": "movimiento lateral, escalada de privilegios, C2 básico, spear phishing",
            "falsos_positivos": "1 alerta que parece crítica pero es actividad legítima",
            "tiempo": 10,   # reducido de 15 → 10 min
            "contexto_empresa": "empresa de 200 empleados con Active Directory y SIEM básico",
        },
        "Oro": {
            "dificultad": "avanzada",
            "num_incidentes": 4,
            "num_alertas": "4-5",
            "num_logs": "10-12",
            "senuelos": "3 logs misleading o irrelevantes, 1 alerta que parece crítica pero es ruido",
            "tipo": "investigación con múltiples vectores de ataque, correlación SIEM/EDR compleja",
            "amenazas": "ransomware, exfiltración de datos, APT inicial, DNS tunneling",
            "falsos_positivos": "1-2 alertas ambiguas que requieren análisis profundo",
            "tiempo": 7,    # reducido de 10 → 7 min
            "contexto_empresa": "empresa Fortune 1000 con SOC 24/7, EDR, SIEM y segmentación de red",
        },
        "Diamante": {
            "dificultad": "experta",
            "num_incidentes": 5,
            "num_alertas": "5-6",
            "num_logs": "12-14",
            "senuelos": "4+ logs misleading, alertas de distracción coordinadas, ruido artificial",
            "tipo": "simulación APT completa multi-fase, el atacante usa técnicas de evasión activa",
            "amenazas": "APT avanzado, zero-day, supply chain attack, insider threat, living-off-the-land",
            "falsos_positivos": "2-3 alertas que el atacante ha generado deliberadamente para distraer",
            "tiempo": 5,    # reducido de 7 → 5 min
            "contexto_empresa": "infraestructura crítica nacional o banco de primer nivel con SOC tier 3",
        }
    }
    return configs.get(tier, configs["Bronce"])


SKILLS_POR_NIVEL = {
    "Bronce":   ["analisis_logs", "deteccion_amenazas", "respuesta_incidentes", "siem_queries"],
    "Plata":    ["analisis_logs", "deteccion_amenazas", "respuesta_incidentes",
                 "siem_queries", "gestion_vulnerabilidades", "inteligencia_amenazas"],
    "Oro":      ["analisis_logs", "deteccion_amenazas", "respuesta_incidentes",
                 "siem_queries", "gestion_vulnerabilidades", "inteligencia_amenazas",
                 "forense_digital", "threat_hunting"],
    "Diamante": ["analisis_logs", "deteccion_amenazas", "respuesta_incidentes",
                 "siem_queries", "gestion_vulnerabilidades", "inteligencia_amenazas",
                 "forense_digital", "threat_hunting"],
}


async def generar_sesion(arena: str):
    config = get_arena_config(arena)

    prompt = f"""Eres un generador experto de escenarios SOC profesionales para una plataforma de entrenamiento estilo HackTheBox.

CONFIGURACIÓN:
- Arena: {arena} (dificultad: {config['dificultad']})
- Número de incidentes: {config['num_incidentes']}
- Alertas por incidente: {config['num_alertas']}
- Logs por incidente: {config['num_logs']}
- Señuelos/ruido: {config['senuelos']}
- Tipo de ejercicio: {config['tipo']}
- Amenazas posibles: {config['amenazas']}
- Falsos positivos: {config['falsos_positivos']}
- Contexto empresa: {config['contexto_empresa']}

INSTRUCCIONES CRÍTICAS:
1. Incluye logs completamente irrelevantes (actividad normal, backups, actualizaciones) mezclados con los importantes
2. Incluye al menos 1 alerta que parece sospechosa pero tiene explicación legítima
3. Los timestamps deben mostrar una progresión lógica de los eventos
4. Las IPs, hostnames, usuarios y procesos deben ser técnicamente realistas
5. Los mensajes de log deben seguir formatos reales (Syslog, Windows Event Log, etc.)

IMPORTANTE — para la evaluación posterior, cada incidente debe tener 4 preguntas
con sus respuestas correctas. Estas preguntas serán respondidas por el analista
como si fuera HackTheBox: campos individuales, respuestas cortas y precisas.

Devuelve SOLO un JSON válido:
{{
  "titulo": "nombre descriptivo y técnico del escenario",
  "contexto": "descripción del entorno empresarial específico (2-3 frases técnicas)",
  "incidentes": [
    {{
      "id": 1,
      "titulo": "título técnico del incidente",
      "descripcion": "descripción detallada de qué está ocurriendo (2-3 frases técnicas)",
      "alertas": [
        {{
          "id": "ALT-001",
          "severidad": "CRITICA|ALTA|MEDIA|BAJA",
          "sistema": "nombre específico del sistema (ej: CORP-DC01, WEB-SRV-03)",
          "descripcion": "descripción técnica de la alerta",
          "timestamp": "2024-03-15 14:23:11",
          "detalles": {{
            "ip_origen": "x.x.x.x",
            "ip_destino": "x.x.x.x",
            "proceso": "nombre_proceso.exe",
            "usuario": "dominio\\\\usuario",
            "accion": "descripción de la acción detectada"
          }}
        }}
      ],
      "logs": [
        {{
          "timestamp": "2024-03-15 14:23:11",
          "sistema": "nombre_sistema",
          "nivel": "ERROR|WARNING|INFO",
          "mensaje": "mensaje técnico del log — puede ser ruido o relevante"
        }}
      ],
      "preguntas_analisis": [
        {{
          "id": 1,
          "pregunta": "¿Cuál es la IP de origen del ataque?",
          "placeholder": "Ej: 192.168.1.105",
          "tipo": "ip|hash|proceso|tecnica|accion|texto",
          "respuesta_correcta": "valor exacto o palabra clave que debe contener la respuesta",
          "pista": "pista corta que ayuda sin revelar la respuesta"
        }},
        {{
          "id": 2,
          "pregunta": "¿Qué proceso malicioso fue ejecutado?",
          "placeholder": "Ej: mimikatz.exe",
          "tipo": "proceso",
          "respuesta_correcta": "nombre del proceso",
          "pista": "busca en los logs de Sysmon o EDR"
        }},
        {{
          "id": 3,
          "pregunta": "¿Qué técnica MITRE ATT&CK se utilizó? (ID y nombre)",
          "placeholder": "Ej: T1110 - Brute Force",
          "tipo": "tecnica",
          "respuesta_correcta": "T1XXX o nombre de la técnica",
          "pista": "revisa el patrón de comportamiento en los logs"
        }},
        {{
          "id": 4,
          "pregunta": "¿Cuál es la primera acción de contención recomendada?",
          "placeholder": "Ej: Aislar el host CORP-WS01 de la red",
          "tipo": "accion",
          "respuesta_correcta": "acción de contención principal",
          "pista": "piensa en contener antes que en investigar"
        }}
      ],
      "solucion_correcta": {{
        "tipo_ataque": "EXACTAMENTE uno de los valores listados abajo",
        "acciones_correctas": ["acción 1 específica", "acción 2 específica", "acción 3 específica"],
        "explicacion": "explicación detallada de qué pasó, por qué y cómo responder (3-4 frases)"
      }}
    }}
  ]
}}

VALORES EXACTOS para tipo_ataque:
- Brute Force / Password Spray
- Phishing con payload
- Ransomware activo
- Movimiento lateral interno
- Exfiltración de datos
- Insider Threat
- Falso positivo — actividad legítima
- DNS Tunneling / C2
- Escalada de privilegios
- Supply Chain Attack

Las 4 preguntas deben ser:
1. IOC técnico concreto (IP, hash, dominio, usuario comprometido)
2. Artefacto o proceso malicioso identificado
3. Técnica MITRE ATT&CK aplicable
4. Acción de contención/respuesta prioritaria

Las respuestas correctas deben ser verificables directamente en los datos del incidente."""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.85,
        max_tokens=4500,
        response_format={"type": "json_object"}
    )

    content = response.choices[0].message.content
    return json.loads(content)


async def evaluar_respuesta(
    incidente: dict,
    respuesta_usuario: str,
    tiempo_usado: int,
    tiempo_limite: int,
    pistas_usadas: int,
    arena: str = "Bronce"
):
    if "Diamante" in arena:
        nivel = "Diamante"
    elif "Oro" in arena:
        nivel = "Oro"
    elif "Plata" in arena:
        nivel = "Plata"
    else:
        nivel = "Bronce"

    skills_a_evaluar = SKILLS_POR_NIVEL.get(nivel, SKILLS_POR_NIVEL["Bronce"])

    # Parsear respuesta
    partes = {}
    for parte in respuesta_usuario.split('|'):
        if ':' in parte:
            k, v = parte.split(':', 1)
            partes[k.strip()] = v.strip()

    diag_usuario    = partes.get('DIAG', 'Sin diagnóstico')
    logs_usuario    = partes.get('LOGS', '')
    acciones_txt    = partes.get('ACCIONES', '')
    triaje_txt      = partes.get('TRIAJE', '')

    # Respuestas HTB (preguntas individuales)
    resp_q1 = partes.get('Q1', '')
    resp_q2 = partes.get('Q2', '')
    resp_q3 = partes.get('Q3', '')
    resp_q4 = partes.get('Q4', '')

    preguntas = incidente.get('preguntas_analisis', [])
    correctas_esperadas = [p.get('respuesta_correcta', '') for p in preguntas]

    skills_criterios = {
        "analisis_logs":             "¿Identificó los logs relevantes y descartó el ruido?",
        "deteccion_amenazas":        "¿Clasificó correctamente el tipo de amenaza y su severidad?",
        "respuesta_incidentes":      "¿Las acciones de contención son correctas y bien ordenadas?",
        "siem_queries":              "¿Demostró conocimiento de búsqueda para investigar el incidente?",
        "gestion_vulnerabilidades":  "¿Priorizó correctamente los vectores según riesgo real?",
        "inteligencia_amenazas":     "¿Identificó TTPs, actores conocidos o familias de malware?",
        "forense_digital":           "¿Construyó una línea de tiempo forense coherente?",
        "threat_hunting":            "¿Propuso hipótesis de hunting proactivas más allá del incidente?",
    }

    criterios_aplicables = "\n".join(
        f"- {s}: {skills_criterios[s]}" for s in skills_a_evaluar
    )

    skills_json_template = "\n    ".join(
        f'"{s}": {{"delta": <0.0-0.3>, "malo": <true|false>}},' for s in skills_a_evaluar
    ).rstrip(",")

    prompt = f"""Eres un evaluador experto de analistas SOC estilo HackTheBox/TryHackMe. Evalúa con criterio profesional y estricto.

═══ INCIDENTE ═══
Título: {incidente['titulo']}
Descripción: {incidente['descripcion']}

Solución correcta:
- Tipo de ataque: {incidente['solucion_correcta']['tipo_ataque']}
- Acciones correctas: {', '.join(incidente['solucion_correcta']['acciones_correctas'])}
- Explicación: {incidente['solucion_correcta']['explicacion']}

Respuestas correctas esperadas:
- Q1: {correctas_esperadas[0] if len(correctas_esperadas)>0 else 'N/A'}
- Q2: {correctas_esperadas[1] if len(correctas_esperadas)>1 else 'N/A'}
- Q3: {correctas_esperadas[2] if len(correctas_esperadas)>2 else 'N/A'}
- Q4: {correctas_esperadas[3] if len(correctas_esperadas)>3 else 'N/A'}

═══ RESPUESTA DEL ANALISTA ═══
Diagnóstico elegido: {diag_usuario}
Logs seleccionados (índices): {logs_usuario}
Acciones elegidas: {acciones_txt}
Triaje: {triaje_txt}

Respuestas HTB:
- Q1: "{resp_q1}"
- Q2: "{resp_q2}"
- Q3: "{resp_q3}"
- Q4: "{resp_q4}"

═══ MÉTRICAS ═══
Tiempo usado: {tiempo_usado}s de {tiempo_limite * 60}s disponibles
Pistas usadas: {pistas_usadas}
Arena: {arena}

═══ CRITERIOS DE PUNTUACIÓN (MÁS ESTRICTOS) ═══

PUNTUACIÓN CALIDAD (0-12):
- Diagnóstico 100% correcto: +4 puntos
- Diagnóstico parcialmente correcto: +1 punto
- Diagnóstico incorrecto: 0 puntos

Preguntas HTB (cada una vale hasta 1.5 puntos, total 6 pts):
- Respuesta exacta o contiene la keyword correcta: 1.5 pts
- Respuesta aproximada pero reconocible: 0.75 pts
- Incorrecta o vacía: 0 pts

Acciones de respuesta correctas y ordenadas: +2 puntos
Acciones correctas mal ordenadas: +0.5 puntos
Acciones incorrectas: 0 puntos

PUNTUACIÓN VELOCIDAD (0-5) — MÁS ESTRICTA:
- Menos del 25% del tiempo: 5 puntos
- 25-40% del tiempo: 4 puntos
- 40-60% del tiempo: 3 puntos
- 60-80% del tiempo: 1.5 puntos
- 80-100% del tiempo: 0.5 puntos
- Timeout: 0 puntos

PUNTUACIÓN PISTAS (0-3):
- 0 pistas: 3 puntos
- 1 pista: 1 punto
- 2+ pistas: 0 puntos

COPAS_DELTA (más estricto):
- Total 17-20: entre +30 y +40
- Total 13-16: entre +15 y +29
- Total 9-12: entre +3 y +14
- Total 5-8: entre -5 y +2
- Total 0-4: entre -20 y -6

═══ EVALUACIÓN DE SKILLS ═══
Evalúa SOLO estas skills para el nivel {nivel}:
{criterios_aplicables}

Para cada skill:
- delta: 0.0-0.3 (0.0=fallo, 0.1=básico, 0.2=bien, 0.3=excelente)
- malo: true si falló claramente esta skill evaluable en este incidente

Devuelve SOLO JSON válido:
{{
  "puntuacion_calidad": <0-12>,
  "puntuacion_velocidad": <0-5>,
  "puntuacion_pistas": <0-3>,
  "total": <0-20>,
  "copas_delta": <-20 a 40>,
  "identifico_ataque": <true|false>,
  "acciones_correctas_count": <0-3>,
  "preguntas_resultado": [
    {{"id": 1, "correcto": <true|false>, "puntos": <0-1.5>}},
    {{"id": 2, "correcto": <true|false>, "puntos": <0-1.5>}},
    {{"id": 3, "correcto": <true|false>, "puntos": <0-1.5>}},
    {{"id": 4, "correcto": <true|false>, "puntos": <0-1.5>}}
  ],
  "feedback": "feedback detallado en 2-3 frases: qué hizo bien, qué falló, consejo específico",
  "solucion_explicada": "explicación completa de la solución correcta con contexto técnico (2-3 frases)",
  "skills_mejoradas": {{
    {skills_json_template}
  }}
}}"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        max_tokens=1400,
        response_format={"type": "json_object"}
    )

    content = response.choices[0].message.content
    result  = json.loads(content)

    total_calculado = (
        result.get('puntuacion_calidad', 0) +
        result.get('puntuacion_velocidad', 0) +
        result.get('puntuacion_pistas', 0)
    )
    result['total'] = min(20, max(0, total_calculado))

    skills_raw = result.get("skills_mejoradas", {})
    skills_normalizadas = {}
    for skill in skills_a_evaluar:
        dato = skills_raw.get(skill, {"delta": 0.0, "malo": False})
        if isinstance(dato, (int, float)):
            delta = float(dato)
            skills_normalizadas[skill] = {
                "delta": min(0.3, max(0.0, delta * 0.15)),
                "malo": delta == 0
            }
        else:
            skills_normalizadas[skill] = {
                "delta": min(0.3, max(0.0, float(dato.get("delta", 0.0)))),
                "malo": bool(dato.get("malo", False))
            }
    result["skills_mejoradas"] = skills_normalizadas

    return result