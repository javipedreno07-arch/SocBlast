import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SBNav, ACC, BG, BASE_CSS } from './SBLayout';
import { useAuth } from '../context/AuthContext';

// ─── DATOS ────────────────────────────────────────────────────────────────────
const MODULOS = [
  {
    id:1, num:'01', titulo:'Fundamentos de Ciberseguridad y SOC',
    descripcion:'Triada CIA, tipos de ataques, actores de amenaza y el rol del SOC',
    color:'#4f46e5', tag:'SOC Basics', xp:200, certificado:'Analista SOC — Fundamentos',
    lecciones:[
      { id:1, titulo:'Introducción a la Ciberseguridad', xp:35, teoria:`La ciberseguridad protege sistemas, redes y datos frente a ataques digitales.

TRIADA CIA — EL NÚCLEO DE TODA LA SEGURIDAD
- Confidencialidad — Solo los autorizados acceden a la información
- Integridad — La información no se altera sin autorización
- Disponibilidad — Los sistemas están accesibles cuando se necesitan

TIPOS DE ATAQUES MÁS COMUNES
- Malware — Software malicioso (virus, ransomware, trojan, spyware)
- Phishing — Suplantación de identidad para robar credenciales
- DDoS — Saturar un servicio con tráfico masivo hasta tumbarlo
- Man-in-the-Middle — Interceptar comunicaciones entre dos partes
- SQL Injection — Manipular consultas a bases de datos

ACTORES DE AMENAZA
- Script Kiddies — Sin conocimiento avanzado, usan herramientas ajenas
- Hacktivistas — Motivación ideológica o política
- Ciberdelincuentes — Motivación económica (ransomware, fraude)
- APT — Estados nación, ataques muy sofisticados y persistentes
- Insider Threat — Empleados maliciosos o negligentes`,
        preguntas:[
          {pregunta:'¿Qué significa la "I" en la triada CIA?',opciones:['Identidad','Integridad','Intrusión','Inteligencia'],correcta:1},
          {pregunta:'¿Qué tipo de ataque satura un servicio con tráfico masivo?',opciones:['Phishing','SQL Injection','DDoS','Ransomware'],correcta:2},
          {pregunta:'¿Qué es un APT?',opciones:['Un tipo de malware','Ataque avanzado y persistente, generalmente estatal','Una herramienta de defensa','Un protocolo de red'],correcta:1},
          {pregunta:'¿Cuál es la motivación principal de los ciberdelincuentes?',opciones:['Ideológica','Técnica','Económica','Social'],correcta:2},
        ]
      },
      { id:2, titulo:'Redes para SOC — Fundamentos críticos', xp:40, teoria:`Las redes son el campo de batalla del analista SOC. Debes dominarlas.

MODELO OSI — 7 CAPAS
- Física — Cables y señales
- Enlace — Direcciones MAC, switches
- Red — Direcciones IP, enrutamiento
- Transporte — TCP/UDP, puertos
- Sesión — Gestión de sesiones
- Presentación — Cifrado y formato
- Aplicación — HTTP, DNS, FTP, SMB

PROTOCOLOS CLAVE EN SOC
- HTTP/HTTPS (80/443) — Tráfico web
- DNS (53) — Resolución de nombres, muy abusado por atacantes
- SMB (445) — Compartir archivos Windows, objetivo frecuente
- RDP (3389) — Escritorio remoto, vector de ataque habitual
- SSH (22) — Acceso remoto seguro`,
        preguntas:[
          {pregunta:'¿En qué capa OSI opera el protocolo IP?',opciones:['Capa 2','Capa 3 — Red','Capa 4','Capa 7'],correcta:1},
          {pregunta:'¿Qué puerto usa SMB?',opciones:['80','443','445','3389'],correcta:2},
          {pregunta:'¿Cuál es la diferencia entre TCP y UDP?',opciones:['TCP es más rápido','UDP es fiable','TCP es fiable con confirmación, UDP es rápido sin ella','Son idénticos'],correcta:2},
          {pregunta:'El protocolo DNS opera en el puerto...',opciones:['80','443','53','22'],correcta:2},
        ]
      },
      { id:3, titulo:'Logs y Eventos — El lenguaje del SOC', xp:35, teoria:`Los logs son la evidencia de todo lo que ocurre en un sistema.

WINDOWS EVENT IDS CRÍTICOS
- 4624 — Inicio de sesión EXITOSO
- 4625 — Inicio de sesión FALLIDO (muchos = brute force)
- 4648 — Login con credenciales explícitas (sospechoso)
- 4688 — Proceso creado (detectar malware)
- 4698 — Tarea programada creada (persistencia)
- 4720 — Cuenta de usuario creada
- 7045 — Servicio instalado (puede ser malware)

¿QUÉ ES UN SIEM?
Security Information and Event Management — centraliza logs, correlaciona eventos y genera alertas. Ejemplos: Splunk, IBM QRadar, Microsoft Sentinel`,
        preguntas:[
          {pregunta:'¿Qué Event ID indica inicio de sesión fallido?',opciones:['4624','4625','4688','7045'],correcta:1},
          {pregunta:'¿Para qué sirve el Event ID 4688?',opciones:['Login exitoso','Proceso creado','Servicio instalado','Cuenta creada'],correcta:1},
          {pregunta:'¿Qué es un SIEM?',opciones:['Un firewall avanzado','Sistema que centraliza y correlaciona logs','Un antivirus','Un protocolo de red'],correcta:1},
        ]
      },
      { id:4, titulo:'El SOC — Roles, flujo y herramientas', xp:40, teoria:`El SOC es el centro neurálgico de la seguridad. Opera 24/7.

ROLES EN EL SOC
- L1 Triage — Monitoriza alertas, clasifica incidentes, escala
- L2 Investigación — Analiza incidentes en profundidad
- L3 Threat Hunting — Busca amenazas activamente
- SOC Manager — Coordina el equipo

HERRAMIENTAS CORE
- SIEM (Splunk, Sentinel) — Correlación de eventos
- EDR (CrowdStrike, SentinelOne) — Protección de endpoints
- SOAR — Automatización de respuestas
- Threat Intel Platforms — IOCs, CVEs, TTPs`,
        preguntas:[
          {pregunta:'¿Qué rol hace el triage inicial de alertas?',opciones:['L3','L2','L1','SOC Manager'],correcta:2},
          {pregunta:'¿Qué herramienta automatiza respuestas en un SOC?',opciones:['SIEM','EDR','SOAR','Firewall'],correcta:2},
          {pregunta:'CrowdStrike es un ejemplo de...',opciones:['SIEM','Firewall','EDR','SOAR'],correcta:2},
        ]
      },
      { id:5, titulo:'CASO PRÁCTICO — Primer incidente SOC', xp:50, esCaso:true, teoria:`CASO REAL: Detección de acceso no autorizado al Domain Controller

Son las 3:17 AM. El SIEM genera una alerta crítica:

ALERTA ACTIVA
- Source IP: 185.234.219.56 (Rusia)
- Target: CORP-DC01 (Domain Controller)
- Events: 847 x EventID 4625 en 4 minutos
- Seguido: 1 x EventID 4624 (login EXITOSO)
- Usuario comprometido: administrator

ANÁLISIS
- 847 intentos fallidos → Brute Force confirmado
- Login exitoso → Credenciales comprometidas
- Target = Domain Controller → CRÍTICO
- IP externa + hora 3 AM → No es usuario legítimo

RESPUESTA CORRECTA EN ORDEN
- AISLAR inmediatamente CORP-DC01
- RESETEAR credenciales del administrator
- REVISAR qué hizo el atacante tras el login
- ESCALAR a L2/L3 y notificar al CISO
- PRESERVAR logs para análisis forense`,
        preguntas:[
          {pregunta:'847 eventos ID 4625 + 1 ID 4624. ¿Qué tipo de ataque es?',opciones:['Phishing','Brute Force exitoso','DDoS','SQL Injection'],correcta:1},
          {pregunta:'¿Cuál es la PRIMERA acción que debes tomar?',opciones:['Enviar email al usuario','Aislar el Domain Controller de la red','Esperar al turno de mañana','Ignorar — puede ser falso positivo'],correcta:1},
          {pregunta:'¿Por qué un Domain Controller comprometido es crítico?',opciones:['Porque es caro','Controla toda la autenticación de la empresa','Porque tiene muchos logs','Es difícil de reinstalar'],correcta:1},
          {pregunta:'IP externa + hora 3:17 AM + DC. ¿Es sospechoso?',opciones:['No, los admins trabajan de noche','Sí — IP externa + hora inusual + DC = muy sospechoso','No hay suficiente información','Depende del país'],correcta:1},
        ]
      },
    ]
  },
  {
    id:2, num:'02', titulo:'Detección y Análisis de Amenazas',
    descripcion:'SIEM avanzado, MITRE ATT&CK, Threat Intelligence y análisis real',
    color:'#0891b2', tag:'Detection', xp:250, certificado:'Analista SOC — Detección',
    lecciones:[
      { id:1, titulo:'SIEM — El cerebro del SOC', xp:45, teoria:`El SIEM es la herramienta central del analista. Sin SIEM no hay SOC.

TIPOS DE ALERTAS
- True Positive (TP) — Alerta real, incidente confirmado
- False Positive (FP) — Alerta falsa, actividad legítima
- True Negative (TN) — Sin alerta y sin incidente
- False Negative (FN) — Sin alerta pero HAY incidente (peligroso)

QUERIES EN SPLUNK
index=windows EventID=4625 | stats count by src_ip
index=firewall action=blocked | top src_ip

CORRELACIÓN
+100 EventID 4625 en 5 min desde la misma IP = Brute Force`,
        preguntas:[
          {pregunta:'¿Qué es un False Negative en SIEM?',opciones:['Una alerta falsa','Incidente real sin alerta — el más peligroso','Una alerta correcta','Un log sin datos'],correcta:1},
          {pregunta:'True Positive significa...',opciones:['Falsa alarma','Alerta real con incidente confirmado','Sistema sin amenazas','Log sin anomalías'],correcta:1},
          {pregunta:'¿Qué hace el SIEM con logs de distintas fuentes?',opciones:['Los elimina','Los normaliza y correlaciona','Los cifra','Los ignora'],correcta:1},
        ]
      },
      { id:2, titulo:'MITRE ATT&CK Framework', xp:45, teoria:`MITRE ATT&CK es la biblia del analista SOC. Documenta tácticas y técnicas reales.

ESTRUCTURA
- Tácticas — El QUÉ quiere el atacante
- Técnicas — El CÓMO lo consigue
- Sub-técnicas — Variantes específicas

TÉCNICAS MÁS VISTAS EN SOC
- T1566 — Phishing (Initial Access)
- T1059 — Command and Scripting Interpreter (Execution)
- T1078 — Valid Accounts (Persistence)
- T1110 — Brute Force (Credential Access)
- T1021 — Remote Services (Lateral Movement)
- T1486 — Data Encrypted for Impact (Ransomware)`,
        preguntas:[
          {pregunta:'¿Qué táctica MITRE corresponde a T1566 (Phishing)?',opciones:['Execution','Initial Access','Lateral Movement','Persistence'],correcta:1},
          {pregunta:'T1110 Brute Force corresponde a la táctica...',opciones:['Initial Access','Defense Evasion','Credential Access','Collection'],correcta:2},
          {pregunta:'¿Para qué sirve MITRE ATT&CK?',opciones:['Gestionar firewalls','Documentar tácticas y técnicas reales de atacantes','Crear políticas de backup','Configurar SIEM'],correcta:1},
        ]
      },
      { id:3, titulo:'Threat Intelligence — IOCs y OSINT', xp:40, teoria:`La Threat Intelligence te permite conocer al enemigo antes de que ataque.

IOCS (INDICATORS OF COMPROMISE)
- IPs maliciosas — Servidores C2, Tor exit nodes
- Dominios — phishing.evil.com, dominios de C2
- Hashes de ficheros — MD5/SHA256 de malware conocido
- URLs — Links de phishing y exploits

HERRAMIENTAS OSINT ESENCIALES
- VirusTotal — Analizar hashes, IPs y dominios
- AbuseIPDB — Score de reputación de IPs
- Shodan — Dispositivos expuestos en internet
- MalwareBazaar — Base de datos de muestras
- URLscan.io — Análisis visual de URLs sospechosas`,
        preguntas:[
          {pregunta:'¿Qué es un IOC?',opciones:['Un tipo de malware','Indicador de Compromiso — evidencia de actividad maliciosa','Una herramienta SIEM','Un protocolo de red'],correcta:1},
          {pregunta:'Para verificar si una IP es maliciosa usarías...',opciones:['Google','AbuseIPDB o VirusTotal','Shodan únicamente','El SIEM directamente'],correcta:1},
          {pregunta:'¿Qué muestra Shodan?',opciones:['Malware conocido','Dispositivos y servicios expuestos en internet','Logs de Windows','URLs de phishing'],correcta:1},
        ]
      },
      { id:4, titulo:'CASO PRÁCTICO — Phishing con malware', xp:60, esCaso:true, teoria:`CASO REAL: Campaña de phishing con RAT

CRONOLOGÍA
- 09:23 — Usuario de RRHH reporta email sospechoso
- 09:31 — EDR: outlook.exe lanza cmd.exe (anómalo)
- 09:31 — Conexión saliente a 45.33.32.156:4444
- 09:45 — SIEM: mismo patrón en 3 máquinas más

EMAIL
- De: rrhh-nominas@empresa-corp.com (DOMINIO FALSO)
- Adjunto: nomina_revision.pdf.exe — MALWARE

ANÁLISIS
- outlook.exe → cmd.exe → macro ejecutada desde adjunto
- Puerto 4444 → típico de reverse shell C2
- 4 máquinas afectadas → movimiento lateral

TÉCNICAS MITRE
- T1566.001 — Spearphishing Attachment
- T1059.003 — Windows Command Shell
- T1071 — Application Layer Protocol C2`,
        preguntas:[
          {pregunta:'¿Qué indica que outlook.exe lance cmd.exe?',opciones:['Comportamiento normal de Outlook','Ejecución de macro maliciosa desde el email','Actualización del sistema','Error de configuración'],correcta:1},
          {pregunta:'¿Qué es una conexión al puerto 4444?',opciones:['Tráfico web normal','DNS lookup','Probable reverse shell hacia C2','Actualización de Windows'],correcta:2},
          {pregunta:'Con 4 máquinas afectadas, ¿qué táctica MITRE está ocurriendo?',opciones:['Initial Access','Exfiltration','Lateral Movement','Reconnaissance'],correcta:2},
          {pregunta:'¿Cuál debe ser la primera acción de contención?',opciones:['Avisar al usuario por email','Aislar las 4 máquinas afectadas de la red inmediatamente','Reinstalar Windows','Esperar más datos'],correcta:1},
        ]
      },
    ]
  },
  {
    id:3, num:'03', titulo:'Respuesta a Incidentes',
    descripcion:'Ciclo NIST, severidad, contención y caso completo de ransomware',
    color:'#ef4444', tag:'Incident Response', xp:280, certificado:'Analista SOC — Incident Response',
    lecciones:[
      { id:1, titulo:'Ciclo de Respuesta NIST SP 800-61', xp:40, teoria:`El NIST SP 800-61 es el estándar de referencia para respuesta a incidentes.

FASE 1 — PREPARACIÓN
- Políticas y procedimientos documentados
- Herramientas instaladas y configuradas
- Playbooks por tipo de incidente

FASE 2 — DETECCIÓN Y ANÁLISIS
- Identificar el incidente
- Clasificar severidad
- Documentar todo desde el inicio

FASE 3 — CONTENCIÓN
- Corto plazo: Aislar sistemas afectados
- CRÍTICO: Preservar evidencias antes de actuar

FASE 4 — ERRADICACIÓN
- Eliminar el malware y backdoors
- Parchear vulnerabilidades explotadas

FASE 5 — RECUPERACIÓN
- Restaurar desde backup limpio
- Monitorización intensiva post-restauración

FASE 6 — LECCIONES APRENDIDAS
- Post-mortem: ¿Qué falló?
- Actualizar playbooks`,
        preguntas:[
          {pregunta:'¿Cuál es la fase donde se elimina el malware?',opciones:['Contención','Recuperación','Erradicación','Preparación'],correcta:2},
          {pregunta:'¿Por qué preservar evidencias ANTES de contener?',opciones:['Por protocolo burocrático','Para análisis forense posterior','Porque no es urgente','Para informar a prensa'],correcta:1},
          {pregunta:'¿Qué viene ANTES de la Erradicación en NIST?',opciones:['Recuperación','Preparación','Lecciones Aprendidas','Contención'],correcta:3},
        ]
      },
      { id:2, titulo:'Clasificación y severidad de incidentes', xp:35, teoria:`Clasificar correctamente es una de las habilidades más críticas del analista L1.

NIVELES DE SEVERIDAD
- 🔴 CRÍTICO — Impacto inmediato. Ransomware activo, DC comprometido. Respuesta: <15 minutos
- 🟠 ALTO — Riesgo significativo. Malware detectado, cuentas privilegiadas. Respuesta: <1 hora
- 🟡 MEDIO — Impacto limitado. Malware en endpoint aislado. Respuesta: <4 horas
- 🟢 BAJO — Poco impacto. Escaneo de puertos bloqueado. Respuesta: <24 horas`,
        preguntas:[
          {pregunta:'Ransomware activo en 50 sistemas. ¿Qué severidad?',opciones:['Baja','Media','Alta','Crítica'],correcta:3},
          {pregunta:'¿Cuál es el tiempo máximo para un incidente CRÍTICO?',opciones:['24 horas','4 horas','1 hora','15 minutos'],correcta:3},
          {pregunta:'Un Domain Controller comprometido se clasifica como...',opciones:['Medio','Bajo','Crítico','Alto'],correcta:2},
        ]
      },
      { id:3, titulo:'CASO PRÁCTICO — Respuesta a Ransomware', xp:70, esCaso:true, teoria:`CASO REAL: Ataque de ransomware tipo WannaCry

CRONOLOGÍA
- 08:20 — Phishing ejecutado por usuario de contabilidad
- 08:22 — Descarga de payload desde 91.108.4.55
- 08:23 — Explota MS17-010 (EternalBlue) via SMB 445
- 08:25 — Propagación a 12 equipos de la red
- 08:47 — Primera alerta en SIEM (27 minutos después)

SEÑALES
- Archivos con extensión .encrypted
- EDR: svchost_update.exe cifrando archivos masivamente
- EventID 7045 en 12 equipos (servicio malicioso)
- Tráfico SMB masivo interno en puerto 445`,
        preguntas:[
          {pregunta:'Se propaga via SMB 445. ¿Qué contención es más urgente?',opciones:['Apagar todos los servidores','Segmentar red y bloquear tráfico SMB interno','Formatear un equipo','Llamar al fabricante del antivirus'],correcta:1},
          {pregunta:'27 minutos entre phishing y primera alerta. ¿Qué problema revela?',opciones:['El SIEM funciona perfectamente','Gap de detección — el EDR no detectó el payload inicial','Es un tiempo excelente','Los usuarios deben reportar más rápido'],correcta:1},
          {pregunta:'¿Por qué NO apagar inmediatamente los equipos cifrados?',opciones:['Porque tardan en encender','Pueden contener evidencias forenses en RAM','Pueden seguir trabajando','Por política de empresa'],correcta:1},
        ]
      },
    ]
  },
  {
    id:4, num:'04', titulo:'Threat Hunting',
    descripcion:'Búsqueda proactiva de amenazas que evaden las defensas automatizadas',
    color:'#7c3aed', tag:'Threat Hunting', xp:260, certificado:'Threat Hunter Certificado',
    lecciones:[
      { id:1, titulo:'¿Qué es el Threat Hunting?', xp:40, teoria:`El Threat Hunting es la búsqueda proactiva de amenazas que han evadido las defensas.

DETECCIÓN REACTIVA VS HUNTING
- Reactiva — Esperas a que el SIEM o EDR genere una alerta
- Hunting — Buscas activamente sin esperar alertas

¿POR QUÉ ES NECESARIO?
Los APT pueden permanecer meses sin generar alertas. Dwell time medio: 24 días.

PROCESO
- HIPÓTESIS — Creo que hay un atacante usando PowerShell lateralmente
- INVESTIGACIÓN — Busco en logs PowerShell ejecutándose inusualmente
- ANÁLISIS — Evalúo los resultados
- RESPUESTA — Si encuentro algo, inicio proceso de IR
- MEJORA — Si no encuentro nada, mejoro detecciones del SIEM`,
        preguntas:[
          {pregunta:'¿Cuál es la diferencia clave entre detección reactiva y hunting?',opciones:['No hay diferencia','Detección reactiva espera alertas; hunting busca activamente','Hunting es más lento','La detección reactiva es más efectiva'],correcta:1},
          {pregunta:'¿Cuánto tiempo puede pasar un APT sin detectarse (dwell time)?',opciones:['1 hora','1 día','24 días','1 año'],correcta:2},
          {pregunta:'El primer paso del proceso de hunting es...',opciones:['Analizar logs','Formular una hipótesis','Instalar herramientas','Escalar al CISO'],correcta:1},
        ]
      },
      { id:2, titulo:'CASO PRÁCTICO — Hunting de cuenta comprometida', xp:60, esCaso:true, teoria:`CASO HUNTING: Detectar cuenta administrativa comprometida

HIPÓTESIS: Atacante usa credenciales válidas para moverse lateralmente de noche.

QUERY SIEM
index=windows EventID=4624 LogonType=3
| where hour<6 OR hour>22
| stats count by user, src_ip, dest
| where count > 3

RESULTADOS SOSPECHOSOS
- Usuario: svc_backup (cuenta de servicio)
- Horario: 02:14 a 04:37 AM
- IPs origen: 5 IPs internas diferentes
- Destinos: file-server-01, dc-01, hr-server
- Total logins: 47 en 2 horas

CONCLUSIÓN: Cuenta de servicio comprometida para reconocimiento y movimiento lateral.`,
        preguntas:[
          {pregunta:'svc_backup hace 47 logins interactivos de noche. ¿Es normal?',opciones:['Sí, las cuentas de servicio trabajan de noche','No, las cuentas de servicio nunca deben hacer logins interactivos','Depende de la empresa','Sí si hay backups programados'],correcta:1},
          {pregunta:'¿Qué indica el acceso a DC + HR server desde cuenta de backup?',opciones:['Backup normal','Reconocimiento y probable exfiltración de datos sensibles','Mantenimiento programado','Error de configuración'],correcta:1},
          {pregunta:'Esta actividad no generó alertas automáticas porque...',opciones:['El SIEM está roto','Usa credenciales válidas — living-off-the-land','Los logs se perdieron','El firewall la bloqueó'],correcta:1},
        ]
      },
    ]
  },
  {
    id:5, num:'05', titulo:'Forense Digital',
    descripcion:'Adquisición de evidencias, análisis de disco, memoria RAM y timeline',
    color:'#059669', tag:'Forensics', xp:290, certificado:'Analista Forense Digital',
    lecciones:[
      { id:1, titulo:'Fundamentos del Forense Digital', xp:45, teoria:`El forense digital investiga qué pasó, cómo pasó y quién lo hizo.

PRINCIPIOS FUNDAMENTALES
- Preservación — Nunca alterar la evidencia original
- Cadena de custodia — Documentar quién maneja qué y cuándo
- Integridad — Verificar con hashes (MD5/SHA256)
- Reproducibilidad — El análisis debe poder repetirse

ORDEN DE VOLATILIDAD
- Memoria RAM → Tráfico de red activo → Disco duro → Logs

ARTEFACTOS CLAVE EN WINDOWS
- Prefetch — Programas ejecutados recientemente
- Registry — Configuración del sistema y autorun
- Event Logs — Historial de actividad

ARTEFACTOS CLAVE EN LINUX
- /var/log/auth.log — Autenticaciones SSH y sudo
- bash_history — Comandos ejecutados por el usuario
- /proc/ — Estado actual de procesos
- crontab — Tareas programadas (persistencia)`,
        preguntas:[
          {pregunta:'¿Por qué recopilar la RAM antes que el disco duro?',opciones:['El disco es más grande','La RAM es volátil — se pierde al apagar','La RAM es más fácil de analizar','Por protocolo estándar'],correcta:1},
          {pregunta:'¿Para qué se usan los hashes en forense?',opciones:['Para cifrar evidencias','Para verificar que la evidencia no ha sido alterada','Para comprimir archivos','Para acelerar el análisis'],correcta:1},
          {pregunta:'La cadena de custodia sirve para...',opciones:['Organizar archivos','Documentar quién maneja las evidencias y cuándo','Cifrar datos sensibles','Crear backups'],correcta:1},
        ]
      },
    ]
  },
  {
    id:6, num:'06', titulo:'Cloud Security',
    descripcion:'AWS/Azure, logs cloud, IAM y detección en entornos cloud',
    color:'#0284c7', tag:'Cloud', xp:300, certificado:'Cloud Security Analyst',
    lecciones:[
      { id:1, titulo:'Fundamentos de seguridad cloud', xp:50, teoria:`El cloud ha transformado el SOC. Los ataques y defensas son diferentes.

MODELO DE RESPONSABILIDAD COMPARTIDA
- Cloud Provider — Seguridad DE la infraestructura física
- Cliente — Seguridad EN la infraestructura (datos, configs, accesos)

LOGS ESENCIALES EN AWS
- CloudTrail — Registra todas las llamadas a la API
- VPC Flow Logs — Todo el tráfico de red
- GuardDuty — Detección automática de amenazas

ATAQUES CLOUD MÁS FRECUENTES
- Credential stuffing — Robo de credenciales de consola
- Misconfigured S3 buckets — Datos públicos por error
- IAM privilege escalation — Escalar permisos via roles
- Cryptojacking — Usar recursos comprometidos para minar`,
        preguntas:[
          {pregunta:'¿Qué servicio AWS registra todas las llamadas a la API?',opciones:['VPC Flow Logs','CloudTrail','S3','EC2'],correcta:1},
          {pregunta:'¿Qué es el cryptojacking en cloud?',opciones:['Robo de criptomonedas','Usar recursos comprometidos para minar','Ataque DDoS','Phishing en cloud'],correcta:1},
          {pregunta:'Un bucket S3 público con datos de clientes. ¿Qué fallo es?',opciones:['Fallo del proveedor','Misconfiguration — responsabilidad del cliente','Ataque de hackers','Error de red'],correcta:1},
        ]
      },
    ]
  },
  {
    id:7, num:'07', titulo:'Automatización SOC con Python',
    descripcion:'Python para analistas, scripting de tareas repetitivas y SOAR',
    color:'#d97706', tag:'Automation', xp:280, certificado:'SOC Automation Specialist',
    lecciones:[
      { id:1, titulo:'Python para analistas SOC', xp:50, teoria:`Python es la herramienta de automatización del analista moderno.

CASOS DE USO REALES
- Parsear y analizar miles de logs automáticamente
- Buscar IOCs en VirusTotal y AbuseIPDB
- Generar reportes de incidentes
- Enriquecer alertas del SIEM con Threat Intelligence

SCRIPT — VERIFICAR REPUTACIÓN DE IPS
import requests
def check_ip(ip):
    url = "https://api.abuseipdb.com/api/v2/check"
    headers = {"Key": "API_KEY"}
    r = requests.get(url, headers=headers, params={"ipAddress": ip})
    return r.json()["data"]["abuseConfidenceScore"]

for ip in ips_from_siem:
    score = check_ip(ip)
    if score > 50:
        print(f"ALERTA IP maliciosa: {ip} — Score: {score}")`,
        preguntas:[
          {pregunta:'¿Para qué usarías Python en un SOC?',opciones:['Crear apps web','Automatizar análisis de logs, IOC lookup y reportes','Diseñar interfaces','Gestionar SQL'],correcta:1},
          {pregunta:'¿Qué permite la API de AbuseIPDB?',opciones:['Bloquear IPs','Consultar reputación y score de abuso de una IP','Escanear puertos','Ver logs Windows'],correcta:1},
          {pregunta:'SOAR significa...',opciones:['Security Orchestration Automation and Response','System Operations and Reporting','Security Online Alert Response','Standard Operations Automation Rule'],correcta:0},
        ]
      },
    ]
  },
  {
    id:8, num:'08', titulo:'Análisis de Malware',
    descripcion:'Análisis estático y dinámico, sandbox y comportamiento',
    color:'#dc2626', tag:'Malware', xp:290, certificado:'Malware Analyst',
    lecciones:[
      { id:1, titulo:'Análisis estático vs dinámico', xp:55, teoria:`El análisis de malware determina exactamente qué hace un archivo malicioso.

ANÁLISIS ESTÁTICO — SIN EJECUTAR
- Calcular hash SHA256 y buscar en VirusTotal
- Strings — Extraer texto legible: URLs, IPs
- PE Headers — Metadatos del ejecutable Windows
- Imports — Funciones de Windows que usa el malware

FUNCIONES SOSPECHOSAS
- 🔴 CreateRemoteThread — Inyección de código
- 🔴 VirtualAllocEx — Reserva memoria en proceso ajeno
- 🔴 WriteProcessMemory — Escribe código en proceso ajeno
- 🔴 RegSetValueEx — Modifica registro (persistencia)

ANÁLISIS DINÁMICO — EN SANDBOX
- Any.run, Cuckoo Sandbox, Joe Sandbox
- Se observa comportamiento real en tiempo de ejecución`,
        preguntas:[
          {pregunta:'¿Qué es el análisis estático de malware?',opciones:['Ejecutar el malware en entorno controlado','Analizar el archivo sin ejecutarlo','Analizar tráfico de red','Estudiar el código fuente'],correcta:1},
          {pregunta:'"CreateRemoteThread" indica...',opciones:['Creación de hilos normales','Posible inyección de código en otro proceso','Conexión a internet','Creación de archivos'],correcta:1},
          {pregunta:'¿Qué herramienta usarías para análisis dinámico?',opciones:['VirusTotal solo','Sandbox (Any.run, Cuckoo)','Wireshark','Splunk'],correcta:1},
        ]
      },
    ]
  },
  {
    id:9, num:'09', titulo:'Certificación Final SOC',
    descripcion:'Simulación completa: 10 alertas simultáneas, tiempo limitado',
    color:'#0f172a', tag:'Final Exam', xp:500, certificado:'SOC Analyst Profesional — Certificado',
    lecciones:[
      { id:1, titulo:'Simulacro Final — Gestión de incidente múltiple', xp:500, esCaso:true, teoria:`SIMULACRO FINAL: Son las 23:47. Eres el analista de guardia. Se disparan 10 alertas.

ALERTAS ACTIVAS
- 1. CRÍTICA — 1847 EventID 4625 hacia CORP-DC01 desde 185.220.101.45
- 2. CRÍTICA — EDR: svchost.exe lanza powershell -enc base64
- 3. ALTA — DNS: 847 queries a random-xyz.evil en 3 minutos
- 4. ALTA — Nuevo usuario admin creado: backup_svc
- 5. MEDIA — 50 instancias EC2 lanzadas en AWS a las 23:45
- 6. MEDIA — RDP desde IP de Tor hacia servidor de contabilidad
- 7. BAJA — Escaneo de puertos desde 10.0.0.45 (interno)
- 8. BAJA — 3 intentos fallidos VPN usuario jgarcia
- 9. INFO — Antivirus actualizado en 200 equipos
- 10. INFO — Certificado SSL caducado en web corporativa`,
        preguntas:[
          {pregunta:'¿Cuál es la PRIMERA alerta que debes investigar?',opciones:['Certificado SSL caducado','Antivirus actualizado','1847 logins fallidos en el Domain Controller','3 intentos fallidos VPN'],correcta:2},
          {pregunta:'Alertas 1 + 2 + 4 juntas probablemente son...',opciones:['Tres incidentes independientes','Un único ataque coordinado en progreso','Falsos positivos','Pruebas del equipo dev'],correcta:1},
          {pregunta:'Alerta 9: antivirus actualizado en 200 equipos. ¿Qué haces?',opciones:['Investigar urgentemente','Escalar al CISO','Cerrar como informativa — actividad legítima','Aislar los 200 equipos'],correcta:2},
          {pregunta:'Alertas 3 (DNS tunneling) + 5 (50 EC2 en AWS) indican...',opciones:['Mantenimiento normal','Exfiltración + cryptojacking — atacante con acceso a red y cloud','Actualizaciones programadas','Pruebas de carga'],correcta:1},
          {pregunta:'Primera acción con alerta 2 (powershell -enc base64)...',opciones:['Ignorar — PowerShell es normal','Decodificar Base64, aislar equipo e investigar proceso padre','Reiniciar el equipo','Actualizar el antivirus'],correcta:1},
        ]
      },
    ]
  },
];

const CURSOS = [
  { id:1, titulo:'SOC Fundamentals', subtitulo:'De cero a analista L1', color:'#4f46e5', moduloIds:[1,2,3], nivel:'Principiante', duracion:'~8h', xp:730 },
  { id:2, titulo:'Detection & Analysis', subtitulo:'Analista L2', color:'#0891b2', moduloIds:[4,5,6], nivel:'Intermedio', duracion:'~10h', xp:850 },
  { id:3, titulo:'Advanced SOC', subtitulo:'Nivel profesional L2/L3', color:'#dc2626', moduloIds:[7,8,9], nivel:'Avanzado', duracion:'~12h', xp:1070 },
];

const PLATAFORMAS = [
  {
    nombre:'TryHackMe', url:'https://tryhackme.com', afiliado:'https://tryhackme.com/signup?referrer=socblast',
    bg:'#1a2332', accent:'#88cc14', initials:'THM',
    desc:'La mejor plataforma para empezar. Rutas guiadas, laboratorios SOC y máquinas virtuales en el navegador.',
    tipo:'Gratis / $14 mes', nivel:'Principiante — Intermedio',
    rutas:['SOC Level 1','SOC Level 2','Cyber Defense','Jr Penetration Tester'],
    recomendado:true,
  },
  {
    nombre:'HackTheBox', url:'https://hackthebox.com', afiliado:'https://referral.hackthebox.com/mzwHqjM',
    bg:'#111827', accent:'#9fef00', initials:'HTB',
    desc:'Plataforma élite para analistas avanzados. SOC Analyst path, Sherlocks (forense) y máquinas reales.',
    tipo:'Gratis / $14 mes', nivel:'Intermedio — Avanzado',
    rutas:['SOC Analyst','Defensive Security','Sherlocks','Blue Team Labs'],
    recomendado:true,
  },
  {
    nombre:'Blue Team Labs', url:'https://blueteamlabs.online', afiliado:'https://blueteamlabs.online',
    bg:'#0d1b2e', accent:'#3b82f6', initials:'BTL',
    desc:'100% blue team. Investigaciones forenses reales, análisis de malware y respuesta a incidentes.',
    tipo:'Gratis / $15 mes', nivel:'Todos los niveles',
    rutas:['Incident Response','Threat Intelligence','Digital Forensics','Reverse Engineering'],
    recomendado:false,
  },
  {
    nombre:'CyberDefenders', url:'https://cyberdefenders.org', afiliado:'https://cyberdefenders.org',
    bg:'#0a0f1e', accent:'#06b6d4', initials:'CD',
    desc:'Laboratorios Blue Team con escenarios reales. PCAP, SIEM, forense y análisis de endpoints.',
    tipo:'Gratis / $10 mes', nivel:'Intermedio — Avanzado',
    rutas:['Threat Hunting','Malware Analysis','Network Forensics','Endpoint Forensics'],
    recomendado:false,
  },
  {
    nombre:'LetsDefend', url:'https://letsdefend.io', afiliado:'https://letsdefend.io',
    bg:'#0f172a', accent:'#6366f1', initials:'LD',
    desc:'Simulador de SOC interactivo. Gestiona alertas reales como si trabajaras en un SOC de empresa.',
    tipo:'Gratis / $25 mes', nivel:'Todos los niveles',
    rutas:['SOC Analyst','Incident Responder','Malware Analysis','Threat Intelligence'],
    recomendado:false,
  },
  {
    nombre:'SANS Institute', url:'https://sans.org', afiliado:'https://sans.org',
    bg:'#1a0a0a', accent:'#ef4444', initials:'SANS',
    desc:'El estándar de oro en formación de ciberseguridad. Certificaciones GIAC reconocidas por Fortune 500.',
    tipo:'$4.000 — $8.000 curso', nivel:'Todos los niveles',
    rutas:['SEC504 GCIH','FOR508 GCFE','SEC555 GCED','FOR610 GREM'],
    recomendado:false,
  },
];

const CERTS = [
  { nombre:'CompTIA Security+', org:'CompTIA', nivel:'Entry', color:'#ef4444', precio:'~$399', tiempo:'3-6 meses', desc:'La certificación de entrada más reconocida en el sector. Requerida por el DoD y miles de empresas.', credly:true, url:'https://comptia.org/certifications/security' },
  { nombre:'CompTIA CySA+', org:'CompTIA', nivel:'Intermedio', color:'#f97316', precio:'~$399', tiempo:'6-9 meses', desc:'Cybersecurity Analyst. Diseñada específicamente para analistas SOC. Muy valorada en Europa y USA.', credly:true, url:'https://comptia.org/certifications/cybersecurity-analyst' },
  { nombre:'BTL1', org:'Security Blue Team', nivel:'Intermedio', color:'#3b82f6', precio:'~$499', tiempo:'3-6 meses', desc:'Blue Team Level 1. Certificación práctica 100% blue team. La más valorada en SOCs europeos.', credly:true, url:'https://securityblue.team/btl1' },
  { nombre:'SC-200', org:'Microsoft', nivel:'Intermedio', color:'#0078d4', precio:'~$165', tiempo:'2-4 meses', desc:'Microsoft Security Operations Analyst. Especialización en Sentinel, Defender y el ecosistema Azure.', credly:true, url:'https://learn.microsoft.com/certifications/security-operations-analyst' },
  { nombre:'eJPT', org:'eLearnSecurity', nivel:'Entry', color:'#8b5cf6', precio:'~$200', tiempo:'2-3 meses', desc:'Junior Penetration Tester. Ideal para entender el lado ofensivo y mejorar la detección defensiva.', credly:false, url:'https://elearnsecurity.com/product/ejpt-certification' },
  { nombre:'OSCP', org:'Offensive Security', nivel:'Avanzado', color:'#111827', precio:'~$1499', tiempo:'12-18 meses', desc:'El estándar de oro en pentesting. Examen práctico de 24h. Para analistas senior L3+.', credly:false, url:'https://www.offsec.com/courses/pen-200' },
];

// ─── TEORÍA RENDERER ──────────────────────────────────────────────────────────
function TeoriaRender({ texto, color }) {
  const lineas = texto.split('\n');
  const bloques = []; let parrafo = [];
  const flushP = () => { if (parrafo.length) { bloques.push({t:'p', v:parrafo.join(' ')}); parrafo = []; } };
  for (const raw of lineas) {
    const l = raw.trim(); if (!l) { flushP(); continue; }
    if (l === l.toUpperCase() && l.length > 4 && l.length < 80 && /[A-ZÁÉÍÓÚ]/.test(l) && !l.startsWith('-') && !l.match(/^[🔴🟠🟡🟢]/u)) { flushP(); bloques.push({t:'h', v:l}); continue; }
    if (/^[-•]\s/.test(l) || l.match(/^[🔴🟠🟡🟢]/u)) { flushP(); bloques.push({t:'li', v:l.replace(/^[-•]\s*/,'')}); continue; }
    if (/^(import |def |for |with |index=|\w+ = )/.test(l)) { flushP(); bloques.push({t:'code', v:l}); continue; }
    parrafo.push(l);
  }
  flushP();
  const grouped = []; let liG = null, cG = null;
  for (const b of bloques) {
    if (b.t==='li') { if (!liG) { liG={t:'lista',items:[]}; grouped.push(liG); } liG.items.push(b.v); cG=null; }
    else if (b.t==='code') { if (!cG) { cG={t:'codigo',lines:[]}; grouped.push(cG); } cG.lines.push(b.v); liG=null; }
    else { liG=null; cG=null; grouped.push(b); }
  }
  return (
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      {grouped.map((b,i) => {
        if (b.t==='p') return <p key={i} style={{fontSize:14,color:'#374151',lineHeight:1.9,margin:0}}>{b.v}</p>;
        if (b.t==='h') return (
          <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 14px',borderRadius:8,background:`${color}08`,borderLeft:`3px solid ${color}`,marginTop:6}}>
            <span style={{fontSize:11,fontWeight:700,color,letterSpacing:'1.5px',textTransform:'uppercase'}}>{b.v}</span>
          </div>
        );
        if (b.t==='lista') return (
          <div key={i} style={{display:'flex',flexDirection:'column',gap:5,paddingLeft:4}}>
            {b.items.map((item,j) => {
              const isAlert = item.match(/^[🔴🟠🟡🟢]/u);
              const ac = item.startsWith('🔴')?'#ef4444':item.startsWith('🟢')?'#059669':item.startsWith('🟠')?'#f97316':item.startsWith('🟡')?'#d97706':'#374151';
              return (
                <div key={j} style={{display:'flex',alignItems:'flex-start',gap:10,padding:isAlert?'8px 12px':'4px 0',borderRadius:isAlert?8:0,background:isAlert?`${ac}06`:undefined,border:isAlert?`1px solid ${ac}18`:undefined}}>
                  {!isAlert&&<div style={{width:4,height:4,borderRadius:'50%',background:color,marginTop:10,flexShrink:0}}/>}
                  <span style={{fontSize:13,color:ac,lineHeight:1.7}}>{item}</span>
                </div>
              );
            })}
          </div>
        );
        if (b.t==='codigo') return (
          <div key={i} style={{borderRadius:10,background:'#0f172a',border:'1px solid #1e293b',overflow:'hidden',marginTop:4}}>
            <div style={{padding:'7px 14px',background:'#0a0f1a',borderBottom:'1px solid #1e293b',display:'flex',gap:5,alignItems:'center'}}>
              {['#ef4444','#f59e0b','#22c55e'].map((c,k)=><div key={k} style={{width:9,height:9,borderRadius:'50%',background:c+'aa'}}/>)}
              <span style={{fontSize:10,color:'#475569',fontFamily:'monospace',marginLeft:6}}>terminal</span>
            </div>
            <pre style={{padding:'14px 16px',margin:0,fontSize:12,color:'#7dd3fc',fontFamily:"'JetBrains Mono','Fira Code',Consolas,monospace",lineHeight:1.8,overflowX:'auto'}}>{b.lines.join('\n')}</pre>
          </div>
        );
        return null;
      })}
    </div>
  );
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',sans-serif;}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.5;}}
  .ani{animation:fadeIn .25s ease forwards;}
  ::-webkit-scrollbar{width:4px;height:4px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:4px;}
  a{text-decoration:none;}
  button{font-family:inherit;cursor:pointer;}
  .tab-btn{transition:all .15s;white-space:nowrap;}
  .tab-btn:hover{color:#111827!important;}
  .mod-card{transition:all .2s;cursor:pointer;}
  .mod-card:hover{box-shadow:0 8px 24px rgba(0,0,0,.08)!important;transform:translateY(-1px);}
  .plat-card{transition:all .22s;cursor:pointer;}
  .plat-card:hover{transform:translateY(-3px);box-shadow:0 12px 36px rgba(0,0,0,.25)!important;}
  .cert-card{transition:all .2s;cursor:pointer;}
  .cert-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.1)!important;}
  .lec-row{transition:background .12s;cursor:pointer;}
  .lec-row:hover{background:#f0f9ff!important;}
  .opt-btn{transition:all .12s;}
  .opt-btn:hover{background:#f0f9ff!important;border-color:#bfdbfe!important;}
`;

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
export default function TrainingPage() {
  const navigate    = useNavigate();
  const { user }    = useAuth();
  const avatarConfig = user?.avatar_config || null;
  const foto         = user?.foto_perfil   || '';

  const [tab,     setTab]   = useState('cursos');
  const [cursoAc, setCurso] = useState(null);
  const [modAc,   setMod]   = useState(null);
  const [lecAc,   setLec]   = useState(null);
  const [fase,    setFase]  = useState('teoria');
  const [resp,    setResp]  = useState({});
  const [enviado, setEnv]   = useState(false);
  const [certModal, setCertModal] = useState(null);

  const [completadas, setComp] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sb_train_v3') || '[]'); } catch { return []; }
  });
  const [certificados, setCerts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sb_certs_v3') || '[]'); } catch { return []; }
  });

  const save = (c, ce) => {
    setComp(c);   localStorage.setItem('sb_train_v3', JSON.stringify(c));
    setCerts(ce); localStorage.setItem('sb_certs_v3', JSON.stringify(ce));
  };

  const lComp  = m => m.lecciones.filter(l => completadas.includes(`${m.id}-${l.id}`)).length;
  const mDone  = m => m.lecciones.length > 0 && lComp(m) === m.lecciones.length;
  const cPct   = c => { const ms = c.moduloIds.map(id => MODULOS.find(m => m.id===id)); const t=ms.reduce((a,m)=>a+m.lecciones.length,0); const h=ms.reduce((a,m)=>a+lComp(m),0); return t>0?Math.round((h/t)*100):0; };
  const unlock = c => c.id===1 || CURSOS[c.id-2].moduloIds.every(id => mDone(MODULOS.find(m => m.id===id)));
  const totalLec = MODULOS.reduce((a,m) => a+m.lecciones.length, 0);

  const iniciar = lec => { setLec(lec); setFase('teoria'); setResp({}); setEnv(false); };

  const nota = () => {
    const ps = lecAc?.preguntas||[]; if(!ps.length) return 100;
    let c=0; ps.forEach((p,i)=>{ if(resp[i]===p.correcta) c++; });
    return Math.round((c/ps.length)*100);
  };

  const completar = () => {
    const key    = `${modAc.id}-${lecAc.id}`;
    const nuevas = completadas.includes(key) ? completadas : [...completadas, key];
    const todas  = modAc.lecciones.map(l => `${modAc.id}-${l.id}`);
    let nc = [...certificados];
    if (todas.every(k=>nuevas.includes(k)) && !nc.find(c=>c.moduloId===modAc.id)) {
      const cert = { moduloId:modAc.id, titulo:modAc.certificado, fecha:new Date().toLocaleDateString('es-ES'), color:modAc.color };
      nc = [...nc, cert]; save(nuevas, nc); setCertModal(cert);
    } else { save(nuevas, nc); setLec(null); }
  };

  // ── CERT MODAL ──────────────────────────────────────────────────────────────
  if (certModal) return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.55)',zIndex:9000,display:'flex',alignItems:'center',justifyContent:'center',padding:24,backdropFilter:'blur(8px)'}}>
      <style>{CSS}</style>
      <div style={{maxWidth:420,width:'100%',background:'#fff',borderRadius:20,padding:'48px 40px',textAlign:'center',boxShadow:'0 32px 80px rgba(0,0,0,.2)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:0,left:0,right:0,height:4,background:`linear-gradient(90deg,${certModal.color},${certModal.color}99)`}}/>
        <div style={{width:72,height:72,borderRadius:'50%',background:`${certModal.color}10`,border:`1.5px solid ${certModal.color}25`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',fontSize:32}}>🏅</div>
        <p style={{fontSize:11,fontWeight:700,color:'#9ca3af',letterSpacing:'3px',marginBottom:14,textTransform:'uppercase'}}>Certificado de Completación</p>
        <h2 style={{fontSize:21,fontWeight:800,color:'#111827',marginBottom:8,lineHeight:1.3}}>{certModal.titulo}</h2>
        <p style={{fontSize:12,color:'#9ca3af',fontFamily:'monospace',marginBottom:32}}>SocBlast · {certModal.fecha}</p>
        <div style={{display:'flex',gap:10}}>
          <button onClick={()=>{setCertModal(null);setLec(null);}} style={{flex:1,padding:'13px 0',borderRadius:10,background:'#111827',border:'none',color:'#fff',fontWeight:700,fontSize:14}}>Continuar</button>
          <button onClick={()=>{setCertModal(null);navigate('/perfil');}} style={{flex:1,padding:'13px 0',borderRadius:10,background:'#f9fafb',border:'1px solid #e5e7eb',color:'#374151',fontWeight:600,fontSize:14}}>Ver en perfil</button>
        </div>
      </div>
    </div>
  );

  // ── LECCIÓN ─────────────────────────────────────────────────────────────────
  if (lecAc && modAc) {
    const ps   = lecAc.preguntas||[];
    const n    = nota();
    const mc   = modAc.color;
    return (
      <div style={{minHeight:'100vh',background:'#f9fafb',fontFamily:'inherit'}}>
        <style>{CSS}</style>
        <div style={{position:'sticky',top:0,zIndex:50,height:56,background:'#fff',borderBottom:'1px solid #e5e7eb',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 32px',boxShadow:'0 1px 3px rgba(0,0,0,.06)'}}>
          <button onClick={()=>setLec(null)} style={{display:'flex',alignItems:'center',gap:7,background:'none',border:'1px solid #e5e7eb',color:'#6b7280',padding:'6px 14px',borderRadius:8,fontSize:13,fontWeight:500}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Volver
          </button>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:mc}}/>
            <span style={{fontSize:14,fontWeight:600,color:'#111827',maxWidth:440,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{lecAc.titulo}</span>
            {lecAc.esCaso&&<span style={{fontSize:11,padding:'2px 10px',borderRadius:100,background:'#fef3c7',color:'#92400e',fontWeight:700,border:'1px solid #fde68a'}}>Caso práctico</span>}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:12,fontWeight:700,color:'#059669',padding:'4px 12px',borderRadius:8,background:'#ecfdf5',border:'1px solid #a7f3d0'}}>+{lecAc.xp} XP</span>
          </div>
        </div>

        <div style={{maxWidth:720,margin:'0 auto',padding:'36px 24px 80px'}}>
          <div style={{display:'flex',gap:2,marginBottom:32,background:'#f3f4f6',borderRadius:10,padding:4}}>
            {['teoria','practica'].map(f=>(
              <button key={f} onClick={()=>f==='teoria'&&setFase('teoria')}
                style={{flex:1,padding:'9px 0',borderRadius:7,fontSize:12,fontWeight:700,letterSpacing:'1.2px',border:'none',background:fase===f?'#fff':undefined,color:fase===f?'#111827':'#9ca3af',boxShadow:fase===f?'0 1px 4px rgba(0,0,0,.1)':undefined,transition:'all .15s'}}>
                {f==='teoria'?'TEORÍA':lecAc.esCaso?'CASO PRÁCTICO':'TEST'}
              </button>
            ))}
          </div>

          {fase==='teoria'&&(
            <div className="ani">
              <h2 style={{fontSize:22,fontWeight:800,color:'#111827',marginBottom:24,letterSpacing:'-.4px'}}>{lecAc.titulo}</h2>
              <div style={{marginBottom:32}}><TeoriaRender texto={lecAc.teoria} color={mc}/></div>
              <button onClick={()=>setFase('practica')}
                style={{width:'100%',padding:'14px 0',borderRadius:10,background:mc,border:'none',color:'#fff',fontWeight:700,fontSize:15,boxShadow:`0 4px 14px ${mc}40`}}>
                {lecAc.esCaso?'Ir al Caso Práctico →':'Ir al Test →'}
              </button>
            </div>
          )}

          {fase==='practica'&&(
            <div className="ani">
              <div style={{padding:'12px 16px',borderRadius:10,background:lecAc.esCaso?'#fffbeb':'#eff6ff',border:`1px solid ${lecAc.esCaso?'#fde68a':'#bfdbfe'}`,marginBottom:24,display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:16}}>{lecAc.esCaso?'⚡':'📝'}</span>
                <div>
                  <p style={{fontSize:12,fontWeight:700,color:'#111827',letterSpacing:'.5px'}}>{lecAc.esCaso?'CASO PRÁCTICO — TOMA DE DECISIONES':'TEST DE CONOCIMIENTOS'}</p>
                  <p style={{fontSize:11,color:'#6b7280',marginTop:2}}>{ps.length} preguntas · Mínimo 60% para superar</p>
                </div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:14,marginBottom:20}}>
                {ps.map((p,i)=>(
                  <div key={i} style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,.05)'}}>
                    {lecAc.esCaso&&<div style={{height:2,background:'linear-gradient(90deg,#f59e0b,transparent)'}}/>}
                    <div style={{padding:'20px'}}>
                      <div style={{display:'flex',gap:10,alignItems:'flex-start',marginBottom:14}}>
                        <div style={{width:26,height:26,borderRadius:7,background:`${mc}10`,border:`1px solid ${mc}20`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          <span style={{fontSize:11,fontWeight:700,color:mc}}>{i+1}</span>
                        </div>
                        <p style={{fontSize:14,color:'#111827',fontWeight:500,lineHeight:1.65}}>{p.pregunta}</p>
                      </div>
                      <div style={{display:'flex',flexDirection:'column',gap:7}}>
                        {p.opciones.map((op,j)=>{
                          let bg='#f9fafb', border='#e5e7eb', color='#374151';
                          if (enviado) {
                            if (j===p.correcta)          { bg='#f0fdf4'; border='#86efac'; color='#15803d'; }
                            else if (resp[i]===j)         { bg='#fef2f2'; border='#fca5a5'; color='#dc2626'; }
                          } else if (resp[i]===j)         { bg=`${mc}08`; border=`${mc}50`; color=mc; }
                          return (
                            <button key={j} className="opt-btn" onClick={()=>!enviado&&setResp(r=>({...r,[i]:j}))}
                              style={{padding:'11px 14px',borderRadius:9,background:bg,border:`1.5px solid ${border}`,color,fontSize:13,textAlign:'left',display:'flex',alignItems:'center',gap:10,cursor:enviado?'default':'pointer'}}>
                              <div style={{width:22,height:22,borderRadius:'50%',border:`1.5px solid ${border}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:10,fontWeight:700,color}}>
                                {enviado&&j===p.correcta?'✓':enviado&&resp[i]===j&&j!==p.correcta?'✗':String.fromCharCode(65+j)}
                              </div>
                              {op}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {!enviado?(
                <button onClick={()=>setEnv(true)} style={{width:'100%',padding:'14px 0',borderRadius:10,background:'#111827',border:'none',color:'#fff',fontWeight:700,fontSize:15}}>Enviar respuestas</button>
              ):(
                <>
                  <div style={{padding:'20px 24px',borderRadius:12,background:n>=60?'#f0fdf4':'#fef2f2',border:`1px solid ${n>=60?'#86efac':'#fca5a5'}`,marginBottom:12,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div>
                      <p style={{fontSize:44,fontWeight:900,color:n>=60?'#15803d':'#dc2626',lineHeight:1,fontFamily:'monospace'}}>{n}%</p>
                      <p style={{fontSize:12,color:'#6b7280',marginTop:4}}>{n>=60?'Lección superada ✓':'Mínimo 60% requerido'}</p>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <p style={{fontSize:22,fontWeight:800,color:n>=60?'#15803d':'#9ca3af',fontFamily:'monospace'}}>+{n>=60?lecAc.xp:0}</p>
                      <p style={{fontSize:11,color:'#9ca3af'}}>XP ganados</p>
                    </div>
                  </div>
                  {n>=60?(
                    <button onClick={completar} style={{width:'100%',padding:'14px 0',borderRadius:10,background:'#15803d',border:'none',color:'#fff',fontWeight:700,fontSize:15}}>Completar lección → +{lecAc.xp} XP</button>
                  ):(
                    <button onClick={()=>{setEnv(false);setResp({});setFase('teoria');}} style={{width:'100%',padding:'14px 0',borderRadius:10,background:'#f9fafb',border:'1px solid #e5e7eb',color:'#374151',fontWeight:600,fontSize:14}}>Revisar teoría e intentar de nuevo</button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── MÓDULOS DE CURSO ─────────────────────────────────────────────────────────
  if (cursoAc) {
    const mods = cursoAc.moduloIds.map(id => MODULOS.find(m => m.id===id));
    const pct  = cPct(cursoAc);
    return (
      <div style={{minHeight:'100vh',background:'#f9fafb',fontFamily:'inherit'}}>
        <style>{CSS}</style>
        <div style={{position:'sticky',top:0,zIndex:50,height:56,background:'#fff',borderBottom:'1px solid #e5e7eb',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 32px',boxShadow:'0 1px 3px rgba(0,0,0,.06)'}}>
          <button onClick={()=>{setCurso(null);setMod(null);}} style={{display:'flex',alignItems:'center',gap:7,background:'none',border:'1px solid #e5e7eb',color:'#6b7280',padding:'6px 14px',borderRadius:8,fontSize:13,fontWeight:500}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Training
          </button>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:28,height:28,borderRadius:7,background:`${cursoAc.color}12`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,border:`1px solid ${cursoAc.color}20`}}>📚</div>
            <span style={{fontSize:14,fontWeight:700,color:'#111827'}}>{cursoAc.titulo}</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:80,height:3,background:'#e5e7eb',borderRadius:2}}><div style={{height:'100%',width:`${pct}%`,background:cursoAc.color,borderRadius:2,transition:'width .4s'}}/></div>
            <span style={{fontSize:12,fontWeight:700,color:cursoAc.color,fontFamily:'monospace'}}>{pct}%</span>
          </div>
        </div>

        <div style={{maxWidth:880,margin:'0 auto',padding:'32px 24px 64px'}}>
          <div style={{background:'#fff',borderRadius:14,border:'1px solid #e5e7eb',padding:'20px 24px',marginBottom:28,boxShadow:'0 1px 4px rgba(0,0,0,.06)',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:0,left:0,bottom:0,width:3,background:cursoAc.color,borderRadius:'4px 0 0 4px'}}/>
            <div style={{paddingLeft:16}}>
              <p style={{fontSize:11,fontWeight:700,color:cursoAc.color,letterSpacing:'1.5px',textTransform:'uppercase',marginBottom:4}}>Curso {String(cursoAc.id).padStart(2,'0')} · {cursoAc.nivel}</p>
              <h2 style={{fontSize:20,fontWeight:800,color:'#111827',marginBottom:2}}>{cursoAc.titulo}</h2>
              <p style={{fontSize:13,color:'#6b7280'}}>{cursoAc.subtitulo} · {cursoAc.duracion} · {cursoAc.xp.toLocaleString()} XP disponibles</p>
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:cursoAc.moduloIds.includes(modAc?.id)?24:0}}>
            {mods.map((mod,mi) => {
              const done = mDone(mod); const comp = lComp(mod); const total = mod.lecciones.length;
              const pct2 = total>0?(comp/total)*100:0; const cert = certificados.find(c=>c.moduloId===mod.id);
              const isOpen = modAc?.id===mod.id;
              return (
                <div key={mod.id} className="mod-card" onClick={()=>setMod(isOpen?null:mod)}
                  style={{background:'#fff',border:`1px solid ${isOpen?mod.color+'50':'#e5e7eb'}`,borderRadius:12,padding:'18px',boxShadow:isOpen?`0 0 0 1px ${mod.color}30, 0 4px 16px ${mod.color}15`:'0 1px 4px rgba(0,0,0,.05)',position:'relative',overflow:'hidden'}}>
                  <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:done?'#22c55e':mod.color,opacity:done?1:.5}}/>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                    <div>
                      <p style={{fontSize:10,fontWeight:700,color:mod.color,letterSpacing:'1.2px',textTransform:'uppercase',marginBottom:6}}>Módulo {mod.num}</p>
                      <div style={{display:'inline-flex',alignItems:'center',gap:5,padding:'2px 8px',borderRadius:4,background:mod.tag==='SOC Basics'?'#eef2ff':mod.tag==='Detection'?'#ecfeff':mod.tag==='Incident Response'?'#fef2f2':mod.tag==='Threat Hunting'?'#f5f3ff':mod.tag==='Forensics'?'#ecfdf5':mod.tag==='Cloud'?'#f0f9ff':'#fefce8',border:`1px solid ${mod.color}20`}}>
                        <span style={{fontSize:9,fontWeight:700,color:mod.color,letterSpacing:'.5px'}}>{mod.tag}</span>
                      </div>
                    </div>
                    <div style={{display:'flex',gap:5,alignItems:'center'}}>
                      {cert&&<span style={{fontSize:14}}>🏅</span>}
                      <span style={{fontSize:10,padding:'3px 8px',borderRadius:5,fontWeight:700,background:done?'#f0fdf4':'#f9fafb',color:done?'#15803d':'#9ca3af',border:`1px solid ${done?'#86efac':'#e5e7eb'}`}}>{done?'Completado':'Pendiente'}</span>
                    </div>
                  </div>
                  <h3 style={{fontSize:13,fontWeight:700,color:'#111827',lineHeight:1.45,marginBottom:6}}>{mod.titulo}</h3>
                  <p style={{fontSize:11,color:'#9ca3af',lineHeight:1.5,marginBottom:12}}>{mod.descripcion}</p>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                    <span style={{fontSize:11,fontWeight:600,color:done?'#15803d':mod.color,fontFamily:'monospace'}}>+{mod.xp} XP</span>
                    <span style={{fontSize:10,color:'#9ca3af'}}>{comp}/{total} lecciones</span>
                  </div>
                  <div style={{height:3,borderRadius:2,background:'#f3f4f6'}}>
                    <div style={{height:'100%',width:`${pct2}%`,borderRadius:2,background:done?'#22c55e':mod.color,transition:'width .6s ease'}}/>
                  </div>
                </div>
              );
            })}
          </div>

          {modAc && cursoAc.moduloIds.includes(modAc.id) && (
            <div className="ani" style={{background:'#fff',borderRadius:14,border:'1px solid #e5e7eb',overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,.06)'}}>
              <div style={{padding:'14px 20px',borderBottom:'1px solid #f3f4f6',display:'flex',alignItems:'center',justifyContent:'space-between',background:'#fafafa'}}>
                <div>
                  <p style={{fontSize:11,fontWeight:700,color:modAc.color,letterSpacing:'1px',textTransform:'uppercase',marginBottom:2}}>Módulo {modAc.num}</p>
                  <p style={{fontSize:14,fontWeight:700,color:'#111827'}}>{modAc.titulo}</p>
                </div>
                <p style={{fontSize:11,color:'#6b7280',fontFamily:'monospace'}}>{modAc.certificado}</p>
              </div>
              {modAc.lecciones.map((lec,li) => {
                const done = completadas.includes(`${modAc.id}-${lec.id}`);
                return (
                  <div key={lec.id} className="lec-row" onClick={()=>iniciar(lec)}
                    style={{display:'flex',alignItems:'center',gap:14,padding:'14px 20px',borderBottom:li<modAc.lecciones.length-1?'1px solid #f3f4f6':'none',background:'#fff'}}>
                    <div style={{width:34,height:34,borderRadius:9,flexShrink:0,background:done?'#f0fdf4':'#f9fafb',border:`1.5px solid ${done?'#86efac':'#e5e7eb'}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                      {done
                        ?<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                        :<svg width="12" height="12" viewBox="0 0 24 24" fill={modAc.color}><path d="M5 3l14 9-14 9V3z"/></svg>
                      }
                    </div>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                        <span style={{fontSize:13,fontWeight:done?400:600,color:done?'#6b7280':'#111827'}}>{lec.titulo}</span>
                        {lec.esCaso&&<span style={{fontSize:9,padding:'2px 7px',borderRadius:4,background:'#fffbeb',color:'#92400e',border:'1px solid #fde68a',fontWeight:700,textTransform:'uppercase',letterSpacing:'.5px'}}>Caso</span>}
                      </div>
                      <span style={{fontSize:11,color:'#9ca3af',fontFamily:'monospace'}}>+{lec.xp} XP</span>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── VISTA PRINCIPAL ──────────────────────────────────────────────────────────
  const totalXP = MODULOS.reduce((a,m)=>a+m.xp,0);

  return (
    <div style={{minHeight:'100vh',background:'#f9fafb',fontFamily:'inherit',color:'#111827'}}>
      <style>{CSS}</style>
      <SBNav user={user} avatarConfig={avatarConfig} foto={foto} activePage="/training" navigate={navigate}/>

      {/* HERO */}
      <div style={{background:'linear-gradient(135deg,#1e2d6b 0%,#1e40af 50%,#1d4ed8 100%)',padding:'60px 40px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle at 70% 50%,rgba(255,255,255,.06) 0%,transparent 60%)',pointerEvents:'none'}}/>
        <div style={{maxWidth:880,margin:'0 auto',position:'relative'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'5px 14px',borderRadius:100,background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.15)',marginBottom:24}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:'#4ade80',animation:'pulse 2s infinite'}}/>
            <span style={{fontSize:11,color:'rgba(255,255,255,.85)',fontWeight:600,letterSpacing:'2px',textTransform:'uppercase'}}>SOC Training Platform</span>
          </div>
          <h1 style={{fontSize:42,fontWeight:900,color:'#fff',letterSpacing:'-1.5px',lineHeight:1.08,marginBottom:16}}>
            Conviértete en analista<br/><span style={{color:'#93c5fd'}}>SOC profesional.</span>
          </h1>
          <p style={{fontSize:15,color:'rgba(255,255,255,.65)',lineHeight:1.7,maxWidth:500,marginBottom:32}}>
            {MODULOS.length} módulos · 3 cursos · {totalXP.toLocaleString()} XP · Casos prácticos reales · Certificados verificables
          </p>
          <div style={{display:'flex',alignItems:'center',gap:10,maxWidth:420}}>
            <div style={{flex:1,height:5,background:'rgba(255,255,255,.15)',borderRadius:3,overflow:'hidden'}}>
              <div style={{height:'100%',width:`${totalLec>0?(completadas.length/totalLec)*100:0}%`,background:'linear-gradient(90deg,#4ade80,#22c55e)',borderRadius:3,transition:'width .5s'}}/>
            </div>
            <span style={{fontSize:12,color:'rgba(255,255,255,.5)',fontFamily:'monospace',flexShrink:0}}>{completadas.length}/{totalLec}</span>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{background:'#fff',borderBottom:'1px solid #e5e7eb',position:'sticky',top:0,zIndex:40,boxShadow:'0 1px 3px rgba(0,0,0,.06)'}}>
        <div style={{maxWidth:880,margin:'0 auto',display:'flex',padding:'0 40px',gap:0}}>
          {[['cursos','Cursos SocBlast'],['plataformas','Plataformas'],['certificaciones','Certificaciones']].map(([id,label])=>(
            <button key={id} className="tab-btn" onClick={()=>setTab(id)}
              style={{padding:'16px 24px',border:'none',background:'transparent',fontSize:13,fontWeight:600,color:tab===id?'#111827':'#9ca3af',borderBottom:tab===id?'2px solid #1e40af':'2px solid transparent',marginBottom:-1}}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{maxWidth:880,margin:'0 auto',padding:'40px 40px 80px'}}>

        {/* TAB CURSOS */}
        {tab==='cursos'&&(
          <div className="ani">
            {certificados.length>0&&(
              <div style={{padding:'14px 18px',borderRadius:12,background:'#fffbeb',border:'1px solid #fde68a',marginBottom:28,display:'flex',alignItems:'center',gap:12}}>
                <span style={{fontSize:18}}>🏅</span>
                <div style={{flex:1}}>
                  <p style={{fontSize:12,fontWeight:700,color:'#92400e',marginBottom:6}}>Certificados obtenidos</p>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                    {certificados.map((c,i)=><span key={i} style={{fontSize:11,padding:'3px 10px',borderRadius:6,background:'#fff',border:'1px solid #fde68a',color:'#92400e',fontWeight:600}}>{c.titulo}</span>)}
                  </div>
                </div>
              </div>
            )}
            <div style={{marginBottom:28}}>
              <h2 style={{fontSize:20,fontWeight:800,color:'#111827',marginBottom:6}}>Cursos SocBlast</h2>
              <p style={{fontSize:13,color:'#6b7280'}}>9 módulos · 3 cursos con casos prácticos reales, test de comprensión y certificados verificables.</p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
              {CURSOS.map(curso => {
                const unl = unlock(curso); const pct2 = cPct(curso); const done = pct2===100;
                return (
                  <div key={curso.id} className={unl?'mod-card':''}
                    onClick={()=>{if(!unl)return;setCurso(curso);setMod(null);}}
                    style={{background:'#fff',borderRadius:14,border:`1px solid ${!unl?'#e5e7eb':done?'#86efac':curso.color+'30'}`,overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,.06)',opacity:unl?1:.45,cursor:unl?'pointer':'not-allowed',transition:'all .2s'}}>
                    <div style={{height:6,background:done?'#22c55e':!unl?'#e5e7eb':curso.color}}/>
                    <div style={{padding:'20px'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
                        <div>
                          <p style={{fontSize:10,fontWeight:700,color:unl?curso.color:'#9ca3af',letterSpacing:'1.5px',textTransform:'uppercase',marginBottom:6}}>Curso {String(curso.id).padStart(2,'0')}</p>
                          <span style={{fontSize:11,padding:'3px 9px',borderRadius:5,background:curso.nivel==='Principiante'?'#ecfdf5':curso.nivel==='Intermedio'?'#eff6ff':'#fef2f2',color:curso.nivel==='Principiante'?'#15803d':curso.nivel==='Intermedio'?'#1e40af':'#dc2626',fontWeight:600}}>{curso.nivel}</span>
                        </div>
                        {!unl&&<span style={{fontSize:12,color:'#9ca3af'}}>🔒</span>}
                        {done&&<span style={{fontSize:11,padding:'3px 10px',borderRadius:5,background:'#f0fdf4',color:'#15803d',fontWeight:700,border:'1px solid #86efac'}}>✓ Completado</span>}
                      </div>
                      <h3 style={{fontSize:16,fontWeight:800,color:'#111827',marginBottom:4,letterSpacing:'-.3px'}}>{curso.titulo}</h3>
                      <p style={{fontSize:12,color:unl?curso.color:'#9ca3af',marginBottom:16,fontStyle:'italic'}}>{curso.subtitulo}</p>
                      <div style={{display:'flex',gap:10,marginBottom:16}}>
                        {[['📚',`${curso.moduloIds.length} módulos`],['⏱',curso.duracion],['⚡',`${curso.xp.toLocaleString()} XP`]].map(([ic,v])=>(
                          <div key={v} style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:'#6b7280'}}>
                            <span style={{fontSize:11}}>{ic}</span><span>{v}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{marginBottom:8}}>
                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                          <span style={{fontSize:11,color:'#9ca3af'}}>Progreso</span>
                          <span style={{fontSize:11,fontWeight:700,color:done?'#15803d':unl?curso.color:'#9ca3af',fontFamily:'monospace'}}>{pct2}%</span>
                        </div>
                        <div style={{height:4,borderRadius:2,background:'#f3f4f6'}}>
                          <div style={{height:'100%',width:`${pct2}%`,borderRadius:2,background:done?'#22c55e':curso.color,transition:'width .6s ease'}}/>
                        </div>
                      </div>
                      {unl&&<p style={{fontSize:12,fontWeight:600,color:curso.color,marginTop:10}}>{done?'Ver certificados →':'Comenzar curso →'}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB PLATAFORMAS */}
        {tab==='plataformas'&&(
          <div className="ani">
            <div style={{marginBottom:28}}>
              <h2 style={{fontSize:20,fontWeight:800,color:'#111827',marginBottom:6}}>Plataformas de práctica</h2>
              <p style={{fontSize:13,color:'#6b7280'}}>Las mejores plataformas para practicar Blue Team. Laboratorios reales, máquinas virtuales y rutas guiadas.</p>
            </div>
            <div style={{background:'linear-gradient(135deg,#1e2d6b,#1e40af)',borderRadius:12,padding:'16px 22px',marginBottom:28,display:'flex',alignItems:'center',gap:14}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
              <div>
                <p style={{fontSize:13,fontWeight:600,color:'#fff',marginBottom:2}}>Ruta recomendada</p>
                <p style={{fontSize:12,color:'rgba(255,255,255,.6)'}}>TryHackMe (SOC L1) → HackTheBox (SOC Analyst) → LetsDefend (práctica diaria) → CyberDefenders (labs avanzados)</p>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
              {PLATAFORMAS.map((p,i)=>(
                <div key={i} className="plat-card" onClick={()=>window.open(p.afiliado,'_blank')}
                  style={{background:p.bg,borderRadius:14,overflow:'hidden',border:'1px solid rgba(255,255,255,.06)',boxShadow:'0 2px 8px rgba(0,0,0,.2)',display:'flex',flexDirection:'column'}}>
                  <div style={{padding:'22px 24px 18px',borderBottom:`1px solid rgba(255,255,255,.07)`}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
                      <div style={{display:'flex',alignItems:'center',gap:12}}>
                        <div style={{width:44,height:44,borderRadius:10,background:`${p.accent}15`,border:`1px solid ${p.accent}25`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          <span style={{fontSize:11,fontWeight:900,color:p.accent,letterSpacing:'-.5px',fontFamily:'monospace'}}>{p.initials}</span>
                        </div>
                        <div>
                          <p style={{fontSize:16,fontWeight:800,color:'#fff',marginBottom:4}}>{p.nombre}</p>
                          <div style={{display:'flex',gap:6,alignItems:'center'}}>
                            <span style={{fontSize:10,padding:'2px 8px',borderRadius:4,background:p.tipo.includes('Gratis')?'rgba(74,222,128,.15)':'rgba(251,191,36,.15)',color:p.tipo.includes('Gratis')?'#4ade80':'#fbbf24',fontWeight:700}}>{p.tipo.includes('Gratis')?'FREEMIUM':'PREMIUM'}</span>
                            {p.recomendado&&<span style={{fontSize:10,padding:'2px 8px',borderRadius:4,background:`${p.accent}20`,color:p.accent,fontWeight:700}}>Recomendado</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p style={{fontSize:13,color:'rgba(255,255,255,.55)',lineHeight:1.7}}>{p.desc}</p>
                  </div>
                  <div style={{padding:'14px 24px',flex:1}}>
                    <p style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.25)',letterSpacing:'1.5px',textTransform:'uppercase',marginBottom:9}}>Rutas</p>
                    <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                      {p.rutas.map(r=><span key={r} style={{fontSize:11,padding:'3px 10px',borderRadius:5,background:`${p.accent}12`,border:`1px solid ${p.accent}22`,color:p.accent,fontWeight:500}}>{r}</span>)}
                    </div>
                  </div>
                  <div style={{padding:'12px 24px',borderTop:`1px solid rgba(255,255,255,.07)`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <span style={{fontSize:12,color:'rgba(255,255,255,.35)',fontFamily:'monospace'}}>{p.tipo}</span>
                    <span style={{fontSize:12,fontWeight:700,color:p.accent,display:'flex',alignItems:'center',gap:4}}>Abrir <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB CERTIFICACIONES */}
        {tab==='certificaciones'&&(
          <div className="ani">
            <div style={{marginBottom:28}}>
              <h2 style={{fontSize:20,fontWeight:800,color:'#111827',marginBottom:6}}>Ruta de certificaciones</h2>
              <p style={{fontSize:13,color:'#6b7280'}}>Las certificaciones más valoradas por equipos SOC y reclutadores del sector.</p>
            </div>
            <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',padding:'16px 20px',marginBottom:24,boxShadow:'0 1px 4px rgba(0,0,0,.05)'}}>
              <p style={{fontSize:11,fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:12}}>Ruta recomendada para analistas SOC</p>
              <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
                {['Security+','CySA+','BTL1','SC-200','OSCP'].map((c,i,arr)=>(
                  <React.Fragment key={c}>
                    <div style={{padding:'7px 14px',borderRadius:7,background:i<4?'#1e40af':'#f3f4f6',fontSize:12,fontWeight:700,color:i<4?'#fff':'#9ca3af',border:`1px solid ${i<4?'#1e40af':'#e5e7eb'}`}}>{c}</div>
                    {i<arr.length-1&&<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
              {CERTS.map((cert,i)=>{
                const nc = cert.nivel==='Entry'?'#15803d':cert.nivel==='Intermedio'?'#b45309':'#dc2626';
                const nb = cert.nivel==='Entry'?'#f0fdf4':cert.nivel==='Intermedio'?'#fffbeb':'#fef2f2';
                return(
                  <div key={i} className="cert-card" onClick={()=>window.open(cert.url,'_blank')}
                    style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,.05)',display:'flex',flexDirection:'column'}}>
                    <div style={{height:4,background:cert.color}}/>
                    <div style={{padding:'18px 18px 16px',flex:1}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                        <div>
                          <p style={{fontSize:14,fontWeight:800,color:'#111827',marginBottom:3}}>{cert.nombre}</p>
                          <p style={{fontSize:11,color:'#9ca3af'}}>{cert.org}</p>
                        </div>
                        <div style={{display:'flex',flexDirection:'column',gap:4,alignItems:'flex-end'}}>
                          <span style={{fontSize:10,padding:'2px 8px',borderRadius:4,background:nb,color:nc,fontWeight:700}}>{cert.nivel}</span>
                          {cert.credly&&<span style={{fontSize:9,padding:'1px 6px',borderRadius:4,background:'#fffbeb',color:'#92400e',fontWeight:700,border:'1px solid #fde68a'}}>Credly ✓</span>}
                        </div>
                      </div>
                      <p style={{fontSize:12,color:'#6b7280',lineHeight:1.65,marginBottom:14}}>{cert.desc}</p>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
                        {[['Precio',cert.precio],['Preparación',cert.tiempo]].map(([l,v])=>(
                          <div key={l} style={{padding:'8px 10px',borderRadius:8,background:'#f9fafb',border:'1px solid #f3f4f6'}}>
                            <p style={{fontSize:10,color:'#9ca3af',marginBottom:3,textTransform:'uppercase',letterSpacing:'.5px'}}>{l}</p>
                            <p style={{fontSize:12,fontWeight:700,color:'#111827'}}>{v}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{padding:'12px 18px',borderTop:'1px solid #f3f4f6',display:'flex',alignItems:'center',justifyContent:'space-between',background:'#fafafa'}}>
                      <span style={{fontSize:11,color:'#9ca3af'}}>Ver más detalles</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={cert.color} strokeWidth="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}