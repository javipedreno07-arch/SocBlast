from openai import OpenAI
import json
import time
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def get_arena_config(arena: str):
    configs = {
        "Bronce": {
            "dificultad": "básica",
            "num_incidentes": 3,
            "tipo": "decisiones simples con 4 opciones",
            "amenazas": "brute force, phishing simple, malware básico",
            "tiempo": 20
        },
        "Plata": {
            "dificultad": "intermedia",
            "num_incidentes": 3,
            "tipo": "correlación de eventos y decisiones",
            "amenazas": "movimiento lateral, escalada de privilegios, C2",
            "tiempo": 15
        },
        "Oro": {
            "dificultad": "avanzada",
            "num_incidentes": 4,
            "tipo": "investigación compleja con múltiples vectores",
            "amenazas": "ransomware, exfiltración de datos, APT inicial",
            "tiempo": 10
        },
        "Elite": {
            "dificultad": "experta",
            "num_incidentes": 5,
            "tipo": "simulación APT completa multi-fase",
            "amenazas": "APT avanzado, zero-day, supply chain attack",
            "tiempo": 7
        }
    }
    return configs.get(arena, configs["Bronce"])

async def generar_sesion(arena: str):
    config = get_arena_config(arena)

    prompt = f"""Eres un generador de escenarios SOC profesionales.

Genera una sesión SOC de dificultad {config['dificultad']} con {config['num_incidentes']} incidentes.
Tipo de ejercicio: {config['tipo']}
Amenazas posibles: {config['amenazas']}

Devuelve SOLO un JSON válido con esta estructura exacta:
{{
  "titulo": "nombre del escenario",
  "contexto": "descripción del entorno empresarial (2-3 frases)",
  "incidentes": [
    {{
      "id": 1,
      "titulo": "nombre del incidente",
      "descripcion": "qué está pasando",
      "alertas": [
        {{
          "id": "ALT-001",
          "severidad": "CRITICA|ALTA|MEDIA|BAJA",
          "sistema": "nombre del sistema afectado",
          "descripcion": "descripción de la alerta",
          "timestamp": "2024-01-15 14:23:11",
          "detalles": {{
            "ip_origen": "x.x.x.x",
            "ip_destino": "x.x.x.x",
            "proceso": "nombre del proceso",
            "usuario": "nombre del usuario",
            "accion": "qué hizo"
          }}
        }}
      ],
      "logs": [
        {{
          "timestamp": "2024-01-15 14:23:11",
          "sistema": "nombre",
          "nivel": "ERROR|WARNING|INFO",
          "mensaje": "contenido del log"
        }}
      ],
      "solucion_correcta": {{
        "tipo_ataque": "nombre del ataque",
        "acciones_correctas": ["acción 1", "acción 2", "acción 3"],
        "explicacion": "explicación detallada de qué pasó y cómo responder"
      }}
    }}
  ]
}}

Asegúrate de que los escenarios sean realistas y técnicamente precisos."""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.8,
        max_tokens=3000
    )

    content = response.choices[0].message.content
    content = content.replace("```json", "").replace("```", "").strip()
    return json.loads(content)


async def evaluar_respuesta(incidente: dict, respuesta_usuario: str, tiempo_usado: int, tiempo_limite: int, pistas_usadas: int):
    prompt = f"""Eres un evaluador experto de analistas SOC.

INCIDENTE:
Título: {incidente['titulo']}
Descripción: {incidente['descripcion']}
Solución correcta: {json.dumps(incidente['solucion_correcta'], ensure_ascii=False)}

RESPUESTA DEL ANALISTA:
{respuesta_usuario}

TIEMPO USADO: {tiempo_usado} segundos de {tiempo_limite * 60} segundos disponibles
PISTAS USADAS: {pistas_usadas}

Evalúa la respuesta del analista y devuelve SOLO un JSON válido:
{{
  "puntuacion_calidad": <0-12>,
  "puntuacion_velocidad": <0-5>,
  "puntuacion_pistas": <0-3>,
  "total": <0-20>,
  "copas_delta": <-5 a 20>,
  "identifico_ataque": <true|false>,
  "acciones_correctas": <0-3>,
  "feedback": "feedback detallado de qué hizo bien y mal",
  "solucion_explicada": "explicación completa de la solución correcta",
  "skills_mejoradas": {{
    "analisis_logs": <0-10>,
    "deteccion_amenazas": <0-10>,
    "respuesta_incidentes": <0-10>,
    "threat_hunting": <0-5>,
    "forense_digital": <0-5>,
    "gestion_vulnerabilidades": <0-5>,
    "inteligencia_amenazas": <0-5>
  }}
}}

Sé justo pero exigente. Si no respondió o respondió mal da puntuación baja."""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=1000
    )

    content = response.choices[0].message.content
    content = content.replace("```json", "").replace("```", "").strip()
    return json.loads(content)