import os
import json
import random
from openai import AsyncOpenAI

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ── SUBHABILIDADES POR SKILL ─────────────────────────────────────────────────
SKILL_CRITERIA = {
    "analisis_logs": {
        "label": "Análisis de Logs",
        "criterios": [
            "Identificó los logs relevantes entre el ruido",
            "Correlacionó eventos por timestamp correctamente",
            "Leyó bien los campos clave (usuario, proceso, IP, puerto)",
            "Detectó anomalías en patrones de comportamiento",
            "Reconstruyó la secuencia cronológica del ataque",
        ]
    },
    "deteccion_amenazas": {
        "label": "Detección de Amenazas",
        "criterios": [
            "Identificó el IOC principal correcto",
            "Clasificó la severidad apropiadamente",
            "Distinguió falsos positivos de amenazas reales",
            "Reconoció el tipo de ataque correctamente",
            "Asoció el comportamiento con TTPs conocidas",
        ]
    },
    "respuesta_incidentes": {
        "label": "Respuesta a Incidentes",
        "criterios": [
            "Eligió la acción de contención correcta",
            "Priorizó bien contención sobre erradicación y recuperación",
            "No tomó acciones que causaran daño adicional",
            "Siguió el orden lógico de respuesta al incidente",
            "Propuso remediación adecuada al tipo de incidente",
        ]
    },
    "threat_hunting": {
        "label": "Threat Hunting",
        "criterios": [
            "Buscó proactivamente más allá de las alertas visibles",
            "Identificó movimiento lateral o persistencia oculta",
            "Formuló hipótesis correctas sobre el atacante",
            "Usó queries SIEM efectivas para descubrir amenazas",
            "Conectó indicios aparentemente no relacionados",
        ]
    },
    "forense_digital": {
        "label": "Forense Digital",
        "criterios": [
            "Identificó el vector de entrada del ataque",
            "Reconstruyó la cadena completa de compromiso",
            "Localizó artefactos forenses relevantes",
            "Estimó correctamente el alcance del daño",
            "Preservó la integridad de la evidencia en sus decisiones",
        ]
    },
    "gestion_vulnerabilidades": {
        "label": "Gestión de Vulnerabilidades",
        "criterios": [
            "Identificó la vulnerabilidad explotada",
            "Priorizó correctamente por criticidad e impacto",
            "Propuso parche o mitigación adecuada",
            "Evaluó el riesgo residual correctamente",
            "Consideró el contexto del entorno (producción, legacy...)",
        ]
    },
    "inteligencia_amenazas": {
        "label": "Inteligencia de Amenazas",
        "criterios": [
            "Asoció el ataque con actores o grupos conocidos si es posible",
            "Identificó TTPs usando MITRE ATT&CK correctamente",
            "Usó contexto de threat intel para enriquecer el análisis",
            "Reconoció infraestructura C2 o patrones de campaña",
            "Propuso indicadores para bloqueo proactivo",
        ]
    },
    "siem_queries": {
        "label": "SIEM & Queries",
        "criterios": [
            "Formuló queries eficientes y correctas",
            "Usó campos y operadores adecuados",
            "Redujo el ruido con filtros precisos",
            "Creó correlaciones útiles entre fuentes de logs",
            "Interpretó correctamente los resultados del SIEM",
        ]
    },
}

# ── CONFIGURACIÓN DE ARENA ───────────────────────────────────────────────────
ARENA_CONFIG = {
    "Bronce": {
        "dificultad": "básica",
        "descripcion": "Ataque directo con pocos pasos. Ideal para aprender el flujo SOC.",
        "num_alertas": 5, "num_logs": 12, "num_hosts": 3,
        "amenazas": "brute force SSH/RDP, descarga de malware vía phishing, acceso con credenciales robadas, persistencia básica",
        "ttps": "T1110 (Brute Force), T1566 (Phishing), T1078 (Valid Accounts), T1547 (Boot Persistence)",
    },
    "Plata": {
        "dificultad": "intermedia",
        "descripcion": "Ataque multi-fase con movimiento lateral.",
        "num_alertas": 7, "num_logs": 18, "num_hosts": 5,
        "amenazas": "spear phishing con payload, escalada de privilegios, movimiento lateral con PsExec, C2 básico sobre HTTP, persistencia en registro",
        "ttps": "T1566.001, T1059, T1021, T1071, T1547.001",
    },
    "Oro": {
        "dificultad": "avanzada",
        "descripcion": "APT multi-fase con técnicas de evasión.",
        "num_alertas": 9, "num_logs": 24, "num_hosts": 7,
        "amenazas": "APT living-off-the-land, credential dumping, DNS tunneling C2, exfiltración cifrada, anti-forensics básico",
        "ttps": "T1003, T1071.004, T1055, T1547, T1070",
    },
    "Diamante": {
        "dificultad": "experta",
        "descripcion": "APT completo con evasión activa y ruido deliberado.",
        "num_alertas": 11, "num_logs": 30, "num_hosts": 9,
        "amenazas": "zero-day, exfiltración encubierta, anti-forensics activo, pass-the-hash masivo, golden ticket Kerberos",
        "ttps": "T1190, T1195, T1070, T1036, T1558, T1560",
    },
}


async def generar_sesion(arena: str) -> dict:
    cfg = ARENA_CONFIG.get(arena, ARENA_CONFIG["Bronce"])

    prompt = f"""Eres un experto SOC creando un ejercicio de entrenamiento para analistas.

NIVEL: {arena} ({cfg['dificultad']})
DESCRIPCIÓN: {cfg['descripcion']}
AMENAZAS: {cfg['amenazas']}
TTPs MITRE: {cfg['ttps']}
ALERTAS: {cfg['num_alertas']} | LOGS: {cfg['num_logs']} | HOSTS: {cfg['num_hosts']}

Genera un incidente SOC realista y completo en JSON con esta estructura EXACTA:

{{
  "titulo": "Título descriptivo del incidente",
  "descripcion": "Descripción del escenario para el analista",
  "incidentes": [
    {{
      "id": 1,
      "titulo": "Nombre del incidente",
      "descripcion": "Contexto del incidente",
      "alertas": [
        {{"id": 1, "severidad": "CRITICA|ALTA|MEDIA|BAJA", "tipo": "tipo de alerta", "mensaje": "descripción", "host": "hostname", "ip": "ip", "timestamp": "2024-03-15 02:18:33"}}
      ],
      "logs": [
        {{"id": 1, "tipo": "Windows|Linux|Network|SIEM", "contenido": "línea de log realista", "timestamp": "2024-03-15 02:18:33", "relevante": true|false}}
      ],
      "diagnostico_correcto": "Descripción exacta de lo que ocurrió",
      "tipo_ataque": "nombre del tipo de ataque",
      "mitre_tecnica": "T1XXX - Nombre técnica",
      "mitre_subtecnica": "T1XXX.XXX - subtécnica si aplica",
      "acciones_correctas": ["acción 1", "acción 2", "acción 3"],
      "accion_incorrecta": "acción que NO se debe tomar",
      "ioc_principal": "el IOC más importante del incidente",
      "proceso_malicioso": "proceso o archivo malicioso involucrado",
      "preguntas_analisis": [
        {{"id": 1, "pregunta": "¿Cuál es el IOC principal de este incidente?", "tipo": "ioc", "respuesta_esperada": "respuesta correcta detallada", "pista": "pista útil"}},
        {{"id": 2, "pregunta": "¿Qué proceso malicioso está involucrado y qué hace?", "tipo": "proceso", "respuesta_esperada": "respuesta correcta detallada", "pista": "pista útil"}},
        {{"id": 3, "pregunta": "¿Qué técnica MITRE ATT&CK se está utilizando y por qué?", "tipo": "mitre", "respuesta_esperada": "respuesta correcta detallada", "pista": "pista útil"}},
        {{"id": 4, "pregunta": "¿Cuál es la acción de contención más urgente?", "tipo": "contencion", "respuesta_esperada": "respuesta correcta detallada", "pista": "pista útil"}}
      ]
    }}
  ]
}}

IMPORTANTE:
- Los logs deben ser realistas (formato real de Windows Event Log, syslog, etc.)
- Mezcla logs relevantes con ruido (relevante: false)
- Las preguntas deben poder responderse con la información del incidente
- El ioc_principal debe aparecer explícitamente en los logs
- Responde SOLO con el JSON, sin texto adicional"""

    resp = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.8,
        max_tokens=4000,
    )

    raw = resp.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    return json.loads(raw)


async def evaluar_respuesta(
    incidente: dict,
    respuesta_usuario: dict,
    tiempo_usado: int,
    tiempo_limite: int,
    pistas_usadas: int,
    arena: str,
) -> dict:
    """
    respuesta_usuario = {
        "alertas_seleccionadas": [...],
        "logs_seleccionados": [...],
        "diagnostico": "texto",
        "accion_elegida": "texto",
        "respuestas_preguntas": [
            {"id": 1, "respuesta": "texto"},
            ...
        ]
    }
    """

    # Construir criterios de evaluación detallados
    criterios_texto = ""
    for skill_key, skill_data in SKILL_CRITERIA.items():
        criterios_texto += f"\n### {skill_data['label']} ({skill_key})\n"
        for i, criterio in enumerate(skill_data['criterios'], 1):
            criterios_texto += f"  {i}. {criterio}\n"

    prompt = f"""Eres un evaluador experto SOC. Evalúa el rendimiento de un analista en este incidente.

## INCIDENTE
Título: {incidente.get('titulo', 'Incidente SOC')}
Tipo de ataque: {incidente.get('tipo_ataque', 'Desconocido')}
IOC principal: {incidente.get('ioc_principal', 'No especificado')}
Proceso malicioso: {incidente.get('proceso_malicioso', 'No especificado')}
Técnica MITRE: {incidente.get('mitre_tecnica', 'No especificado')}
Diagnóstico correcto: {incidente.get('diagnostico_correcto', 'No especificado')}
Acciones correctas: {json.dumps(incidente.get('acciones_correctas', []), ensure_ascii=False)}
Acción incorrecta: {incidente.get('accion_incorrecta', 'No especificado')}

## PREGUNTAS Y RESPUESTAS CORRECTAS
{json.dumps(incidente.get('preguntas_analisis', []), ensure_ascii=False, indent=2)}

## RESPUESTA DEL ANALISTA
Diagnóstico: {respuesta_usuario.get('diagnostico', 'Sin respuesta')}
Acción elegida: {respuesta_usuario.get('accion_elegida', 'Sin acción')}
Alertas seleccionadas: {json.dumps(respuesta_usuario.get('alertas_seleccionadas', []), ensure_ascii=False)}
Logs seleccionados: {json.dumps(respuesta_usuario.get('logs_seleccionados', []), ensure_ascii=False)}
Respuestas a preguntas HTB:
{json.dumps(respuesta_usuario.get('respuestas_preguntas', []), ensure_ascii=False, indent=2)}

## TIEMPO
Tiempo usado: {tiempo_usado}s de {tiempo_limite*60}s disponibles
Pistas usadas: {pistas_usadas}

## CRITERIOS DE EVALUACIÓN POR SKILL
Para cada skill, evalúa cada uno de sus 5 subcriterios con 0, 1 o 2 puntos:
- 0 = No demostrado o incorrecto
- 1 = Parcialmente demostrado
- 2 = Bien demostrado
{criterios_texto}

Responde ÚNICAMENTE con este JSON:
{{
  "puntuacion_total": <número 0-20>,
  "skills_evaluadas": {{
    "analisis_logs": {{
      "puntuacion": <0-10>,
      "subcriterios": [
        {{"criterio": "Identificó los logs relevantes entre el ruido", "puntos": <0|1|2>, "comentario": "breve explicación"}},
        {{"criterio": "Correlacionó eventos por timestamp correctamente", "puntos": <0|1|2>, "comentario": "breve explicación"}},
        {{"criterio": "Leyó bien los campos clave (usuario, proceso, IP, puerto)", "puntos": <0|1|2>, "comentario": "breve explicación"}},
        {{"criterio": "Detectó anomalías en patrones de comportamiento", "puntos": <0|1|2>, "comentario": "breve explicación"}},
        {{"criterio": "Reconstruyó la secuencia cronológica del ataque", "puntos": <0|1|2>, "comentario": "breve explicación"}}
      ]
    }},
    "deteccion_amenazas": {{
      "puntuacion": <0-10>,
      "subcriterios": [
        {{"criterio": "Identificó el IOC principal correcto", "puntos": <0|1|2>, "comentario": "breve explicación"}},
        {{"criterio": "Clasificó la severidad apropiadamente", "puntos": <0|1|2>, "comentario": "breve explicación"}},
        {{"criterio": "Distinguió falsos positivos de amenazas reales", "puntos": <0|1|2>, "comentario": "breve explicación"}},
        {{"criterio": "Reconoció el tipo de ataque correctamente", "puntos": <0|1|2>, "comentario": "breve explicación"}},
        {{"criterio": "Asoció el comportamiento con TTPs conocidas", "puntos": <0|1|2>, "comentario": "breve explicación"}}
      ]
    }},
    "respuesta_incidentes": {{
      "puntuacion": <0-10>,
      "subcriterios": [
        {{"criterio": "Eligió la acción de contención correcta", "puntos": <0|1|2>, "comentario": "breve explicación"}},
        {{"criterio": "Priorizó bien contención sobre erradicación y recuperación", "puntos": <0|1|2>, "comentario": "breve explicación"}},
        {{"criterio": "No tomó acciones que causaran daño adicional", "puntos": <0|1|2>, "comentario": "breve explicación"}},
        {{"criterio": "Siguió el orden lógico de respuesta al incidente", "puntos": <0|1|2>, "comentario": "breve explicación"}},
        {{"criterio": "Propuso remediación adecuada al tipo de incidente", "puntos": <0|1|2>, "comentario": "breve explicación"}}
      ]
    }},
    "threat_hunting": {{
      "puntuacion": <0-10>,
      "subcriterios": [
        {{"criterio": "Buscó proactivamente más allá de las alertas visibles", "puntos": <0|1|2>, "comentario": "breve explicación"}},
        {{"criterio": "Identificó movimiento lateral o persistencia oculta", "puntos": <0|1|2>, "comentario": "breve explicación"}},
        {{"criterio": "Formuló hipótesis correctas sobre el atacante", "puntos": <0|1|2>, "comentario": "breve explicación"}},
        {{"criterio": "Usó queries SIEM efectivas para descubrir amenazas", "puntos": <0|1|2>, "comentario": "breve explicación"}},
        {{"criterio": "Conectó indicios aparentemente no relacionados", "puntos": <0|1|2>, "comentario": "breve explicación"}}
      ]
    }},
    "forense_digital": {{
      "puntuacion": <0-10>,
      "subcriterios": [
        {{"criterio": "Identificó el vector de entrada del ataque", "puntos": <0|1|2>, "comentario": "breve explicación"}},
        {{"criterio": "Reconstruyó la cadena completa de compromiso", "puntos": <0|1|2>, "comentario": "breve explicación"}},
        {{"criterio": "Localizó artefactos forenses relevantes", "puntos": <0|1|2>, "comentario": "breve explicación"}},
        {{"criterio": "Estimó correctamente el alcance del daño", "puntos": <0|1|2>, "comentario": "breve explicación"}},
        {{"criterio": "Preservó la integridad de la evidencia en sus decisiones", "puntos": <0|1|2>, "comentario": "breve explicación"}}
      ]
    }},
    "gestion_vulnerabilidades": {{
      "puntuacion": <0-10>,
      "subcriterios": [
        {{"criterio": "Identificó la vulnerabilidad explotada", "puntos": <0|1|2>, "comentario": "breve explicación"}},
        {{"criterio": "Priorizó correctamente por criticidad e impacto", "puntos": <0|1|2>, "comentario": "breve explicación"}},
        {{"criterio": "Propuso parche o mitigación adecuada", "puntos": <0|1|2>, "comentario": "breve explicación"}},
        {{"criterio": "Evaluó el riesgo residual correctamente", "puntos": <0|1|2>, "comentario": "breve explicación"}},
        {{"criterio": "Consideró el contexto del entorno", "puntos": <0|1|2>, "comentario": "breve explicación"}}
      ]
    }},
    "inteligencia_amenazas": {{
      "puntuacion": <0-10>,
      "subcriterios": [
        {{"criterio": "Asoció el ataque con actores o grupos conocidos", "puntos": <0|1|2>, "comentario": "breve explicación"}},
        {{"criterio": "Identificó TTPs usando MITRE ATT&CK correctamente", "puntos": <0|1|2>, "comentario": "breve explicación"}},
        {{"criterio": "Usó contexto de threat intel para enriquecer el análisis", "puntos": <0|1|2>, "comentario": "breve explicación"}},
        {{"criterio": "Reconoció infraestructura C2 o patrones de campaña", "puntos": <0|1|2>, "comentario": "breve explicación"}},
        {{"criterio": "Propuso indicadores para bloqueo proactivo", "puntos": <0|1|2>, "comentario": "breve explicación"}}
      ]
    }},
    "siem_queries": {{
      "puntuacion": <0-10>,
      "subcriterios": [
        {{"criterio": "Formuló queries eficientes y correctas", "puntos": <0|1|2>, "comentario": "breve explicación"}},
        {{"criterio": "Usó campos y operadores adecuados", "puntos": <0|1|2>, "comentario": "breve explicación"}},
        {{"criterio": "Redujo el ruido con filtros precisos", "puntos": <0|1|2>, "comentario": "breve explicación"}},
        {{"criterio": "Creó correlaciones útiles entre fuentes de logs", "puntos": <0|1|2>, "comentario": "breve explicación"}},
        {{"criterio": "Interpretó correctamente los resultados del SIEM", "puntos": <0|1|2>, "comentario": "breve explicación"}}
      ]
    }}
  }},
  "skills_mejoradas": {{
    "analisis_logs": {{"delta": <0.0-0.4>, "malo": <true|false>}},
    "deteccion_amenazas": {{"delta": <0.0-0.4>, "malo": <true|false>}},
    "respuesta_incidentes": {{"delta": <0.0-0.4>, "malo": <true|false>}},
    "threat_hunting": {{"delta": <0.0-0.4>, "malo": <true|false>}},
    "forense_digital": {{"delta": <0.0-0.4>, "malo": <true|false>}},
    "gestion_vulnerabilidades": {{"delta": <0.0-0.4>, "malo": <true|false>}},
    "inteligencia_amenazas": {{"delta": <0.0-0.4>, "malo": <true|false>}},
    "siem_queries": {{"delta": <0.0-0.4>, "malo": <true|false>}}
  }},
  "copas_delta": <número positivo o negativo>,
  "total": <0-20>,
  "feedback": "Feedback detallado explicando el desempeño del analista, qué hizo bien y qué debe mejorar",
  "diagnostico_correcto": <true|false>,
  "velocidad_bonus": <0-3>
}}

CRITERIOS PARA skills_mejoradas:
- delta > 0 solo si la puntuacion de esa skill fue >= 6/10
- malo = true si la puntuacion fue <= 3/10
- El delta debe ser proporcional a la puntuacion (6/10 → 0.1, 8/10 → 0.2, 10/10 → 0.4)
- Solo responde con el JSON"""

    resp = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=3000,
    )

    raw = resp.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    evaluacion = json.loads(raw)

    # Bonus velocidad
    pct_tiempo = tiempo_usado / (tiempo_limite * 60) if tiempo_limite > 0 else 1
    if pct_tiempo < 0.4:
        evaluacion["velocidad_bonus"] = evaluacion.get("velocidad_bonus", 0) + 3
    elif pct_tiempo < 0.6:
        evaluacion["velocidad_bonus"] = evaluacion.get("velocidad_bonus", 0) + 2
    elif pct_tiempo < 0.8:
        evaluacion["velocidad_bonus"] = evaluacion.get("velocidad_bonus", 0) + 1

    # Penalización pistas
    evaluacion["total"] = max(0, evaluacion.get("total", 0) - (pistas_usadas * 0.5))

    # Copas delta basado en puntuación
    total = evaluacion.get("total", 0)
    if total >= 16:
        evaluacion["copas_delta"] = random.randint(25, 40)
    elif total >= 12:
        evaluacion["copas_delta"] = random.randint(10, 24)
    elif total >= 8:
        evaluacion["copas_delta"] = random.randint(0, 9)
    elif total >= 5:
        evaluacion["copas_delta"] = random.randint(-15, -1)
    else:
        evaluacion["copas_delta"] = random.randint(-30, -16)

    return evaluacion
