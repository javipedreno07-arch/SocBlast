import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SBNav, Icon, ACC, BG, BASE_CSS } from './SBLayout';
import { useAuth } from '../context/AuthContext';

const MODULOS = [
  {
    id:1, num:'01', titulo:'Fundamentos de Ciberseguridad y SOC',
    descripcion:'Triada CIA, tipos de ataques, actores de amenaza y el rol del SOC',
    color:'#4f46e5', icono:'🛡️', xp:200, certificado:'Analista SOC — Fundamentos',
    lecciones:[
      { id:1, titulo:'Introducción a la Ciberseguridad', xp:35, teoria:
`La ciberseguridad protege sistemas, redes y datos frente a ataques digitales.

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
          {pregunta:'¿Qué garantiza la Disponibilidad en CIA?',opciones:['Que los datos no se alteran','Que solo los autorizados acceden','Que los sistemas estén accesibles cuando se necesitan','Que se cifran las comunicaciones'],correcta:2},
        ]
      },
      { id:2, titulo:'Redes para SOC — Fundamentos críticos', xp:40, teoria:
`Las redes son el campo de batalla del analista SOC. Debes dominarlas.

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
- SSH (22) — Acceso remoto seguro

CONCEPTOS ESENCIALES
- IPs privadas: 192.168.x.x · 10.x.x.x · 172.16-31.x.x
- TCP — Fiable, usa 3-way handshake
- UDP — Rápido, sin confirmación`,
        preguntas:[
          {pregunta:'¿En qué capa OSI opera el protocolo IP?',opciones:['Capa 2 — Enlace','Capa 3 — Red','Capa 4 — Transporte','Capa 7 — Aplicación'],correcta:1},
          {pregunta:'¿Qué puerto usa SMB?',opciones:['80','443','445','3389'],correcta:2},
          {pregunta:'¿Cuál es la diferencia entre TCP y UDP?',opciones:['TCP es más rápido','UDP es fiable, TCP no','TCP es fiable con confirmación, UDP es rápido sin ella','Son idénticos'],correcta:2},
          {pregunta:'¿Qué rango de IPs es privado?',opciones:['8.8.8.8','192.168.1.1','142.250.0.1','1.1.1.1'],correcta:1},
          {pregunta:'El protocolo DNS opera en el puerto...',opciones:['80','443','53','22'],correcta:2},
        ]
      },
      { id:3, titulo:'Logs y Eventos — El lenguaje del SOC', xp:35, teoria:
`Los logs son la evidencia de todo lo que ocurre en un sistema.

TIPOS DE LOGS
- Logs de sistema — Arranque, errores, inicio/cierre de sesión
- Logs de red — Tráfico, conexiones, reglas de firewall
- Logs de aplicación — Errores de app, accesos web
- Logs de seguridad — Autenticación, cambios de privilegios

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
          {pregunta:'¿Qué Event ID indica un inicio de sesión fallido?',opciones:['4624','4625','4688','7045'],correcta:1},
          {pregunta:'¿Para qué sirve el Event ID 4688?',opciones:['Login exitoso','Proceso creado','Servicio instalado','Cuenta creada'],correcta:1},
          {pregunta:'¿Qué es un SIEM?',opciones:['Un firewall avanzado','Sistema que centraliza y correlaciona logs','Un antivirus empresarial','Un protocolo de red'],correcta:1},
          {pregunta:'Muchos Event ID 4625 desde la misma IP indican...',opciones:['Actividad normal','Brute force attack','Actualización del sistema','Backup automático'],correcta:1},
        ]
      },
      { id:4, titulo:'El SOC — Roles, flujo y herramientas', xp:40, teoria:
`El SOC es el centro neurálgico de la seguridad. Opera 24/7.

ROLES EN EL SOC
- L1 Triage — Monitoriza alertas, clasifica incidentes, escala
- L2 Investigación — Analiza incidentes en profundidad
- L3 Threat Hunting — Busca amenazas activamente
- SOC Manager — Coordina el equipo

FLUJO DE TRABAJO
- Alerta generada por SIEM o EDR
- L1 clasifica: ¿falso positivo o incidente real?
- Si real, escala a L2 con todo el contexto
- L2 investiga: logs, IOCs, impacto
- L3 coordina la respuesta y contención
- Documentación y lecciones aprendidas

HERRAMIENTAS CORE
- SIEM (Splunk, Sentinel) — Correlación de eventos
- EDR (CrowdStrike, SentinelOne) — Protección de endpoints
- SOAR — Automatización de respuestas
- Threat Intel Platforms — IOCs, CVEs, TTPs`,
        preguntas:[
          {pregunta:'¿Qué rol hace el triage inicial de alertas?',opciones:['L3','L2','L1','SOC Manager'],correcta:2},
          {pregunta:'¿Qué herramienta automatiza respuestas en un SOC?',opciones:['SIEM','EDR','SOAR','Firewall'],correcta:2},
          {pregunta:'CrowdStrike es un ejemplo de...',opciones:['SIEM','Firewall','EDR','SOAR'],correcta:2},
          {pregunta:'¿Cuál es el primer paso cuando se genera una alerta?',opciones:['Contener el incidente','Clasificar si es falso positivo o real','Apagar el servidor','Notificar a prensa'],correcta:1},
        ]
      },
      { id:5, titulo:'CASO PRÁCTICO — Primer incidente SOC', xp:50, esCaso:true, teoria:
`CASO REAL: Detección de acceso no autorizado al Domain Controller

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
          {pregunta:'847 eventos ID 4625 + 1 evento ID 4624. ¿Qué tipo de ataque es?',opciones:['Phishing','Brute Force exitoso','DDoS','SQL Injection'],correcta:1},
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
    color:'#7c3aed', icono:'🔍', xp:250, certificado:'Analista SOC — Detección',
    lecciones:[
      { id:1, titulo:'SIEM — El cerebro del SOC', xp:45, teoria:
`El SIEM es la herramienta central del analista. Sin SIEM no hay SOC.

FUNCIONES PRINCIPALES
- Recopilar y normalizar logs de toda la infraestructura
- Correlacionar eventos de múltiples fuentes
- Generar alertas basadas en reglas y umbrales

QUERIES EN SPLUNK
index=windows EventID=4625 | stats count by src_ip
index=firewall action=blocked | top src_ip

TIPOS DE ALERTAS
- True Positive (TP) — Alerta real, incidente confirmado
- False Positive (FP) — Alerta falsa, actividad legítima
- True Negative (TN) — Sin alerta y sin incidente
- False Negative (FN) — Sin alerta pero HAY incidente (peligroso)

CORRELACIÓN
+100 EventID 4625 en 5 min desde la misma IP = Brute Force`,
        preguntas:[
          {pregunta:'¿Qué es un False Negative en SIEM?',opciones:['Una alerta falsa','Incidente real sin alerta — el más peligroso','Una alerta correcta','Un log sin datos'],correcta:1},
          {pregunta:'True Positive significa...',opciones:['Falsa alarma','Alerta real con incidente confirmado','Sistema sin amenazas','Log sin anomalías'],correcta:1},
          {pregunta:'¿Qué hace el SIEM con logs de distintas fuentes?',opciones:['Los elimina','Los normaliza y correlaciona','Los cifra','Los ignora'],correcta:1},
          {pregunta:'Una buena regla SIEM para detectar brute force...',opciones:['1 login fallido = alerta','+100 logins fallidos en 5 min desde la misma IP','Cualquier login = alerta','Logins de lunes a viernes = alerta'],correcta:1},
        ]
      },
      { id:2, titulo:'MITRE ATT&CK Framework', xp:45, teoria:
`MITRE ATT&CK es la biblia del analista SOC. Documenta tácticas y técnicas reales.

ESTRUCTURA
- Tácticas — El QUÉ quiere el atacante
- Técnicas — El CÓMO lo consigue
- Sub-técnicas — Variantes específicas

TÉCNICAS MÁS VISTAS EN SOC
- T1566 — Phishing (Initial Access)
- T1059 — Command and Scripting Interpreter (Execution)
- T1078 — Valid Accounts (Persistence)
- T1027 — Obfuscated Files (Defense Evasion)
- T1110 — Brute Force (Credential Access)
- T1021 — Remote Services (Lateral Movement)
- T1486 — Data Encrypted for Impact (Ransomware)`,
        preguntas:[
          {pregunta:'¿Qué táctica MITRE corresponde a T1566 (Phishing)?',opciones:['Execution','Initial Access','Lateral Movement','Persistence'],correcta:1},
          {pregunta:'T1110 Brute Force corresponde a la táctica...',opciones:['Initial Access','Defense Evasion','Credential Access','Collection'],correcta:2},
          {pregunta:'¿Para qué sirve MITRE ATT&CK?',opciones:['Gestionar firewalls','Documentar tácticas y técnicas reales de atacantes','Crear políticas de backup','Configurar SIEM'],correcta:1},
          {pregunta:'T1021 Remote Services corresponde a...',opciones:['Initial Access','Persistence','Defense Evasion','Lateral Movement'],correcta:3},
        ]
      },
      { id:3, titulo:'Threat Intelligence — IOCs y OSINT', xp:40, teoria:
`La Threat Intelligence te permite conocer al enemigo antes de que ataque.

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
- URLscan.io — Análisis visual de URLs sospechosas

PROCESO DE ENRIQUECIMIENTO
- Busca la IP en AbuseIPDB — ¿reportada como maliciosa?
- Busca en VirusTotal — ¿asociada a malware conocido?
- Busca en Shodan — ¿qué servicios expone?`,
        preguntas:[
          {pregunta:'¿Qué es un IOC?',opciones:['Un tipo de malware','Indicador de Compromiso — evidencia de actividad maliciosa','Una herramienta SIEM','Un protocolo de red'],correcta:1},
          {pregunta:'Para verificar si una IP es maliciosa usarías...',opciones:['Google','AbuseIPDB o VirusTotal','Shodan únicamente','El SIEM directamente'],correcta:1},
          {pregunta:'¿Qué muestra Shodan?',opciones:['Malware conocido','Dispositivos y servicios expuestos en internet','Logs de Windows','URLs de phishing'],correcta:1},
          {pregunta:'El enriquecimiento de alertas sirve para...',opciones:['Eliminar alertas','Añadir contexto para confirmar si una alerta es real','Crear nuevas reglas SIEM','Formatear logs'],correcta:1},
        ]
      },
      { id:4, titulo:'CASO PRÁCTICO — Phishing con malware', xp:60, esCaso:true, teoria:
`CASO REAL: Campaña de phishing con RAT

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
- IP VirusTotal: C2 de RAT conocido
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
    color:'#ef4444', icono:'🚨', xp:280, certificado:'Analista SOC — Incident Response',
    lecciones:[
      { id:1, titulo:'Ciclo de Respuesta NIST SP 800-61', xp:40, teoria:
`El NIST SP 800-61 es el estándar de referencia para respuesta a incidentes.

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
- Actualizar playbooks
- Mejorar reglas de detección`,
        preguntas:[
          {pregunta:'¿Cuál es la fase donde se elimina el malware?',opciones:['Contención','Recuperación','Erradicación','Preparación'],correcta:2},
          {pregunta:'¿Por qué preservar evidencias ANTES de contener?',opciones:['Por protocolo burocrático','Para análisis forense posterior','Porque no es urgente','Para informar a prensa'],correcta:1},
          {pregunta:'La fase de Lecciones Aprendidas sirve para...',opciones:['Celebrar el éxito','Mejorar procesos y detecciones para el futuro','Cerrar tickets','Informar a clientes'],correcta:1},
          {pregunta:'¿Qué viene ANTES de la Erradicación en NIST?',opciones:['Recuperación','Preparación','Lecciones Aprendidas','Contención'],correcta:3},
        ]
      },
      { id:2, titulo:'Clasificación y severidad de incidentes', xp:35, teoria:
`Clasificar correctamente es una de las habilidades más críticas del analista L1.

NIVELES DE SEVERIDAD
- 🔴 CRÍTICO — Impacto inmediato. Ransomware activo, DC comprometido. Respuesta: <15 minutos
- 🟠 ALTO — Riesgo significativo. Malware detectado, cuentas privilegiadas. Respuesta: <1 hora
- 🟡 MEDIO — Impacto limitado. Malware en endpoint aislado. Respuesta: <4 horas
- 🟢 BAJO — Poco impacto. Escaneo de puertos bloqueado. Respuesta: <24 horas

FACTORES PARA CLASIFICAR
- ¿Qué sistemas están afectados? DC > servidor > endpoint
- ¿Hay datos sensibles en riesgo?
- ¿El ataque está activo o fue contenido?
- ¿Cuántos usuarios afectados?`,
        preguntas:[
          {pregunta:'Ransomware activo en 50 sistemas. ¿Qué severidad?',opciones:['Baja','Media','Alta','Crítica'],correcta:3},
          {pregunta:'Escaneo de puertos bloqueado por firewall. ¿Severidad?',opciones:['Crítica','Alta','Baja','Media'],correcta:2},
          {pregunta:'¿Cuál es el tiempo máximo para un incidente CRÍTICO?',opciones:['24 horas','4 horas','1 hora','15 minutos'],correcta:3},
          {pregunta:'Un Domain Controller comprometido se clasifica como...',opciones:['Medio','Bajo','Crítico','Alto'],correcta:2},
        ]
      },
      { id:3, titulo:'CASO PRÁCTICO — Respuesta a Ransomware', xp:70, esCaso:true, teoria:
`CASO REAL: Ataque de ransomware tipo WannaCry

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
- Tráfico SMB masivo interno en puerto 445

RESPUESTA
- 08:50 — Segmentar red, aislar 12 equipos
- 09:30 — Identificar y eliminar payload
- 12:00 — Restaurar desde backup del domingo`,
        preguntas:[
          {pregunta:'Se propaga via SMB 445. ¿Qué contención es más urgente?',opciones:['Apagar todos los servidores','Segmentar red y bloquear tráfico SMB interno','Formatear un equipo','Llamar al fabricante del antivirus'],correcta:1},
          {pregunta:'27 minutos entre el phishing y la primera alerta. ¿Qué problema revela?',opciones:['El SIEM funciona perfectamente','Gap de detección — el EDR no detectó el payload inicial','Es un tiempo excelente','Los usuarios deben reportar más rápido'],correcta:1},
          {pregunta:'¿Por qué NO apagar inmediatamente los equipos cifrados?',opciones:['Porque tardan en encender','Pueden contener evidencias forenses en RAM','Pueden seguir trabajando','Por política de empresa'],correcta:1},
          {pregunta:'Tras la recuperación, ¿qué es lo primero?',opciones:['Celebrarlo','Monitorización intensiva + parchear MS17-010 en toda la red','Restaurar solo equipos afectados','Nada más'],correcta:1},
        ]
      },
    ]
  },
  {
    id:4, num:'04', titulo:'Threat Hunting',
    descripcion:'Búsqueda proactiva de amenazas que evaden las defensas automatizadas',
    color:'#d97706', icono:'🎯', xp:260, certificado:'Threat Hunter Certificado',
    lecciones:[
      { id:1, titulo:'¿Qué es el Threat Hunting?', xp:40, teoria:
`El Threat Hunting es la búsqueda proactiva de amenazas que han evadido las defensas.

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
      { id:2, titulo:'CASO PRÁCTICO — Hunting de cuenta comprometida', xp:60, esCaso:true, teoria:
`CASO HUNTING: Detectar cuenta administrativa comprometida

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

CONCLUSIÓN: Cuenta de servicio comprometida usada para reconocimiento y movimiento lateral.`,
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
    color:'#0891b2', icono:'🔬', xp:290, certificado:'Analista Forense Digital',
    lecciones:[
      { id:1, titulo:'Fundamentos del Forense Digital', xp:45, teoria:
`El forense digital investiga qué pasó, cómo pasó y quién lo hizo.

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
- Browser History — Historial de navegación

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
    color:'#3b82f6', icono:'☁️', xp:300, certificado:'Cloud Security Analyst',
    lecciones:[
      { id:1, titulo:'Fundamentos de seguridad cloud', xp:50, teoria:
`El cloud ha transformado el SOC. Los ataques y defensas son diferentes.

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
    color:'#f97316', icono:'⚙️', xp:280, certificado:'SOC Automation Specialist',
    lecciones:[
      { id:1, titulo:'Python para analistas SOC', xp:50, teoria:
`Python es la herramienta de automatización del analista moderno.

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
    color:'#dc2626', icono:'🦠', xp:290, certificado:'Malware Analyst',
    lecciones:[
      { id:1, titulo:'Análisis estático vs dinámico', xp:55, teoria:
`El análisis de malware determina exactamente qué hace un archivo malicioso.

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
    color:'#059669', icono:'🏆', xp:500, certificado:'SOC Analyst Profesional — Certificado',
    lecciones:[
      { id:1, titulo:'Simulacro Final — Gestión de incidente múltiple', xp:500, esCaso:true, teoria:
`SIMULACRO FINAL: Son las 23:47. Eres el analista de guardia. Se disparan 10 alertas.

USA TODO LO APRENDIDO EN LOS 8 MÓDULOS ANTERIORES.

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
  { id:1, titulo:'SOC Fundamentals', subtitulo:'De cero a analista L1', color:'#4f46e5', icono:'🛡️', moduloIds:[1,2,3], nivel:'Principiante', duracion:'~8h', xp:730 },
  { id:2, titulo:'Detection & Analysis', subtitulo:'Analista L2', color:'#7c3aed', icono:'🔍', moduloIds:[4,5,6], nivel:'Intermedio', duracion:'~10h', xp:850 },
  { id:3, titulo:'Advanced SOC', subtitulo:'Nivel profesional L2/L3', color:'#ef4444', icono:'⚔️', moduloIds:[7,8,9], nivel:'Avanzado', duracion:'~12h', xp:1070 },
];

const PLATAFORMAS = [
  { nombre:'TryHackMe', desc:'Salas interactivas de ciberseguridad. Ideal para complementar los fundamentos con práctica real.', url:'https://tryhackme.com', color:'#1db954', emoji:'🟢', nivel:'Principiante — Intermedio', gratis:true, rutas:['SOC Level 1','SOC Level 2','Cyber Defense','Jr Penetration Tester'] },
  { nombre:'HackTheBox', desc:'Máquinas y challenges avanzados. SOC Analyst path, Sherlocks (forense) y labs reales.', url:'https://hacktheboxacademy.com', color:'#9fef00', emoji:'🟩', nivel:'Intermedio — Avanzado', gratis:false, rutas:['SOC Analyst','Defensive Security','Sherlocks (Forense)','Blue Team Labs'] },
  { nombre:'Blue Team Labs', desc:'Laboratorios enfocados en defensa y análisis forense. Perfectos para SOC blue teamers.', url:'https://blueteamlabs.online', color:'#0ea5e9', emoji:'🔵', nivel:'Todos los niveles', gratis:true, rutas:['Incident Response','Threat Intelligence','Digital Forensics','Reverse Engineering'] },
  { nombre:'CyberDefenders', desc:'Challenges de Blue Team con logs reales. PCAP, SIEM, forense, endpoint y más.', url:'https://cyberdefenders.org', color:'#f59e0b', emoji:'🟡', nivel:'Intermedio — Avanzado', gratis:true, rutas:['Threat Hunting','Malware Analysis','Network Forensics','Endpoint Forensics'] },
  { nombre:'LetsDefend', desc:'Plataforma SOC simulada. Gestiona alertas reales como si fueras analista L1/L2 en empresa.', url:'https://letsdefend.io', color:'#8b5cf6', emoji:'🟣', nivel:'Todos los niveles', gratis:true, rutas:['SOC Analyst','Incident Responder','Malware Analysis','Threat Intelligence'] },
  { nombre:'SANS Institute', desc:'El estándar de oro. Certificaciones GIAC reconocidas mundialmente por Fortune 500.', url:'https://sans.org', color:'#dc2626', emoji:'🔴', nivel:'Todos los niveles', gratis:false, rutas:['SEC504 GCIH','FOR508 GCFE','SEC555 GCED','FOR610 GREM'] },
];

const CERTIFICACIONES = [
  { nombre:'CompTIA Security+', org:'CompTIA', desc:'La cert de entrada más reconocida. Imprescindible para L1 SOC. Requerida por el DoD.', color:'#ef4444', dificultad:'Fácil', precio:'~380€', tiempo:'3-6 meses', credly:true, url:'https://comptia.org/certifications/security' },
  { nombre:'CompTIA CySA+', org:'CompTIA', desc:'Cybersecurity Analyst. Específica para analistas SOC. Muy valorada por empresas.', color:'#f97316', dificultad:'Medio', precio:'~380€', tiempo:'6-9 meses', credly:true, url:'https://comptia.org/certifications/cybersecurity-analyst' },
  { nombre:'BTL1', org:'Security Blue Team', desc:'Blue Team Level 1. Práctica y reconocida en el sector SOC europeo.', color:'#0ea5e9', dificultad:'Medio', precio:'~200€', tiempo:'3-6 meses', credly:true, url:'https://securityblue.team/btl1' },
  { nombre:'SC-200', org:'Microsoft', desc:'Cert oficial de Microsoft para Sentinel. Muy demandada en empresas Azure.', color:'#0078d4', dificultad:'Medio', precio:'~165€', tiempo:'3-6 meses', credly:true, url:'https://learn.microsoft.com/certifications/security-operations-analyst' },
  { nombre:'eJPT', org:'eLearnSecurity', desc:'Junior Penetration Tester. Buena base de red team para mejorar la detección.', color:'#0891b2', dificultad:'Fácil', precio:'~200€', tiempo:'2-4 meses', credly:false, url:'https://elearnsecurity.com/product/ejpt-certification' },
  { nombre:'OSCP', org:'Offensive Security', desc:'La cert más respetada del sector. Examen de 24h práctico. Para L3+.', color:'#dc2626', dificultad:'Difícil', precio:'~1499€', tiempo:'12-18 meses', credly:false, url:'https://www.offsec.com/courses/pen-200' },
];

function TeoriaRender({ texto, color }) {
  const T2 = '#374151';
  const lineas = texto.split('\n');
  const bloques = [];
  let parrafo = [];

  const flushP = () => { if (parrafo.length) { bloques.push({tipo:'p', texto:parrafo.join(' ')}); parrafo = []; } };

  for (const raw of lineas) {
    const l = raw.trim();
    if (!l) { flushP(); continue; }
    if (l === l.toUpperCase() && l.length > 4 && l.length < 80 && /[A-ZÁÉÍÓÚ]/.test(l) && !l.startsWith('-') && !l.startsWith('🔴') && !l.startsWith('🟠') && !l.startsWith('🟡') && !l.startsWith('🟢')) {
      flushP(); bloques.push({tipo:'h', texto:l}); continue;
    }
    if (/^[-•]\s/.test(l) || /^🔴|^🟠|^🟡|^🟢/.test(l)) {
      flushP(); bloques.push({tipo:'li', texto:l.replace(/^[-•]\s*/,'')}); continue;
    }
    if (/^(import |def |for |with |index=|nmap |\w+ = )/.test(l)) {
      flushP(); bloques.push({tipo:'code', texto:l}); continue;
    }
    parrafo.push(l);
  }
  flushP();

  const grouped = [];
  let liGroup = null, codeGroup = null;
  for (const b of bloques) {
    if (b.tipo === 'li') {
      if (!liGroup) { liGroup = {tipo:'lista', items:[]}; grouped.push(liGroup); }
      liGroup.items.push(b.texto); codeGroup = null;
    } else if (b.tipo === 'code') {
      if (!codeGroup) { codeGroup = {tipo:'codigo', lineas:[]}; grouped.push(codeGroup); }
      codeGroup.lineas.push(b.texto); liGroup = null;
    } else {
      liGroup = null; codeGroup = null; grouped.push(b);
    }
  }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      {grouped.map((b,i) => {
        if (b.tipo==='p') return <p key={i} style={{fontSize:14,color:T2,lineHeight:1.85,margin:0}}>{b.texto}</p>;
        if (b.tipo==='h') return (
          <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 14px',borderRadius:9,background:`${color}08`,border:`1px solid ${color}20`,marginTop:4}}>
            <div style={{width:3,height:14,borderRadius:2,background:color,flexShrink:0}}/>
            <span style={{fontSize:11,fontWeight:700,color,letterSpacing:'1.5px'}}>{b.texto}</span>
          </div>
        );
        if (b.tipo==='lista') return (
          <div key={i} style={{display:'flex',flexDirection:'column',gap:5}}>
            {b.items.map((item,j) => {
              const isAlert = /^🔴|^🟠|^🟡|^🟢/.test(item);
              const itemColor = item.startsWith('🔴')?'#ef4444':item.startsWith('🟢')?'#059669':item.startsWith('🟠')?'#f97316':item.startsWith('🟡')?'#d97706':T2;
              return (
                <div key={j} style={{display:'flex',alignItems:'flex-start',gap:8,padding:isAlert?'7px 11px':'5px 0',borderRadius:isAlert?8:0,background:isAlert?`${itemColor}06`:undefined,border:isAlert?`1px solid ${itemColor}15`:undefined}}>
                  {!isAlert && <div style={{width:4,height:4,borderRadius:'50%',background:color,marginTop:9,flexShrink:0}}/>}
                  <span style={{fontSize:13,color:itemColor,lineHeight:1.7}}>{item}</span>
                </div>
              );
            })}
          </div>
        );
        if (b.tipo==='codigo') return (
          <div key={i} style={{borderRadius:10,background:'#0f172a',border:'1px solid #1e293b',overflow:'hidden'}}>
            <div style={{padding:'6px 14px',background:'rgba(79,70,229,0.1)',borderBottom:'1px solid #1e293b',display:'flex',gap:6}}>
              {['#ef4444','#f59e0b','#22c55e'].map((c,k)=><div key={k} style={{width:8,height:8,borderRadius:'50%',background:c+'aa'}}/>)}
              <span style={{fontSize:10,color:'#475569',fontFamily:'monospace',marginLeft:6}}>terminal</span>
            </div>
            <div style={{padding:'14px 16px'}}>
              {b.lineas.map((l,j)=><div key={j} style={{fontSize:12,color:'#a5b4fc',fontFamily:"'JetBrains Mono','Fira Code',monospace",lineHeight:1.8}}>{l}</div>)}
            </div>
          </div>
        );
        return null;
      })}
    </div>
  );
}

const CSS_TRAINING = BASE_CSS + `
  .tb:hover{color:#0f172a!important;}
  .lrow:hover{background:#f8f7ff!important;border-color:#c7d2fe!important;}
  .ccard:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,0.1)!important;}
  .pcard:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,0.08)!important;}
  .optb:hover{border-color:#a5b4fc!important;background:#f8f7ff!important;}
  .certcard:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,0.08)!important;}
`;

export default function TrainingPage() {
  const navigate    = useNavigate();
  const { user }    = useAuth();
  const avatarConfig = user?.avatar_config || null;
  const foto         = user?.foto_perfil || '';

  const [tab,           setTab]           = useState('cursos');
  const [cursoActivo,   setCursoActivo]   = useState(null);
  const [moduloActivo,  setModuloActivo]  = useState(null);
  const [leccionActiva, setLeccionActiva] = useState(null);
  const [fase,          setFase]          = useState('teoria');
  const [respuestas,    setRespuestas]    = useState({});
  const [enviado,       setEnviado]       = useState(false);
  const [completadas,   setCompletadas]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('sb_train_v2') || '[]'); } catch { return []; }
  });
  const [certificados, setCertificados] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sb_certs_v2') || '[]'); } catch { return []; }
  });
  const [certModal, setCertModal] = useState(null);

  const save = (comp, certs) => {
    setCompletadas(comp);   localStorage.setItem('sb_train_v2', JSON.stringify(comp));
    setCertificados(certs); localStorage.setItem('sb_certs_v2', JSON.stringify(certs));
  };

  const lComp   = mod  => mod.lecciones.filter(l => completadas.includes(`${mod.id}-${l.id}`)).length;
  const mDone   = mod  => mod.lecciones.length > 0 && lComp(mod) === mod.lecciones.length;
  const cPct    = curso => {
    const mods = curso.moduloIds.map(id => MODULOS.find(m => m.id === id));
    const t = mods.reduce((a,m) => a + m.lecciones.length, 0);
    const h = mods.reduce((a,m) => a + lComp(m), 0);
    return t > 0 ? Math.round((h/t)*100) : 0;
  };
  const cUnlock = curso => curso.id === 1 || CURSOS[curso.id-2].moduloIds.every(id => mDone(MODULOS.find(m => m.id === id)));
  const totalLec = MODULOS.reduce((a,m) => a + m.lecciones.length, 0);

  const iniciar = (leccion) => {
    setLeccionActiva(leccion); setFase('teoria'); setRespuestas({}); setEnviado(false);
  };

  const nota = () => {
    const pregs = leccionActiva?.preguntas || [];
    if (!pregs.length) return 100;
    let c = 0; pregs.forEach((p,i) => { if (respuestas[i] === p.correcta) c++; });
    return Math.round((c/pregs.length)*100);
  };

  const completar = () => {
    const key     = `${moduloActivo.id}-${leccionActiva.id}`;
    const nuevas  = completadas.includes(key) ? completadas : [...completadas, key];
    const todas   = moduloActivo.lecciones.map(l => `${moduloActivo.id}-${l.id}`);
    let nuevosCerts = [...certificados];
    if (todas.every(k => nuevas.includes(k)) && !certificados.find(c => c.moduloId === moduloActivo.id)) {
      const cert = { moduloId:moduloActivo.id, titulo:moduloActivo.certificado, fecha:new Date().toLocaleDateString('es-ES'), color:moduloActivo.color };
      nuevosCerts = [...certificados, cert];
      save(nuevas, nuevosCerts);
      setCertModal(cert);
    } else {
      save(nuevas, nuevosCerts);
      setLeccionActiva(null);
    }
  };

  // ── CERT MODAL ────────────────────────────────────────────────────────────
  if (certModal) return (
    <div style={{minHeight:'100vh',background:BG,display:'flex',alignItems:'center',justifyContent:'center',padding:24,fontFamily:'system-ui'}}>
      <style>{CSS_TRAINING}</style>
      <div style={{maxWidth:440,width:'100%',padding:'48px 40px',borderRadius:20,background:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 24px 80px rgba(0,0,0,0.12)',textAlign:'center',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,transparent,${certModal.color},transparent)`}}/>
        <div style={{width:64,height:64,borderRadius:'50%',background:`${certModal.color}12`,border:`1px solid ${certModal.color}25`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',fontSize:28}}>🏅</div>
        <p style={{fontSize:10,color:'#d97706',fontWeight:700,letterSpacing:'3px',marginBottom:14}}>CERTIFICADO DE COMPLETACIÓN</p>
        <h1 style={{fontSize:20,fontWeight:900,color:'#0f172a',marginBottom:8,letterSpacing:'-0.3px',lineHeight:1.3}}>{certModal.titulo}</h1>
        <p style={{fontSize:12,color:'#94a3b8',fontFamily:'monospace',marginBottom:28}}>SocBlast Platform · {certModal.fecha}</p>
        <div style={{display:'flex',gap:10}}>
          <button onClick={()=>{setCertModal(null);setLeccionActiva(null);}} style={{flex:1,padding:14,borderRadius:100,background:`linear-gradient(135deg,${ACC},#6366f1)`,border:'none',color:'#fff',fontWeight:700,fontSize:14,cursor:'pointer'}}>Continuar →</button>
          <button onClick={()=>{setCertModal(null);navigate('/perfil');}} style={{flex:1,padding:14,borderRadius:100,background:'#f8f7ff',border:'1px solid #e8eaf0',color:'#374151',fontSize:14,cursor:'pointer',fontWeight:600}}>Ver en perfil</button>
        </div>
      </div>
    </div>
  );

  // ── VISTA DE LECCIÓN ──────────────────────────────────────────────────────
  if (leccionActiva && moduloActivo) {
    const pregs    = leccionActiva.preguntas || [];
    const n        = nota();
    const modColor = moduloActivo.color;
    return (
      <div style={{minHeight:'100vh',background:BG,fontFamily:'system-ui'}}>
        <style>{CSS_TRAINING}</style>
        <nav style={{position:'sticky',top:0,zIndex:50,height:54,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 32px',background:'rgba(255,255,255,0.94)',backdropFilter:'blur(20px)',borderBottom:'1px solid #e8eaf0',boxShadow:'0 1px 16px rgba(79,70,229,0.07)'}}>
          <button onClick={()=>setLeccionActiva(null)} style={{display:'flex',alignItems:'center',gap:6,background:'none',border:'1px solid #e8eaf0',color:'#374151',padding:'5px 14px',borderRadius:8,fontSize:13,cursor:'pointer',fontWeight:500}}>← Volver</button>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:modColor}}/>
            <span style={{fontSize:13,fontWeight:600,color:'#0f172a',maxWidth:400,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{leccionActiva.titulo}</span>
            {leccionActiva.esCaso && <span style={{fontSize:10,padding:'2px 8px',borderRadius:100,background:'rgba(239,68,68,0.08)',color:'#ef4444',fontWeight:700,border:'1px solid rgba(239,68,68,0.15)'}}>CASO PRÁCTICO</span>}
          </div>
          <span style={{fontSize:12,fontWeight:700,color:'#059669',padding:'4px 12px',borderRadius:8,background:'rgba(5,150,105,0.08)',border:'1px solid rgba(5,150,105,0.2)'}}>+{leccionActiva.xp} XP</span>
        </nav>
        <div style={{maxWidth:760,margin:'0 auto',padding:'32px 24px 80px'}}>
          <div style={{display:'flex',gap:4,marginBottom:28,padding:4,background:'#fff',borderRadius:12,border:'1px solid #e8eaf0',boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>
            {['teoria','practica'].map(f=>(
              <button key={f} onClick={()=>f==='teoria'&&setFase('teoria')}
                style={{flex:1,padding:10,borderRadius:9,fontSize:11,fontWeight:700,letterSpacing:'1.5px',cursor:'pointer',background:fase===f?modColor:'none',color:fase===f?'#fff':'#94a3b8',border:'none',transition:'all .15s'}}>
                {f==='teoria'?'TEORÍA':leccionActiva.esCaso?'CASO PRÁCTICO':'TEST'}
              </button>
            ))}
          </div>

          {fase==='teoria' && (
            <div className="fu">
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:22}}>
                <div style={{width:3,height:24,borderRadius:2,background:modColor}}/>
                <h2 style={{fontSize:20,fontWeight:800,color:'#0f172a',letterSpacing:'-0.4px'}}>{leccionActiva.titulo}</h2>
              </div>
              <div style={{marginBottom:24}}><TeoriaRender texto={leccionActiva.teoria} color={modColor}/></div>
              <button onClick={()=>setFase('practica')}
                style={{width:'100%',padding:15,borderRadius:12,background:`linear-gradient(135deg,${modColor},${modColor}cc)`,border:'none',color:'#fff',fontWeight:700,fontSize:15,cursor:'pointer',boxShadow:`0 4px 16px ${modColor}30`}}>
                {leccionActiva.esCaso?'Ir al Caso Práctico →':'Ir al Test →'}
              </button>
            </div>
          )}

          {fase==='practica' && (
            <div className="fu">
              <div style={{padding:'14px 18px',borderRadius:11,background:leccionActiva.esCaso?'rgba(239,68,68,0.05)':'rgba(79,70,229,0.05)',border:`1px solid ${leccionActiva.esCaso?'rgba(239,68,68,0.2)':'rgba(79,70,229,0.15)'}`,marginBottom:22,display:'flex',alignItems:'center',gap:12}}>
                <span style={{fontSize:18}}>{leccionActiva.esCaso?'⚡':'📝'}</span>
                <div>
                  <p style={{fontSize:11,fontWeight:700,color:'#0f172a',letterSpacing:'1px'}}>{leccionActiva.esCaso?'CASO PRÁCTICO — TOMA DE DECISIONES':'TEST DE CONOCIMIENTOS'}</p>
                  <p style={{fontSize:11,color:'#94a3b8',fontFamily:'monospace'}}>{pregs.length} preguntas · Mínimo 60% para superar</p>
                </div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:16}}>
                {pregs.map((p,i)=>(
                  <div key={i} style={{borderRadius:14,background:'#fff',border:'1px solid #e8eaf0',overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
                    {leccionActiva.esCaso && <div style={{height:2,background:'linear-gradient(90deg,rgba(239,68,68,0.5),transparent)'}}/>}
                    <div style={{padding:'18px 20px'}}>
                      <div style={{display:'flex',gap:10,alignItems:'flex-start',marginBottom:14}}>
                        <div style={{width:24,height:24,borderRadius:7,background:`${modColor}10`,border:`1px solid ${modColor}20`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          <span style={{fontSize:10,fontWeight:700,color:modColor}}>{i+1}</span>
                        </div>
                        <p style={{fontSize:14,color:'#0f172a',fontWeight:500,lineHeight:1.65}}>{p.pregunta}</p>
                      </div>
                      <div style={{display:'flex',flexDirection:'column',gap:6}}>
                        {p.opciones.map((op,j)=>{
                          let bg='#f8f7ff', border='#e8eaf0', color='#374151', icon=null;
                          if (enviado) {
                            if (j===p.correcta)          { bg='rgba(5,150,105,0.06)'; border='rgba(5,150,105,0.25)'; color='#059669'; icon='✓'; }
                            else if (respuestas[i]===j)  { bg='rgba(239,68,68,0.06)'; border='rgba(239,68,68,0.2)';  color='#ef4444'; icon='✗'; }
                          } else if (respuestas[i]===j)  { bg=`${modColor}08`; border=`${modColor}40`; color=modColor; }
                          return (
                            <button key={j} className="optb" onClick={()=>!enviado&&setRespuestas(r=>({...r,[i]:j}))}
                              style={{padding:'10px 14px',borderRadius:9,background:bg,border:`1px solid ${border}`,color,fontSize:13,cursor:enviado?'default':'pointer',textAlign:'left',display:'flex',alignItems:'center',gap:10,transition:'all .15s',fontFamily:'inherit'}}>
                              <div style={{width:20,height:20,borderRadius:'50%',border:`1.5px solid ${border}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:10,fontWeight:700,color}}>
                                {icon||String.fromCharCode(65+j)}
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
              {!enviado ? (
                <button onClick={()=>setEnviado(true)}
                  style={{width:'100%',padding:15,borderRadius:12,background:`linear-gradient(135deg,${ACC},#6366f1)`,border:'none',color:'#fff',fontWeight:700,fontSize:15,cursor:'pointer',boxShadow:'0 4px 16px rgba(79,70,229,0.3)',fontFamily:'inherit'}}>
                  Enviar respuestas
                </button>
              ) : (
                <>
                  <div style={{padding:'20px 24px',borderRadius:13,background:n>=60?'rgba(5,150,105,0.05)':'rgba(239,68,68,0.05)',border:`1px solid ${n>=60?'rgba(5,150,105,0.2)':'rgba(239,68,68,0.15)'}`,marginBottom:12,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div>
                      <p style={{fontSize:40,fontWeight:900,color:n>=60?'#059669':'#ef4444',lineHeight:1,fontFamily:'monospace'}}>{n}%</p>
                      <p style={{fontSize:12,color:'#94a3b8',marginTop:4,fontFamily:'monospace'}}>{n>=60?'Lección superada ✓':'Mínimo 60% requerido'}</p>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <p style={{fontSize:20,fontWeight:700,color:n>=60?'#059669':'#94a3b8',fontFamily:'monospace'}}>+{n>=60?leccionActiva.xp:0}</p>
                      <p style={{fontSize:11,color:'#94a3b8'}}>XP</p>
                    </div>
                  </div>
                  {n>=60 ? (
                    <button onClick={completar} style={{width:'100%',padding:15,borderRadius:12,background:'rgba(5,150,105,0.08)',border:'1px solid rgba(5,150,105,0.25)',color:'#059669',fontWeight:700,fontSize:15,cursor:'pointer',fontFamily:'inherit'}}>
                      Completar lección (+{leccionActiva.xp} XP) →
                    </button>
                  ) : (
                    <button onClick={()=>{setEnviado(false);setRespuestas({});setFase('teoria');}} style={{width:'100%',padding:15,borderRadius:12,background:'#f8f7ff',border:'1px solid #e8eaf0',color:'#374151',fontWeight:600,fontSize:15,cursor:'pointer',fontFamily:'inherit'}}>
                      Revisar teoría e intentar de nuevo
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── MÓDULOS DE UN CURSO ───────────────────────────────────────────────────
  if (cursoActivo) {
    const mods = cursoActivo.moduloIds.map(id => MODULOS.find(m => m.id === id));
    return (
      <div style={{minHeight:'100vh',background:BG,fontFamily:'system-ui'}}>
        <style>{CSS_TRAINING}</style>
        <nav style={{position:'sticky',top:0,zIndex:50,height:54,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 32px',background:'rgba(255,255,255,0.94)',backdropFilter:'blur(20px)',borderBottom:'1px solid #e8eaf0',boxShadow:'0 1px 16px rgba(79,70,229,0.07)'}}>
          <button onClick={()=>{setCursoActivo(null);setModuloActivo(null);}} style={{display:'flex',alignItems:'center',gap:6,background:'none',border:'1px solid #e8eaf0',color:'#374151',padding:'5px 14px',borderRadius:8,fontSize:13,cursor:'pointer',fontWeight:500}}>← Training</button>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:16}}>{cursoActivo.icono}</span>
            <span style={{fontSize:14,fontWeight:700,color:'#0f172a'}}>{cursoActivo.titulo}</span>
          </div>
          <span style={{fontSize:12,fontWeight:700,color:cursoActivo.color,padding:'4px 12px',borderRadius:8,background:`${cursoActivo.color}08`,border:`1px solid ${cursoActivo.color}20`}}>{cPct(cursoActivo)}% completado</span>
        </nav>
        <div style={{maxWidth:920,margin:'0 auto',padding:'32px 24px 64px'}}>
          <div style={{padding:'22px 28px',borderRadius:16,background:'#fff',border:'1px solid #e8eaf0',marginBottom:24,boxShadow:'0 2px 12px rgba(79,70,229,0.06)',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,transparent,${cursoActivo.color},transparent)`}}/>
            <div style={{display:'flex',alignItems:'center',gap:16}}>
              <div style={{width:52,height:52,borderRadius:14,background:`${cursoActivo.color}10`,border:`1px solid ${cursoActivo.color}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{cursoActivo.icono}</div>
              <div style={{flex:1}}>
                <h2 style={{fontSize:20,fontWeight:800,color:'#0f172a',marginBottom:2}}>{cursoActivo.titulo}</h2>
                <p style={{fontSize:13,color:'#64748b'}}>{cursoActivo.subtitulo} · {cursoActivo.nivel} · {cursoActivo.duracion} · {cursoActivo.xp.toLocaleString()} XP</p>
              </div>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:24}}>
            {mods.map(mod => {
              const done  = mDone(mod);
              const comp  = lComp(mod);
              const total = mod.lecciones.length;
              const pct   = total > 0 ? (comp/total)*100 : 0;
              const cert  = certificados.find(c => c.moduloId === mod.id);
              return (
                <div key={mod.id} className="ccard" onClick={()=>setModuloActivo(moduloActivo?.id===mod.id?null:mod)}
                  style={{padding:'20px',borderRadius:14,background:'#fff',border:done?'1px solid rgba(5,150,105,0.2)':`1px solid ${mod.color}20`,cursor:'pointer',position:'relative',overflow:'hidden',boxShadow:'0 2px 10px rgba(0,0,0,0.05)',transition:'all .2s'}}>
                  <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:done?'linear-gradient(90deg,transparent,#059669,transparent)':`linear-gradient(90deg,transparent,${mod.color},transparent)`}}/>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontSize:18}}>{mod.icono}</span>
                      <span style={{fontSize:10,color:mod.color,fontFamily:'monospace',fontWeight:700,letterSpacing:'1px'}}>MÓD {mod.num}</span>
                    </div>
                    <div style={{display:'flex',gap:5,alignItems:'center'}}>
                      {cert&&<span style={{fontSize:12}}>🏅</span>}
                      <span style={{fontSize:10,padding:'2px 8px',borderRadius:5,background:done?'rgba(5,150,105,0.08)':`${mod.color}10`,color:done?'#059669':mod.color,fontWeight:700,border:`1px solid ${done?'rgba(5,150,105,0.2)':mod.color+'25'}`}}>{done?'DONE':'OPEN'}</span>
                    </div>
                  </div>
                  <h3 style={{fontSize:14,fontWeight:700,color:'#0f172a',marginBottom:4,lineHeight:1.4}}>{mod.titulo}</h3>
                  <p style={{fontSize:12,color:'#64748b',marginBottom:12,lineHeight:1.6}}>{mod.descripcion}</p>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                    <span style={{fontSize:11,color:done?'#059669':mod.color,fontWeight:700,fontFamily:'monospace'}}>+{mod.xp} XP</span>
                    <span style={{fontSize:10,color:'#94a3b8',fontFamily:'monospace'}}>{comp}/{total} lecciones</span>
                  </div>
                  <div style={{height:4,borderRadius:2,background:'#e8eaf0',overflow:'hidden'}}>
                    <div style={{width:`${pct}%`,height:'100%',borderRadius:2,background:done?'#059669':mod.color,transition:'width .8s ease'}}/>
                  </div>
                </div>
              );
            })}
          </div>
          {moduloActivo && cursoActivo.moduloIds.includes(moduloActivo.id) && (
            <div style={{padding:'22px 24px',borderRadius:16,background:'#fff',border:`1px solid ${moduloActivo.color}20`,boxShadow:'0 4px 16px rgba(0,0,0,0.06)',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,transparent,${moduloActivo.color},transparent)`}}/>
              <div style={{marginBottom:16}}>
                <h3 style={{fontSize:16,fontWeight:700,color:'#0f172a',marginBottom:3}}>{moduloActivo.titulo}</h3>
                <p style={{fontSize:11,color:'#94a3b8',fontFamily:'monospace'}}>{moduloActivo.certificado}</p>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {moduloActivo.lecciones.map(lec => {
                  const done = completadas.includes(`${moduloActivo.id}-${lec.id}`);
                  return (
                    <div key={lec.id} className="lrow" onClick={()=>iniciar(lec)}
                      style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',borderRadius:10,background:done?'rgba(5,150,105,0.04)':'#f8f7ff',border:done?'1px solid rgba(5,150,105,0.12)':'1px solid #e8eaf0',cursor:'pointer',position:'relative',overflow:'hidden',transition:'all .15s'}}>
                      {done && <div style={{position:'absolute',left:0,top:0,bottom:0,width:3,background:'#059669'}}/>}
                      <div style={{width:32,height:32,borderRadius:9,background:done?'rgba(5,150,105,0.07)':`${moduloActivo.color}08`,border:`1px solid ${done?'rgba(5,150,105,0.15)':moduloActivo.color+'20'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        <span style={{fontSize:11,fontWeight:700,color:done?'#059669':moduloActivo.color,fontFamily:'monospace'}}>{done?'✓':lec.id}</span>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:2}}>
                          <span style={{fontSize:13,color:done?'#059669':'#0f172a',fontWeight:500}}>{lec.titulo}</span>
                          {lec.esCaso&&<span style={{fontSize:9,padding:'2px 7px',borderRadius:5,background:'rgba(239,68,68,0.07)',color:'#ef4444',border:'1px solid rgba(239,68,68,0.15)',fontFamily:'monospace',fontWeight:700}}>CASO</span>}
                        </div>
                        <span style={{fontSize:10,color:'#94a3b8',fontFamily:'monospace'}}>+{lec.xp} XP</span>
                      </div>
                      <span style={{fontSize:16,color:'#c7d2fe'}}>›</span>
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

  // ── VISTA PRINCIPAL ───────────────────────────────────────────────────────
  const totalXP = MODULOS.reduce((a,m) => a + m.xp, 0);

  return (
    <div style={{minHeight:'100vh',background:BG,fontFamily:'system-ui',color:'#0f172a'}}>
      <style>{CSS_TRAINING}</style>
      <SBNav user={user} avatarConfig={avatarConfig} foto={foto} activePage="/training" navigate={navigate}/>

      {/* HERO */}
      <div style={{background:'linear-gradient(135deg,#0f4c81 0%,#1a6ebd 55%,#1e40af 100%)',padding:'52px 32px 60px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-80,right:-80,width:420,height:420,borderRadius:'50%',background:'rgba(255,255,255,0.04)',pointerEvents:'none'}}/>
        <div style={{position:'absolute',bottom:-60,left:'30%',width:300,height:300,borderRadius:'50%',background:'rgba(255,255,255,0.03)',pointerEvents:'none'}}/>
        <div style={{maxWidth:880,margin:'0 auto',position:'relative'}}>
          <div className="fu" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'4px 14px',borderRadius:100,background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',marginBottom:22}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:'#4ade80',animation:'pulse 2s infinite'}}/>
            <span style={{fontSize:11,color:'rgba(255,255,255,0.9)',fontWeight:700,letterSpacing:'2px'}}>SOC TRAINING PLATFORM</span>
          </div>
          <h1 className="fu" style={{fontSize:40,fontWeight:900,color:'#fff',letterSpacing:'-1px',marginBottom:14,lineHeight:1.1}}>Conviértete en<br/><span style={{color:'#7dd3fc'}}>analista SOC profesional.</span></h1>
          <p className="fu" style={{fontSize:15,color:'rgba(255,255,255,0.7)',lineHeight:1.75,maxWidth:540,marginBottom:32}}>{MODULOS.length} módulos · 3 cursos · {totalXP.toLocaleString()} XP disponibles · Casos prácticos reales · Certificados verificables</p>
          <div className="fu" style={{display:'flex',alignItems:'center',gap:12,maxWidth:460}}>
            <div style={{flex:1,height:6,borderRadius:3,background:'rgba(255,255,255,0.2)',overflow:'hidden'}}>
              <div style={{width:`${totalLec>0?(completadas.length/totalLec)*100:0}%`,height:'100%',borderRadius:3,background:'linear-gradient(90deg,#4ade80,#22c55e)',transition:'width .5s'}}/>
            </div>
            <span style={{fontSize:12,color:'rgba(255,255,255,0.6)',fontFamily:'monospace',flexShrink:0}}>{completadas.length}/{totalLec} lecciones</span>
          </div>
        </div>
      </div>

      {/* TABS STICKY */}
      <div style={{background:'#fff',borderBottom:'1px solid #e8eaf0',position:'sticky',top:0,zIndex:50}}>
        <div style={{maxWidth:880,margin:'0 auto',display:'flex',padding:'0 32px'}}>
          {[['cursos','📚 Cursos SocBlast'],['plataformas','🌐 Plataformas'],['certificaciones','🏅 Certificaciones']].map(([id,label])=>(
            <button key={id} className="tb" onClick={()=>setTab(id)}
              style={{padding:'16px 22px',border:'none',cursor:'pointer',fontSize:13,fontWeight:700,background:'transparent',color:tab===id?'#0f172a':'#64748b',borderBottom:tab===id?`2.5px solid ${ACC}`:'2.5px solid transparent',transition:'all .2s'}}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{maxWidth:880,margin:'0 auto',padding:'36px 32px 80px'}}>

        {/* TAB CURSOS */}
        {tab==='cursos' && (
          <div>
            {certificados.length>0&&(
              <div style={{padding:'14px 20px',borderRadius:14,background:'#fff',border:'1px solid rgba(217,119,6,0.2)',marginBottom:24,boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
                <p style={{fontSize:10,color:'#d97706',fontWeight:700,letterSpacing:'2px',marginBottom:10,fontFamily:'monospace'}}>TUS CERTIFICADOS</p>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {certificados.map((cert,i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:6,padding:'5px 12px',borderRadius:8,background:'rgba(217,119,6,0.06)',border:'1px solid rgba(217,119,6,0.15)'}}>
                      <span style={{fontSize:12}}>🏅</span>
                      <span style={{fontSize:11,color:'#d97706',fontWeight:600}}>{cert.titulo}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{marginBottom:24}}>
              <h2 style={{fontSize:22,fontWeight:800,marginBottom:6}}>Cursos SocBlast</h2>
              <p style={{fontSize:14,color:'#64748b'}}>9 módulos, 3 cursos con casos prácticos reales, teoría estructurada, test de comprensión y certificados verificables.</p>
            </div>
            <div className="fu" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
              {CURSOS.map(curso => {
                const unlock = cUnlock(curso);
                const pct    = cPct(curso);
                const done   = pct === 100;
                return (
                  <div key={curso.id} className={unlock?'ccard':''} onClick={()=>{if(!unlock)return;setCursoActivo(curso);setModuloActivo(null);}}
                    style={{borderRadius:20,background:'#fff',border:done?'1px solid rgba(5,150,105,0.2)':unlock?`1px solid ${curso.color}20`:'1px solid #e8eaf0',cursor:unlock?'pointer':'not-allowed',opacity:unlock?1:.4,overflow:'hidden',boxShadow:unlock?'0 4px 20px rgba(0,0,0,0.07)':'none',transition:'all .2s'}}>
                    <div style={{height:105,background:unlock?`linear-gradient(135deg,${curso.color}12,${curso.color}04)`:'#f8f7ff',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden'}}>
                      <div style={{position:'absolute',top:-15,right:-15,fontSize:90,opacity:.07}}>{curso.icono}</div>
                      <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:unlock?`linear-gradient(90deg,transparent,${curso.color},transparent)`:undefined}}/>
                      <div style={{width:56,height:56,borderRadius:16,background:`${curso.color}12`,border:`1px solid ${curso.color}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,position:'relative',zIndex:1}}>{curso.icono}</div>
                      <div style={{position:'absolute',top:10,right:12}}>
                        <span style={{fontSize:10,padding:'2px 8px',borderRadius:5,fontWeight:700,background:!unlock?'#f1f5f9':done?'rgba(5,150,105,0.08)':`${curso.color}10`,color:!unlock?'#94a3b8':done?'#059669':curso.color,border:`1px solid ${!unlock?'#e8eaf0':done?'rgba(5,150,105,0.2)':curso.color+'25'}`}}>
                          {!unlock?'🔒 LOCKED':done?'✓ DONE':'OPEN'}
                        </span>
                      </div>
                      <div style={{position:'absolute',bottom:10,left:12}}>
                        <span style={{fontSize:10,padding:'2px 8px',borderRadius:6,background:'rgba(0,0,0,0.06)',color:'#64748b',border:'1px solid rgba(0,0,0,0.06)'}}>{curso.nivel}</span>
                      </div>
                    </div>
                    <div style={{padding:'18px 20px 22px'}}>
                      <p style={{fontSize:10,color:curso.color,fontWeight:700,letterSpacing:'1.5px',marginBottom:5,fontFamily:'monospace'}}>CURSO {String(curso.id).padStart(2,'0')}</p>
                      <h3 style={{fontSize:17,fontWeight:800,color:'#0f172a',marginBottom:3,letterSpacing:'-0.3px'}}>{curso.titulo}</h3>
                      <p style={{fontSize:12,color:curso.color,marginBottom:12,fontStyle:'italic'}}>{curso.subtitulo}</p>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:14}}>
                        {[{l:'Módulos',v:curso.moduloIds.length},{l:'Duración',v:curso.duracion}].map((s,i)=>(
                          <div key={i} style={{padding:'8px 10px',borderRadius:8,background:'#f8f7ff',border:'1px solid #e8eaf0',textAlign:'center'}}>
                            <p style={{fontSize:10,color:'#94a3b8',marginBottom:2}}>{s.l}</p>
                            <p style={{fontSize:12,fontWeight:700,color:'#374151',fontFamily:'monospace'}}>{s.v}</p>
                          </div>
                        ))}
                      </div>
                      <div style={{marginBottom:14}}>
                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                          <span style={{fontSize:11,color:'#94a3b8',fontFamily:'monospace'}}>Progreso</span>
                          <span style={{fontSize:11,color:done?'#059669':curso.color,fontWeight:700,fontFamily:'monospace'}}>{pct}%</span>
                        </div>
                        <div style={{height:5,borderRadius:3,background:'#e8eaf0',overflow:'hidden'}}>
                          <div style={{width:`${pct}%`,height:'100%',borderRadius:3,background:done?'#059669':curso.color,transition:'width .8s ease'}}/>
                        </div>
                      </div>
                      {unlock&&<p style={{fontSize:12,color:curso.color,fontWeight:700,fontFamily:'monospace'}}>{done?'Ver certificados →':'Comenzar →'}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB PLATAFORMAS */}
        {tab==='plataformas' && (
          <div>
            <div style={{marginBottom:28}}>
              <h2 style={{fontSize:22,fontWeight:800,marginBottom:6}}>Plataformas de práctica</h2>
              <p style={{fontSize:14,color:'#64748b'}}>Las mejores plataformas para practicar Blue Team. Laboratorios reales, máquinas virtuales y rutas guiadas reconocidas por empresas.</p>
            </div>
            <div style={{background:'linear-gradient(135deg,#0f4c81,#1e40af)',borderRadius:16,padding:'18px 24px',marginBottom:24,display:'flex',alignItems:'center',gap:14}}>
              <div style={{fontSize:24,flexShrink:0}}>💡</div>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:'#fff',marginBottom:3}}>Ruta recomendada para empezar</div>
                <div style={{fontSize:12,color:'rgba(255,255,255,0.65)'}}>TryHackMe (SOC L1) → HackTheBox (SOC Analyst) → LetsDefend (práctica diaria) → CyberDefenders (labs avanzados)</div>
              </div>
            </div>
            <div className="fu" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
              {PLATAFORMAS.map((p,i)=>(
                <div key={i} className="pcard" onClick={()=>window.open(p.url,'_blank')}
                  style={{borderRadius:16,background:'#0f172a',border:'1px solid #1e293b',cursor:'pointer',overflow:'hidden',transition:'all .25s',display:'flex',flexDirection:'column'}}>
                  <div style={{padding:'22px 24px 16px',borderBottom:'1px solid #1e293b'}}>
                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12}}>
                      <div style={{display:'flex',alignItems:'center',gap:12}}>
                        <div style={{width:46,height:46,borderRadius:12,background:`${p.color}20`,border:`1.5px solid ${p.color}35`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{p.emoji}</div>
                        <div>
                          <div style={{fontSize:17,fontWeight:800,color:'#fff',marginBottom:4}}>{p.nombre}</div>
                          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                            <span style={{fontSize:10,padding:'2px 8px',borderRadius:4,background:p.gratis?'rgba(34,197,94,0.15)':'rgba(245,158,11,0.15)',color:p.gratis?'#4ade80':'#fbbf24',fontWeight:700}}>{p.gratis?'GRATIS':'DE PAGO'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p style={{fontSize:13,color:'rgba(255,255,255,0.55)',lineHeight:1.75,margin:0}}>{p.desc}</p>
                  </div>
                  <div style={{padding:'14px 24px',flex:1}}>
                    <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.25)',textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:8}}>Rutas disponibles</div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                      {p.rutas.map(r=><span key={r} style={{fontSize:11,padding:'3px 9px',borderRadius:5,background:`${p.color}12`,border:`1px solid ${p.color}25`,color:p.color,fontWeight:600}}>{r}</span>)}
                    </div>
                  </div>
                  <div style={{padding:'12px 24px',borderTop:'1px solid #1e293b',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <span style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>{p.nivel}</span>
                    <span style={{fontSize:12,fontWeight:800,color:p.color}}>Ir a {p.nombre} ↗</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginTop:20,padding:'16px 20px',borderRadius:12,background:'#fff',border:'1px solid #c7d2fe',display:'flex',alignItems:'center',gap:12}}>
              <span style={{fontSize:20}}>🔗</span>
              <div style={{flex:1}}>
                <p style={{fontSize:13,fontWeight:600,color:'#0f172a',marginBottom:2}}>Integraciones próximamente</p>
                <p style={{fontSize:12,color:'#64748b'}}>Conecta tu cuenta de TryHackMe y HackTheBox para que tus logros aparezcan en tu Analyst Card automáticamente.</p>
              </div>
              <span style={{fontSize:11,padding:'4px 12px',borderRadius:100,background:'#eef2ff',color:ACC,fontWeight:700,flexShrink:0,border:'1px solid #c7d2fe',whiteSpace:'nowrap'}}>Próximamente</span>
            </div>
          </div>
        )}

        {/* TAB CERTIFICACIONES */}
        {tab==='certificaciones' && (
          <div>
            <div style={{marginBottom:24}}>
              <h2 style={{fontSize:22,fontWeight:800,marginBottom:6}}>Ruta de certificaciones</h2>
              <p style={{fontSize:14,color:'#64748b'}}>Las certificaciones más valoradas por equipos SOC y reclutadores. Ordenadas de menor a mayor dificultad.</p>
            </div>
            <div style={{background:'#fff',borderRadius:14,border:'1px solid #e8eaf0',padding:'18px 22px',marginBottom:24,boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
              <div style={{fontSize:11,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:12}}>Ruta recomendada para analistas SOC</div>
              <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                {['Security+','CySA+','BTL1','SC-200','OSCP (opcional)'].map((c,i,arr)=>(
                  <React.Fragment key={c}>
                    <div style={{padding:'8px 16px',borderRadius:8,background:i<4?ACC:'#f1f5f9',border:`1px solid ${i<4?ACC:'#e2e8f0'}`,fontSize:13,fontWeight:700,color:i<4?'#fff':'#94a3b8'}}>{c}</div>
                    {i<arr.length-1&&<span style={{color:'#cbd5e1',fontSize:18}}>→</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="fu" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
              {CERTIFICACIONES.map((cert,i)=>{
                const niveles = {Fácil:'#059669',Medio:'#d97706',Difícil:'#dc2626'};
                const nc = niveles[cert.dificultad]||'#94a3b8';
                return(
                  <div key={i} className="certcard" onClick={()=>window.open(cert.url,'_blank')}
                    style={{borderRadius:14,background:'#fff',border:'1px solid #e8eaf0',padding:'22px',transition:'all .2s',cursor:'pointer',position:'relative',overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,0.04)',display:'flex',flexDirection:'column'}}>
                    <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:cert.color}}/>
                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:10}}>
                      <div>
                        <div style={{fontSize:15,fontWeight:800,color:'#0f172a',marginBottom:2}}>{cert.nombre}</div>
                        <div style={{fontSize:12,color:'#64748b'}}>{cert.org}</div>
                      </div>
                      <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:5}}>
                        <span style={{fontSize:10,padding:'2px 8px',borderRadius:100,background:nc+'15',color:nc,fontWeight:700,flexShrink:0,border:`1px solid ${nc}25`}}>{cert.dificultad}</span>
                        {cert.credly&&<span style={{fontSize:9,padding:'2px 7px',borderRadius:4,background:'rgba(217,119,6,0.08)',color:'#d97706',fontWeight:700,border:'1px solid rgba(217,119,6,0.2)',flexShrink:0}}>Credly ✓</span>}
                      </div>
                    </div>
                    <p style={{fontSize:12,color:'#64748b',lineHeight:1.7,marginBottom:16,flex:1}}>{cert.desc}</p>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:14}}>
                      {[['Precio',cert.precio],['Preparación',cert.tiempo]].map(([l,v])=>(
                        <div key={l} style={{padding:'8px 10px',borderRadius:8,background:'#f8fafc',border:'1px solid #e2e8f0',textAlign:'center'}}>
                          <div style={{fontSize:10,color:'#94a3b8',marginBottom:2,fontFamily:'monospace'}}>{l.toUpperCase()}</div>
                          <div style={{fontSize:12,fontWeight:700,color:'#0f172a'}}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'9px 0',borderRadius:8,border:`1.5px solid ${cert.color}`,fontSize:12,fontWeight:700,color:cert.color}}>
                      Ver certificación ↗
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{marginTop:20,padding:'16px 20px',borderRadius:12,background:'#fff',border:'1px solid #c7d2fe',display:'flex',alignItems:'center',gap:12}}>
              <span style={{fontSize:20}}>🏅</span>
              <div style={{flex:1}}>
                <p style={{fontSize:13,fontWeight:600,color:'#0f172a',marginBottom:2}}>Añade tus certificaciones a tu Analyst Card</p>
                <p style={{fontSize:12,color:'#64748b'}}>Las certificaciones verificadas aparecerán en tu perfil con badge ✓. Las de Credly se verifican automáticamente.</p>
              </div>
              <button onClick={()=>navigate('/perfil')} style={{padding:'8px 16px',borderRadius:100,background:ACC,border:'none',color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',flexShrink:0,whiteSpace:'nowrap'}}>Ir a perfil</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}