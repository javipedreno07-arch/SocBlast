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
            "tiempo": 20,
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
            "falsos_positivos": "1 alerta que parece crítica pero es actividad legítima (mantenimiento, backup, etc.)",
            "tiempo": 15,
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
            "falsos_positivos": "1-2 alertas ambiguas que requieren análisis profundo para determinar si son reales",
            "tiempo": 10,
            "contexto_empresa": "empresa Fortune 1000 con SOC 24/7, EDR, SIEM y segmentación de red",
        },
        "Diamante": {
            "dificultad": "experta",
            "num_incidentes": 5,
            "num_alertas": "5-6",
            "num_logs": "12-14",
            "senuelos": "4+ logs misleading, alertas de distracción coordinadas, ruido artificial del atacante",
            "tipo": "simulación APT completa multi-fase, el atacante usa técnicas de evasión activa",
            "amenazas": "APT avanzado, zero-day, supply chain attack, insider threat avanzado, living-off-the-land",
            "falsos_positivos": "2-3 alertas que el atacante ha generado deliberadamente para distraer al analista",
            "tiempo": 7,
            "contexto_empresa": "infraestructura crítica nacional o banco de primer nivel con SOC tier 3",
        }
    }
    return configs.get(tier, configs["Bronce"])


# Skills evaluables por nivel de arena
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

    prompt = f"""Eres un generador experto de escenarios SOC profesionales para una plataforma de entrenamiento.

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

INSTRUCCIONES CRÍTICAS PARA SEÑUELOS:
1. Incluye logs completamente irrelevantes (actividad normal, backups, actualizaciones) mezclados con los importantes
2. Incluye al menos 1 alerta que parece sospechosa pero tiene explicación legítima
3. En arenas avanzadas, el atacante genera ruido deliberadamente para confundir
4. Las IPs, hostnames, usuarios y procesos deben ser técnicamente realistas
5. Los timestamps deben mostrar una progresión lógica de los eventos

Devuelve SOLO un JSON válido con esta estructura exacta:
{{
  "titulo": "nombre descriptivo y técnico del escenario",
  "contexto": "descripción del entorno empresarial específico (2-3 frases con detalles técnicos)",
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
      "solucion_correcta": {{
        "tipo_ataque": "EXACTAMENTE uno de los valores listados abajo",
        "acciones_correctas": ["acción 1 específica", "acción 2 específica", "acción 3 específica"],
        "explicacion": "explicación detallada de qué pasó, por qué y cómo responder correctamente (3-4 frases)"
      }}
    }}
  ]
}}

VALORES EXACTOS para tipo_ataque (usa uno de estos literalmente):
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

IMPORTANTE:
- Los escenarios deben ser técnicamente precisos y realistas
- Los logs irrelevantes deben parecer legítimos (no obviamente falsos)
- Al menos 1 incidente por sesión debe tener un componente de falso positivo o señuelo relevante
- Los mensajes de log deben seguir formatos reales (Syslog, Windows Event Log, etc.)
- Las IPs internas en rango 10.x.x.x o 192.168.x.x, las externas en rangos públicos reales"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.85,
        max_tokens=4000,
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
    # Determinar nivel de arena
    if "Diamante" in arena:
        nivel = "Diamante"
    elif "Oro" in arena:
        nivel = "Oro"
    elif "Plata" in arena:
        nivel = "Plata"
    else:
        nivel = "Bronce"

    skills_a_evaluar = SKILLS_POR_NIVEL.get(nivel, SKILLS_POR_NIVEL["Bronce"])

    # Parsear la respuesta del usuario
    partes = {}
    for parte in respuesta_usuario.split('|'):
        if ':' in parte:
            k, v = parte.split(':', 1)
            partes[k.strip()] = v.strip()

    diag_usuario  = partes.get('DIAG', 'Sin diagnóstico')
    just_usuario  = partes.get('JUST', 'Sin justificación')
    logs_usuario  = partes.get('LOGS', '')
    acciones_txt  = partes.get('ACCIONES', '')

    # Construir bloque de skills con criterios específicos
    skills_criterios = {
        "analisis_logs":             "¿Identificó los logs relevantes y descartó el ruido? ¿Extrajo timestamps y secuencia correcta?",
        "deteccion_amenazas":        "¿Clasificó correctamente el tipo de amenaza y su severidad? ¿Evitó caer en falsos positivos?",
        "respuesta_incidentes":      "¿Las acciones de contención/erradicación son correctas y están bien ordenadas?",
        "siem_queries":              "¿Demostró conocimiento de queries o sintaxis de búsqueda para investigar el incidente?",
        "gestion_vulnerabilidades":  "¿Priorizó correctamente los vectores de ataque según riesgo real?",
        "inteligencia_amenazas":     "¿Identificó TTPs, actores conocidos o familias de malware relevantes?",
        "forense_digital":           "¿Construyó una línea de tiempo forense coherente con los artefactos disponibles?",
        "threat_hunting":            "¿Propuso hipótesis de hunting proactivas o buscó IOCs más allá del incidente visible?",
    }

    criterios_aplicables = "\n".join(
        f"- {s}: {skills_criterios[s]}" for s in skills_a_evaluar
    )

    # Construir estructura de respuesta esperada para skills
    skills_json_template = "\n    ".join(
        f'"{s}": {{"delta": <0.0-0.3>, "malo": <true|false>}},' for s in skills_a_evaluar
    ).rstrip(",")

    prompt = f"""Eres un evaluador experto de analistas SOC. Evalúa la respuesta con criterio profesional pero justo.

═══ INCIDENTE ═══
Título: {incidente['titulo']}
Descripción: {incidente['descripcion']}

Solución correcta:
- Tipo de ataque: {incidente['solucion_correcta']['tipo_ataque']}
- Acciones correctas: {', '.join(incidente['solucion_correcta']['acciones_correctas'])}
- Explicación: {incidente['solucion_correcta']['explicacion']}

═══ RESPUESTA DEL ANALISTA ═══
Diagnóstico elegido: {diag_usuario}
Logs seleccionados (índices): {logs_usuario}
Acciones elegidas: {acciones_txt}
Justificación escrita:
"{just_usuario}"

═══ MÉTRICAS ═══
Tiempo usado: {tiempo_usado}s de {tiempo_limite * 60}s disponibles
Pistas usadas: {pistas_usadas}
Arena: {arena}

═══ CRITERIOS DE EVALUACIÓN ═══

PUNTUACIÓN CALIDAD (0-12):
- Diagnóstico correcto: +5 puntos
- Diagnóstico parcialmente correcto (mismo vector de ataque): +2 puntos
- Justificación técnicamente precisa y detallada: +4 puntos
- Justificación básica pero correcta: +2 puntos
- Acciones correctas y en buen orden: +3 puntos
- Acciones correctas pero mal ordenadas: +1 punto

PUNTUACIÓN VELOCIDAD (0-5):
- Menos del 30% del tiempo: 5 puntos
- 30-50% del tiempo: 4 puntos
- 50-70% del tiempo: 3 puntos
- 70-90% del tiempo: 2 puntos
- 90-100% del tiempo: 1 punto
- Timeout: 0 puntos

PUNTUACIÓN PISTAS (0-3):
- 0 pistas: 3 puntos
- 1 pista: 1 punto
- 2+ pistas: 0 puntos

COPAS_DELTA:
- Total 17-20: entre +35 y +40
- Total 13-16: entre +20 y +34
- Total 9-12: entre +8 y +19
- Total 5-8: entre 0 y +7
- Total 0-4: entre -5 y -15

═══ EVALUACIÓN DE SKILLS ═══
Evalúa SOLO estas skills (las correspondientes al nivel {nivel}):
{criterios_aplicables}

Para cada skill:
- "delta": float entre 0.0 y 0.3
  * 0.0 = el analista falló claramente esta skill o no aplica
  * 0.1 = respuesta básica, parcialmente correcta
  * 0.2 = buena respuesta, demuestra conocimiento sólido
  * 0.3 = respuesta excelente, nivel experto
- "malo": true si el analista falló claramente esta skill (delta 0.0 Y era evaluable en este incidente)
  Si la skill no era relevante para este incidente concreto, pon delta 0.0 y malo false.

Devuelve SOLO un JSON válido:
{{
  "puntuacion_calidad": <0-12>,
  "puntuacion_velocidad": <0-5>,
  "puntuacion_pistas": <0-3>,
  "total": <0-20>,
  "copas_delta": <-15 a 40>,
  "identifico_ataque": <true|false>,
  "acciones_correctas_count": <0-3>,
  "feedback": "feedback detallado en 2-3 frases: qué hizo bien, qué falló, consejo específico",
  "solucion_explicada": "explicación completa de la solución correcta con contexto técnico (2-3 frases)",
  "skills_mejoradas": {{
    {skills_json_template}
  }}
}}

Sé honesto: si la justificación es vaga o incorrecta, penalízala. Si el analista identificó correctamente el ataque aunque eligiera acciones subóptimas, reconócelo."""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        max_tokens=1200,
        response_format={"type": "json_object"}
    )

    content = response.choices[0].message.content
    result  = json.loads(content)

    # Garantizar que total = suma de componentes
    total_calculado = (
        result.get('puntuacion_calidad', 0) +
        result.get('puntuacion_velocidad', 0) +
        result.get('puntuacion_pistas', 0)
    )
    result['total'] = min(20, max(0, total_calculado))

    # Normalizar skills_mejoradas: asegurar que delta es float y malo es bool
    skills_raw = result.get("skills_mejoradas", {})
    skills_normalizadas = {}
    for skill in skills_a_evaluar:
        dato = skills_raw.get(skill, {"delta": 0.0, "malo": False})
        # Compatibilidad: si la IA devuelve el formato antiguo (solo número), convertir
        if isinstance(dato, (int, float)):
            delta = float(dato)
            skills_normalizadas[skill] = {
                "delta": min(0.3, max(0.0, delta * 0.15)),  # escalar 0-2 → 0-0.3
                "malo": delta == 0
            }
        else:
            skills_normalizadas[skill] = {
                "delta": min(0.3, max(0.0, float(dato.get("delta", 0.0)))),
                "malo": bool(dato.get("malo", False))
            }
    result["skills_mejoradas"] = skills_normalizadas

    return result