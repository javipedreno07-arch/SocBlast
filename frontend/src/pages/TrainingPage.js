import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SBNav, ACC, BG, BASE_CSS } from './SBLayout';
import { useAuth } from '../context/AuthContext';

// ── DATOS ────────────────────────────────────────────────────────────────────
const MODULOS = [
  {
    id:1,num:'01',titulo:'Fundamentos de Ciberseguridad y SOC',
    descripcion:'Triada CIA, tipos de ataques, actores de amenaza y el rol del analista SOC en la empresa moderna.',
    color:'#4f46e5',icono:'🛡️',xp:200,duracion:'2h 30min',
    temas:['Triada CIA','Tipos de ataques','Actores de amenaza','Roles en el SOC','Herramientas del SOC'],
    certificado:'Analista SOC — Fundamentos',
    lecciones:[
      {id:1,titulo:'Introducción a la Ciberseguridad',xp:35,duracion:'20min',
       teoria:`La ciberseguridad protege sistemas, redes y datos frente a ataques digitales.

TRIADA CIA — EL NÚCLEO DE TODA LA SEGURIDAD:
- Confidencialidad — Solo los autorizados acceden a la información
- Integridad — La información no se altera sin autorización
- Disponibilidad — Los sistemas están accesibles cuando se necesitan

TIPOS DE ATAQUES MÁS COMUNES:
- Malware — Software malicioso (virus, ransomware, trojan, spyware)
- Phishing — Suplantación de identidad para robar credenciales
- DDoS — Saturar un servicio con tráfico masivo hasta tumbarlo
- Man-in-the-Middle — Interceptar comunicaciones entre dos partes
- SQL Injection — Manipular consultas a bases de datos

ACTORES DE AMENAZA:
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
       ]},
      {id:2,titulo:'Redes para SOC — Fundamentos críticos',xp:40,duracion:'25min',
       teoria:`Las redes son el campo de batalla del analista SOC. Debes dominarlas.

MODELO OSI — 7 CAPAS:
- Física — Cables y señales eléctricas
- Enlace — Direcciones MAC, switches
- Red — Direcciones IP, enrutamiento
- Transporte — TCP/UDP, puertos
- Sesión — Gestión de sesiones
- Presentación — Cifrado y formato
- Aplicación — HTTP, DNS, FTP, SMB

PROTOCOLOS CLAVE EN SOC:
- HTTP/HTTPS (80/443) — Tráfico web
- DNS (53) — Resolución de nombres, muy abusado por atacantes
- SMB (445) — Compartir archivos Windows, objetivo frecuente
- RDP (3389) — Escritorio remoto, vector de ataque habitual
- SSH (22) — Acceso remoto seguro

CONCEPTOS ESENCIALES:
- IPs privadas: 192.168.x.x · 10.x.x.x · 172.16-31.x.x
- TCP — Fiable, usa 3-way handshake, confirma entrega
- UDP — Rápido, sin confirmación, usado en DNS y streaming`,
       preguntas:[
         {pregunta:'¿En qué capa OSI opera el protocolo IP?',opciones:['Capa 2 — Enlace','Capa 3 — Red','Capa 4 — Transporte','Capa 7 — Aplicación'],correcta:1},
         {pregunta:'¿Qué puerto usa SMB?',opciones:['80','443','445','3389'],correcta:2},
         {pregunta:'¿Cuál es la diferencia entre TCP y UDP?',opciones:['TCP es más rápido','UDP es fiable, TCP no','TCP es fiable con confirmación, UDP es rápido sin ella','Son idénticos'],correcta:2},
         {pregunta:'El protocolo DNS opera en el puerto...',opciones:['80','443','53','22'],correcta:2},
       ]},
      {id:3,titulo:'Logs y Eventos — El lenguaje del SOC',xp:35,duracion:'20min',
       teoria:`Los logs son la evidencia de todo lo que ocurre en un sistema.

TIPOS DE LOGS:
- Logs de sistema — Arranque, errores, inicio/cierre de sesión
- Logs de red — Tráfico, conexiones, reglas de firewall
- Logs de aplicación — Errores, accesos web, API calls
- Logs de seguridad — Autenticación, cambios de privilegios

WINDOWS EVENT IDS CRÍTICOS — MEMORÍZALOS:
- 4624 — Inicio de sesión EXITOSO
- 4625 — Inicio de sesión FALLIDO (muchos = brute force)
- 4688 — Proceso creado (detectar malware)
- 4698 — Tarea programada creada (persistencia)
- 4720 — Cuenta de usuario creada
- 7045 — Servicio instalado (puede ser malware)

¿QUÉ ES UN SIEM?
Security Information and Event Management — centraliza logs, correlaciona eventos y genera alertas automáticas. Ejemplos: Splunk, IBM QRadar, Microsoft Sentinel`,
       preguntas:[
         {pregunta:'¿Qué Event ID indica un inicio de sesión fallido?',opciones:['4624','4625','4688','7045'],correcta:1},
         {pregunta:'¿Qué es un SIEM?',opciones:['Un firewall avanzado','Sistema que centraliza y correlaciona logs','Un antivirus empresarial','Un protocolo de red'],correcta:1},
         {pregunta:'Muchos Event ID 4625 desde la misma IP indican...',opciones:['Actividad normal','Brute force attack','Actualización del sistema','Backup automático'],correcta:1},
       ]},
      {id:4,titulo:'El SOC — Roles, flujo y herramientas',xp:40,duracion:'25min',
       teoria:`El SOC es el centro neurálgico de la seguridad. Opera 24/7.

ROLES EN EL SOC:
- L1 Triage — Monitoriza alertas, clasifica incidentes, escala si es necesario
- L2 Investigación — Analiza incidentes en profundidad, correlaciona eventos
- L3 Threat Hunting — Busca amenazas activamente, respuesta avanzada
- SOC Manager — Coordina el equipo y reporta a dirección

FLUJO DE TRABAJO TÍPICO:
- Alerta generada por SIEM o EDR
- L1 clasifica: ¿falso positivo o incidente real?
- Si real, escala a L2 con todo el contexto
- L2 investiga: logs, IOCs, impacto en el negocio
- L3 coordina la respuesta y contención
- Documentación y lecciones aprendidas

HERRAMIENTAS CORE DEL SOC:
- SIEM (Splunk, Sentinel) — Correlación de eventos y alertas
- EDR (CrowdStrike, SentinelOne) — Protección de endpoints
- SOAR — Automatización de respuestas repetitivas
- Threat Intel Platforms — IOCs, CVEs, TTPs`,
       preguntas:[
         {pregunta:'¿Qué rol hace el triage inicial de alertas?',opciones:['L3','L2','L1','SOC Manager'],correcta:2},
         {pregunta:'¿Qué herramienta automatiza respuestas en un SOC?',opciones:['SIEM','EDR','SOAR','Firewall'],correcta:2},
         {pregunta:'CrowdStrike es un ejemplo de...',opciones:['SIEM','Firewall','EDR','SOAR'],correcta:2},
       ]},
      {id:5,titulo:'CASO PRÁCTICO — Primer incidente SOC',xp:50,duracion:'30min',esCaso:true,
       teoria:`CASO REAL: Detección de acceso no autorizado al Domain Controller

Son las 3:17 AM. El SIEM genera una alerta crítica.

ALERTA CRÍTICA ACTIVA:
- Source IP: 185.234.219.56 (Geoloc: Rusia)
- Target: CORP-DC01 (Domain Controller)
- Events: 847 x EventID 4625 en 4 minutos
- Seguido: 1 x EventID 4624 (login EXITOSO)
- Usuario comprometido: administrator

ANÁLISIS PASO A PASO:
- 847 intentos fallidos → Brute Force attack confirmado
- Login exitoso → Credenciales comprometidas
- Target = Domain Controller → CRÍTICO (controla toda la red)
- IP origen Rusia + 3 AM → No es usuario legítimo

RESPUESTA CORRECTA EN ORDEN:
- AISLAR inmediatamente CORP-DC01 de la red
- RESETEAR credenciales del usuario administrator
- REVISAR qué hizo el atacante tras el login exitoso
- ESCALAR a L2/L3 y notificar al CISO
- PRESERVAR todos los logs para análisis forense`,
       preguntas:[
         {pregunta:'847 eventos ID 4625 + 1 evento ID 4624. ¿Qué tipo de ataque es?',opciones:['Phishing','Brute Force exitoso','DDoS','SQL Injection'],correcta:1},
         {pregunta:'¿Cuál es la PRIMERA acción que debes tomar?',opciones:['Enviar email al usuario','Aislar el Domain Controller de la red','Esperar al turno de mañana','Ignorar — puede ser falso positivo'],correcta:1},
         {pregunta:'¿Por qué un Domain Controller comprometido es crítico?',opciones:['Porque es caro','Controla toda la autenticación de la empresa','Porque tiene muchos logs','Es difícil de reinstalar'],correcta:1},
         {pregunta:'IP externa + hora 3:17 AM + Domain Controller. ¿Es sospechoso?',opciones:['No, los admins trabajan de noche','Sí — IP externa + hora inusual + DC = muy sospechoso','No hay suficiente información','Depende del país'],correcta:1},
       ]},
    ]
  },
  {
    id:2,num:'02',titulo:'Detección y Análisis de Amenazas',
    descripcion:'SIEM avanzado, MITRE ATT&CK framework, Threat Intelligence y análisis de logs con casos reales del sector.',
    color:'#7c3aed',icono:'🔍',xp:250,duracion:'3h',
    temas:['SIEM y alertas','MITRE ATT&CK','Threat Intelligence','IOCs y OSINT','Análisis de phishing'],
    certificado:'Analista SOC — Detección',
    lecciones:[
      {id:1,titulo:'SIEM — El cerebro del SOC',xp:45,duracion:'25min',
       teoria:`El SIEM es la herramienta central del analista. Sin SIEM no hay SOC.

FUNCIONES PRINCIPALES:
- Recopilar y normalizar logs de toda la infraestructura
- Correlacionar eventos de múltiples fuentes
- Generar alertas basadas en reglas y umbrales

QUERIES EN SPLUNK:
index=windows EventID=4625 | stats count by src_ip
index=firewall action=blocked | top src_ip

TIPOS DE ALERTAS:
- True Positive (TP) — Alerta real, incidente confirmado
- False Positive (FP) — Alerta falsa, actividad legítima
- True Negative (TN) — Sin alerta y sin incidente
- False Negative (FN) — Sin alerta pero HAY incidente — el más peligroso

CORRELACIÓN:
+100 EventID 4625 en 5 min desde la misma IP = Brute Force confirmado`,
       preguntas:[
         {pregunta:'¿Qué es un False Negative en SIEM?',opciones:['Una alerta falsa','Incidente real sin alerta — el más peligroso','Una alerta correcta','Un log sin datos'],correcta:1},
         {pregunta:'True Positive significa...',opciones:['Falsa alarma','Alerta real con incidente confirmado','Sistema sin amenazas','Log sin anomalías'],correcta:1},
         {pregunta:'¿Qué hace el SIEM con logs de distintas fuentes?',opciones:['Los elimina','Los normaliza y correlaciona','Los cifra','Los ignora'],correcta:1},
       ]},
      {id:2,titulo:'MITRE ATT&CK Framework',xp:45,duracion:'25min',
       teoria:`MITRE ATT&CK es la biblia del analista SOC. Documenta tácticas y técnicas reales.

ESTRUCTURA:
- Tácticas — El QUÉ quiere el atacante (14 tácticas)
- Técnicas — El CÓMO lo consigue
- Sub-técnicas — Variantes específicas

TÉCNICAS MÁS VISTAS EN SOC:
- T1566 — Phishing (Initial Access)
- T1059 — Command and Scripting Interpreter (Execution)
- T1078 — Valid Accounts (Persistence)
- T1027 — Obfuscated Files (Defense Evasion)
- T1110 — Brute Force (Credential Access)
- T1021 — Remote Services (Lateral Movement)
- T1486 — Data Encrypted for Impact (Ransomware)`,
       preguntas:[
         {pregunta:'¿Qué táctica MITRE corresponde a T1566 (Phishing)?',opciones:['Execution','Initial Access','Lateral Movement','Persistence'],correcta:1},
         {pregunta:'T1110 Brute Force corresponde a...',opciones:['Initial Access','Defense Evasion','Credential Access','Collection'],correcta:2},
         {pregunta:'T1021 Remote Services corresponde a...',opciones:['Initial Access','Persistence','Defense Evasion','Lateral Movement'],correcta:3},
       ]},
      {id:3,titulo:'Threat Intelligence — IOCs y OSINT',xp:40,duracion:'20min',
       teoria:`La Threat Intelligence te permite conocer al enemigo antes de que ataque.

IOCS (INDICATORS OF COMPROMISE):
- IPs maliciosas — Servidores C2, Tor exit nodes
- Dominios — phishing.evil.com, dominios de C2
- Hashes de ficheros — MD5/SHA256 de malware conocido
- URLs — Links de phishing y exploits

HERRAMIENTAS OSINT ESENCIALES:
- VirusTotal — Analizar hashes, IPs y dominios
- AbuseIPDB — Score de reputación de IPs
- Shodan — Dispositivos expuestos en internet
- MalwareBazaar — Base de datos de muestras
- URLscan.io — Análisis visual de URLs sospechosas

PROCESO DE ENRIQUECIMIENTO:
- Busca la IP en AbuseIPDB — ¿reportada como maliciosa?
- Busca en VirusTotal — ¿asociada a malware conocido?
- Con ese contexto tu alerta pasa de "puede ser" a "confirmado"`,
       preguntas:[
         {pregunta:'¿Qué es un IOC?',opciones:['Un tipo de malware','Indicador de Compromiso — evidencia de actividad maliciosa','Una herramienta SIEM','Un protocolo de red'],correcta:1},
         {pregunta:'Para verificar si una IP es maliciosa usarías...',opciones:['Google','AbuseIPDB o VirusTotal','Shodan únicamente','El SIEM directamente'],correcta:1},
         {pregunta:'El enriquecimiento de alertas sirve para...',opciones:['Eliminar alertas','Añadir contexto para confirmar si una alerta es real','Crear nuevas reglas SIEM','Formatear logs'],correcta:1},
       ]},
      {id:4,titulo:'CASO PRÁCTICO — Phishing con malware',xp:60,duracion:'35min',esCaso:true,
       teoria:`CASO REAL: Campaña de phishing con RAT

CRONOLOGÍA:
- 09:23 — Usuario de RRHH reporta email sospechoso
- 09:31 — EDR: outlook.exe lanza cmd.exe (ANÓMALO)
- 09:31 — Conexión saliente a 45.33.32.156:4444
- 09:45 — SIEM: mismo patrón en 3 máquinas más

EMAIL:
- De: rrhh-nominas@empresa-corp.com (DOMINIO FALSO)
- Adjunto: nomina_revision.pdf.exe — MALWARE

ANÁLISIS TÉCNICO:
- outlook.exe → cmd.exe → macro ejecutada desde adjunto
- Puerto 4444 → típico de Metasploit reverse shell
- IP en VirusTotal: C2 de RAT conocido
- 4 máquinas afectadas → movimiento lateral activo

TÉCNICAS MITRE:
- T1566.001 — Spearphishing Attachment
- T1059.003 — Windows Command Shell
- T1071 — Application Layer Protocol C2`,
       preguntas:[
         {pregunta:'¿Qué indica que outlook.exe lance cmd.exe?',opciones:['Comportamiento normal de Outlook','Ejecución de macro maliciosa desde el email','Actualización del sistema','Error de configuración'],correcta:1},
         {pregunta:'¿Qué es una conexión al puerto 4444?',opciones:['Tráfico web normal','DNS lookup','Probable reverse shell hacia C2','Actualización de Windows'],correcta:2},
         {pregunta:'Con 4 máquinas afectadas, ¿qué táctica MITRE está ocurriendo?',opciones:['Initial Access','Exfiltration','Lateral Movement','Reconnaissance'],correcta:2},
         {pregunta:'¿Cuál debe ser la primera acción de contención?',opciones:['Avisar al usuario','Aislar las 4 máquinas afectadas inmediatamente','Reinstalar Windows','Esperar más datos'],correcta:1},
       ]},
    ]
  },
  {
    id:3,num:'03',titulo:'Respuesta a Incidentes',
    descripcion:'Ciclo NIST SP 800-61, clasificación de severidad, contención y caso completo de ransomware empresarial.',
    color:'#ef4444',icono:'🚨',xp:280,duracion:'3h',
    temas:['Ciclo NIST','Clasificación de severidad','Contención y erradicación','Preservación de evidencias','Caso ransomware'],
    certificado:'Analista SOC — Incident Response',
    lecciones:[
      {id:1,titulo:'Ciclo de Respuesta NIST SP 800-61',xp:40,duracion:'25min',
       teoria:`El NIST SP 800-61 es el estándar de referencia para respuesta a incidentes.

FASE 1 — PREPARACIÓN:
- Políticas y procedimientos documentados
- Herramientas instaladas y configuradas
- Equipo entrenado con roles asignados
- Playbooks por tipo de incidente

FASE 2 — DETECCIÓN Y ANÁLISIS:
- Identificar el incidente (SIEM, EDR, reporte de usuario)
- Clasificar severidad (Crítica, Alta, Media, Baja)
- Documentar todo desde el primer momento

FASE 3 — CONTENCIÓN:
- Corto plazo: Aislar sistemas afectados ahora
- CRÍTICO: Preservar evidencias antes de actuar
- Largo plazo: Parches, cambio de credenciales

FASE 4 — ERRADICACIÓN:
- Eliminar el malware y todos los backdoors
- Parchear las vulnerabilidades explotadas

FASE 5 — RECUPERACIÓN:
- Restaurar desde backup limpio y verificado
- Monitorización intensiva post-restauración

FASE 6 — LECCIONES APRENDIDAS:
- Post-mortem: ¿Qué falló? ¿Cómo mejorar?
- Actualizar playbooks con lo aprendido`,
       preguntas:[
         {pregunta:'¿Cuál es la fase donde se elimina el malware?',opciones:['Contención','Recuperación','Erradicación','Preparación'],correcta:2},
         {pregunta:'¿Por qué preservar evidencias ANTES de contener?',opciones:['Por protocolo burocrático','Para análisis forense posterior','Porque no es urgente','Para informar a prensa'],correcta:1},
         {pregunta:'La fase de Lecciones Aprendidas sirve para...',opciones:['Celebrar el éxito','Mejorar procesos y detecciones para el futuro','Cerrar tickets','Informar a clientes'],correcta:1},
       ]},
      {id:2,titulo:'Clasificación y severidad de incidentes',xp:35,duracion:'20min',
       teoria:`Clasificar correctamente es una de las habilidades más críticas del analista L1.

NIVELES DE SEVERIDAD:
- 🔴 CRÍTICO — Impacto inmediato en el negocio. Ransomware activo, DC comprometido. Respuesta <15 minutos.
- 🟠 ALTO — Riesgo significativo. Malware detectado, cuentas privilegiadas. Respuesta <1 hora.
- 🟡 MEDIO — Impacto limitado. Malware en endpoint aislado. Respuesta <4 horas.
- 🟢 BAJO — Poco impacto. Escaneo de puertos bloqueado. Respuesta <24 horas.

FACTORES PARA CLASIFICAR:
- ¿Qué sistemas están afectados? DC > servidor > endpoint
- ¿Hay datos sensibles en riesgo?
- ¿El ataque está activo o ya fue contenido?
- ¿Cuántos usuarios y sistemas están afectados?`,
       preguntas:[
         {pregunta:'Ransomware activo en 50 sistemas. ¿Qué severidad?',opciones:['Baja','Media','Alta','Crítica'],correcta:3},
         {pregunta:'Escaneo de puertos bloqueado por firewall. ¿Severidad?',opciones:['Crítica','Alta','Baja','Media'],correcta:2},
         {pregunta:'¿Cuál es el tiempo máximo para un CRÍTICO?',opciones:['24 horas','4 horas','1 hora','15 minutos'],correcta:3},
       ]},
      {id:3,titulo:'CASO PRÁCTICO — Respuesta a Ransomware',xp:70,duracion:'40min',esCaso:true,
       teoria:`CASO REAL: Ataque de ransomware tipo WannaCry

CRONOLOGÍA:
- 08:20 — Phishing ejecutado por usuario de contabilidad
- 08:22 — Descarga de payload desde 91.108.4.55
- 08:23 — Explota MS17-010 (EternalBlue) via SMB 445
- 08:25 — Propagación automática a 12 equipos
- 08:47 — Primera alerta en SIEM (27 minutos después)

SEÑALES:
- Archivos con extensión .encrypted
- EDR: svchost_update.exe cifrando archivos masivamente
- EventID 7045 en 12 equipos (servicio malicioso)
- Tráfico SMB masivo interno en puerto 445

RESPUESTA:
- 08:50 — Segmentar red, aislar 12 equipos afectados
- 09:30 — Identificar y eliminar payload
- 12:00 — Restaurar desde backup del domingo`,
       preguntas:[
         {pregunta:'Se propaga via SMB 445. ¿Qué contención es más urgente?',opciones:['Apagar todos los servidores','Segmentar red y bloquear tráfico SMB interno','Formatear un equipo','Llamar al fabricante del antivirus'],correcta:1},
         {pregunta:'27 minutos entre el phishing y la primera alerta. ¿Qué revela?',opciones:['El SIEM funciona perfectamente','Gap de detección — el EDR no detectó el payload','Es un tiempo excelente','Los usuarios deben reportar más rápido'],correcta:1},
         {pregunta:'¿Por qué NO apagar inmediatamente los equipos cifrados?',opciones:['Porque tardan en encender','Pueden contener evidencias forenses en RAM','Pueden seguir trabajando','Por política de empresa'],correcta:1},
         {pregunta:'Tras la recuperación, ¿qué es lo primero?',opciones:['Celebrarlo','Monitorización intensiva + parchear MS17-010 en toda la red','Restaurar solo equipos afectados','Nada más'],correcta:1},
       ]},
    ]
  },
  {
    id:4,num:'04',titulo:'Threat Hunting',
    descripcion:'Búsqueda proactiva de amenazas que evaden las defensas automatizadas. El analista L3 en acción.',
    color:'#d97706',icono:'🎯',xp:260,duracion:'2h 30min',
    temas:['Hunting proactivo','Hipótesis y metodología','Queries SIEM avanzadas','Living-off-the-land','Cuenta comprometida'],
    certificado:'Threat Hunter Certificado',
    lecciones:[
      {id:1,titulo:'¿Qué es el Threat Hunting?',xp:40,duracion:'20min',
       teoria:`El Threat Hunting es la búsqueda proactiva de amenazas que han evadido las defensas.

DETECCIÓN REACTIVA VS HUNTING:
- Reactiva — Esperas a que el SIEM o EDR genere una alerta
- Hunting — Buscas activamente sin esperar alertas

¿POR QUÉ ES NECESARIO?
Los APT pueden permanecer meses sin generar alertas. Dwell time medio: 24 días.

PROCESO DE THREAT HUNTING:
- HIPÓTESIS — "Creo que hay un atacante usando PowerShell lateralmente"
- INVESTIGACIÓN — Busco en logs PowerShell ejecutándose de forma inusual
- ANÁLISIS — Evalúo los resultados encontrados
- RESPUESTA — Si encuentro algo, inicio proceso de IR
- MEJORA — Si no encuentro nada, mejoro las detecciones del SIEM`,
       preguntas:[
         {pregunta:'¿Cuál es la diferencia clave entre detección reactiva y hunting?',opciones:['No hay diferencia','Detección reactiva espera alertas; hunting busca activamente','Hunting es más lento','La detección reactiva es más efectiva'],correcta:1},
         {pregunta:'¿Cuánto tiempo puede pasar un APT sin detectarse?',opciones:['1 hora','1 día','24 días','1 año'],correcta:2},
         {pregunta:'El primer paso del proceso de hunting es...',opciones:['Analizar logs','Formular una hipótesis','Instalar herramientas','Escalar al CISO'],correcta:1},
       ]},
      {id:2,titulo:'CASO PRÁCTICO — Cuenta comprometida',xp:60,duracion:'35min',esCaso:true,
       teoria:`CASO HUNTING: Detectar cuenta administrativa comprometida

HIPÓTESIS: Atacante usa credenciales válidas para moverse lateralmente de noche.

QUERY SIEM:
index=windows EventID=4624 LogonType=3
| where hour < 6 OR hour > 22
| stats count by user, src_ip, dest
| where count > 3

RESULTADOS SOSPECHOSOS:
- Usuario: svc_backup (cuenta de servicio)
- Horario: 02:14 a 04:37 AM
- IPs origen: 5 IPs internas diferentes
- Destinos: file-server-01, dc-01, hr-server
- Total logins: 47 en 2 horas

CONCLUSIÓN: Cuenta de servicio comprometida. Técnica living-off-the-land — no genera alertas porque usa credenciales válidas.`,
       preguntas:[
         {pregunta:'svc_backup hace 47 logins interactivos de noche. ¿Es normal?',opciones:['Sí, las cuentas de servicio trabajan de noche','No, las cuentas de servicio nunca deben hacer logins interactivos','Depende de la empresa','Sí si hay backups programados'],correcta:1},
         {pregunta:'¿Qué indica el acceso a DC + HR server desde cuenta de backup?',opciones:['Backup normal','Reconocimiento y probable exfiltración de datos sensibles','Mantenimiento programado','Error de configuración'],correcta:1},
         {pregunta:'Esta actividad no generó alertas automáticas porque...',opciones:['El SIEM está roto','Usa credenciales válidas — living-off-the-land','Los logs se perdieron','El firewall la bloqueó'],correcta:1},
       ]},
    ]
  },
  {
    id:5,num:'05',titulo:'Forense Digital',
    descripcion:'Adquisición de evidencias, análisis de disco y memoria RAM, timeline de ataque y caso forense completo.',
    color:'#0891b2',icono:'🔬',xp:290,duracion:'3h',
    temas:['Principios forenses','Volatilidad y evidencias','Artefactos Windows','Cadena de custodia','Análisis de malware'],
    certificado:'Analista Forense Digital',
    lecciones:[
      {id:1,titulo:'Fundamentos del Forense Digital',xp:45,duracion:'25min',
       teoria:`El forense digital investiga qué pasó, cómo pasó y quién lo hizo.

PRINCIPIOS FUNDAMENTALES:
- Preservación — Nunca alterar la evidencia original
- Cadena de custodia — Documentar quién maneja qué y cuándo
- Integridad — Verificar con hashes (MD5/SHA256) que nada cambió
- Reproducibilidad — El análisis debe poder repetirse

ORDEN DE VOLATILIDAD — de más a menos volátil:
- Memoria RAM (se pierde al apagar el equipo)
- Tráfico de red activo
- Disco duro y SSD
- Logs del sistema operativo

ARTEFACTOS CLAVE EN WINDOWS:
- Prefetch — Lista de programas ejecutados recientemente
- Registry — Configuración del sistema y autorun de malware
- Event Logs — Historial de actividad del sistema
- Browser History — Historial de navegación web`,
       preguntas:[
         {pregunta:'¿Por qué recopilar la RAM antes que el disco duro?',opciones:['El disco es más grande','La RAM es más volátil — su contenido se pierde al apagar','La RAM es más fácil de analizar','Por protocolo estándar'],correcta:1},
         {pregunta:'¿Para qué se usan los hashes en forense?',opciones:['Para cifrar evidencias','Para verificar que la evidencia no ha sido alterada','Para comprimir archivos','Para acelerar el análisis'],correcta:1},
         {pregunta:'La cadena de custodia sirve para...',opciones:['Organizar archivos','Documentar quién maneja las evidencias y cuándo','Cifrar datos sensibles','Crear backups'],correcta:1},
       ]},
    ]
  },
  {
    id:6,num:'06',titulo:'Cloud Security',
    descripcion:'Seguridad en AWS y Azure. Logs cloud, IAM, ataques típicos y detección en entornos cloud modernos.',
    color:'#3b82f6',icono:'☁️',xp:300,duracion:'3h',
    temas:['Modelo de responsabilidad','CloudTrail y GuardDuty','IAM y privilegios','Ataques cloud','Escalada en AWS'],
    certificado:'Cloud Security Analyst',
    lecciones:[
      {id:1,titulo:'Fundamentos de seguridad cloud',xp:50,duracion:'30min',
       teoria:`El cloud ha transformado el SOC. Los ataques y defensas son diferentes.

MODELO DE RESPONSABILIDAD COMPARTIDA:
- Cloud Provider — Seguridad DE la infraestructura física
- Cliente — Seguridad EN la infraestructura (datos, configs, accesos)

LOGS ESENCIALES EN AWS:
- CloudTrail — Registra todas las llamadas a la API (quién hizo qué)
- VPC Flow Logs — Todo el tráfico de red
- GuardDuty — Detección automática de amenazas

IAM — IDENTITY AND ACCESS MANAGEMENT:
- Principio de mínimo privilegio — Solo los permisos necesarios
- MFA obligatorio para todas las cuentas privilegiadas
- Revisar y rotar credenciales periódicamente

ATAQUES CLOUD MÁS FRECUENTES:
- Credential stuffing — Robo de credenciales de consola cloud
- Misconfigured S3 buckets — Datos públicos por error de configuración
- IAM privilege escalation — Escalar permisos via roles mal configurados
- Cryptojacking — Usar recursos comprometidos para minar criptomonedas`,
       preguntas:[
         {pregunta:'¿Qué servicio AWS registra todas las llamadas a la API?',opciones:['VPC Flow Logs','CloudTrail','S3','EC2'],correcta:1},
         {pregunta:'¿Qué es el cryptojacking en cloud?',opciones:['Robo de criptomonedas','Usar recursos cloud comprometidos para minar','Ataque de DDoS','Phishing en cloud'],correcta:1},
         {pregunta:'Un bucket S3 público con datos de clientes. ¿Qué fallo es?',opciones:['Fallo del proveedor cloud','Misconfiguration — responsabilidad del cliente','Ataque de hackers','Error de red'],correcta:1},
       ]},
    ]
  },
  {
    id:7,num:'07',titulo:'Automatización SOC con Python',
    descripcion:'Python para analistas SOC: automatización de tareas, IOC lookup, parseo de logs y SOAR casero con APIs reales.',
    color:'#f97316',icono:'⚙️',xp:280,duracion:'2h 30min',
    temas:['Python para SOC','APIs de Threat Intel','Parseo de logs','Automatización SOAR','Scripts reales'],
    certificado:'SOC Automation Specialist',
    lecciones:[
      {id:1,titulo:'Python para analistas SOC',xp:50,duracion:'30min',
       teoria:`Python es la herramienta de automatización del analista moderno.

CASOS DE USO REALES EN SOC:
- Parsear y analizar miles de logs automáticamente
- Buscar IOCs en VirusTotal y AbuseIPDB
- Generar reportes de incidentes en formato estándar
- Enriquecer alertas del SIEM con Threat Intelligence

SCRIPT REAL — VERIFICAR REPUTACIÓN DE IPS:
import requests

def check_ip_reputation(ip):
    url = "https://api.abuseipdb.com/api/v2/check"
    headers = {"Key": "TU_API_KEY"}
    r = requests.get(url, headers=headers, params={"ipAddress": ip})
    return r.json()["data"]["abuseConfidenceScore"]

for ip in ips_from_siem:
    score = check_ip_reputation(ip)
    if score > 50:
        print(f"ALERTA IP maliciosa: {ip} — Score: {score}")`,
       preguntas:[
         {pregunta:'¿Para qué usarías Python en un SOC?',opciones:['Crear aplicaciones web','Automatizar análisis de logs, IOC lookup y reportes','Diseñar interfaces gráficas','Gestionar bases de datos SQL'],correcta:1},
         {pregunta:'¿Qué permite la API de AbuseIPDB?',opciones:['Bloquear IPs automáticamente','Consultar reputación y score de abuso de una IP','Escanear puertos remotos','Ver logs de Windows'],correcta:1},
         {pregunta:'SOAR significa...',opciones:['Security Orchestration Automation and Response','System Operations and Reporting','Security Online Alert Response','Standard Operations Automation Rule'],correcta:0},
       ]},
    ]
  },
  {
    id:8,num:'08',titulo:'Análisis de Malware',
    descripcion:'Análisis estático y dinámico, sandbox, comportamiento e IOCs. Casos reales de RATs y ransomware en el laboratorio.',
    color:'#dc2626',icono:'🦠',xp:290,duracion:'3h',
    temas:['Análisis estático','Análisis dinámico','Sandbox y herramientas','Funciones sospechosas','Caso RAT completo'],
    certificado:'Malware Analyst',
    lecciones:[
      {id:1,titulo:'Análisis estático vs dinámico',xp:55,duracion:'30min',
       teoria:`El análisis de malware determina exactamente qué hace un archivo malicioso.

ANÁLISIS ESTÁTICO — SIN EJECUTAR:
- Calcular hash SHA256 y buscar en VirusTotal
- Strings — Extraer texto legible: URLs, IPs, mensajes
- PE Headers — Metadatos del ejecutable Windows
- Imports — Funciones de Windows que usa el malware

FUNCIONES WINDOWS SOSPECHOSAS:
- 🔴 CreateRemoteThread — Inyección de código en otros procesos
- 🔴 VirtualAllocEx — Reserva memoria en proceso ajeno
- 🔴 WriteProcessMemory — Escribe código en proceso ajeno
- 🔴 RegSetValueEx — Modifica registro (persistencia)
- 🔴 WinExec o CreateProcess — Ejecuta comandos del sistema

ANÁLISIS DINÁMICO — EN SANDBOX:
- Sandbox: Any.run, Cuckoo Sandbox, Joe Sandbox
- Se observa el comportamiento real en tiempo de ejecución
- Se capturan procesos creados, conexiones de red, cambios de registro`,
       preguntas:[
         {pregunta:'¿Qué es el análisis estático de malware?',opciones:['Ejecutar el malware en entorno controlado','Analizar el archivo sin ejecutarlo','Analizar el tráfico de red','Estudiar el código fuente'],correcta:1},
         {pregunta:'"CreateRemoteThread" indica...',opciones:['Creación de hilos normales','Posible inyección de código en otro proceso','Conexión a internet','Creación de archivos en disco'],correcta:1},
         {pregunta:'¿Qué herramienta usarías para análisis dinámico?',opciones:['VirusTotal solo','Sandbox (Any.run, Cuckoo)','Wireshark exclusivamente','Splunk SIEM'],correcta:1},
       ]},
    ]
  },
  {
    id:9,num:'09',titulo:'Certificación Final SOC',
    descripcion:'Simulación completa de turno de guardia: 10 alertas simultáneas, tiempo limitado y evaluación total de competencias.',
    color:'#059669',icono:'🏆',xp:500,duracion:'2h',
    temas:['Gestión de múltiples alertas','Priorización bajo presión','Correlación de incidentes','Decisiones rápidas','Simulacro completo'],
    certificado:'SOC Analyst Profesional — Certificado',
    lecciones:[
      {id:1,titulo:'Simulacro Final — 10 alertas simultáneas',xp:500,duracion:'90min',esCaso:true,
       teoria:`SIMULACRO FINAL: Son las 23:47. Eres el analista de guardia. Se disparan 10 alertas.

USA TODO LO APRENDIDO EN LOS 8 MÓDULOS ANTERIORES.

ALERTAS ACTIVAS EN ESTE MOMENTO:
- 1. CRÍTICA — 1847 EventID 4625 hacia CORP-DC01 desde 185.220.101.45
- 2. CRÍTICA — EDR: svchost.exe lanza cmd.exe lanza powershell -enc base64
- 3. ALTA — DNS: 847 queries a random-xyz.evil en 3 minutos
- 4. ALTA — Nuevo usuario admin creado: backup_svc
- 5. MEDIA — 50 instancias EC2 lanzadas en AWS a las 23:45
- 6. MEDIA — RDP desde IP de Tor hacia servidor de contabilidad
- 7. BAJA — Escaneo de puertos desde 10.0.0.45 (interno)
- 8. BAJA — 3 intentos fallidos VPN (usuario: jgarcia)
- 9. INFO — Antivirus actualizado en 200 equipos
- 10. INFO — Certificado SSL caducado en web corporativa`,
       preguntas:[
         {pregunta:'¿Cuál es la PRIMERA alerta que debes investigar?',opciones:['Certificado SSL caducado','Antivirus actualizado en 200 equipos','1847 logins fallidos en el Domain Controller','3 intentos fallidos de VPN'],correcta:2},
         {pregunta:'Alertas 1 + 2 + 4 juntas probablemente son...',opciones:['Tres incidentes completamente independientes','Un único ataque coordinado en progreso activo','Falsos positivos de mantenimiento','Pruebas del equipo de desarrollo'],correcta:1},
         {pregunta:'Alerta 9: antivirus actualizado en 200 equipos. ¿Qué haces?',opciones:['Investigar urgentemente','Escalar al CISO inmediatamente','Cerrar como informativa — actividad legítima programada','Aislar los 200 equipos preventivamente'],correcta:2},
         {pregunta:'Alertas 3 (DNS tunneling) + 5 (50 EC2 en AWS) indican...',opciones:['Mantenimiento normal','Exfiltración activa + cryptojacking','Actualizaciones programadas','Pruebas de carga'],correcta:1},
         {pregunta:'Primera acción con alerta 2 (powershell -enc base64)...',opciones:['Ignorar — PowerShell es normal en Windows','Decodificar el Base64, aislar el equipo e investigar el proceso padre','Reiniciar el equipo afectado','Actualizar el antivirus en ese equipo'],correcta:1},
       ]},
    ]
  },
];

const CURSOS = [
  {id:1,titulo:'SOC Fundamentals',subtitulo:'De cero a analista L1',color:'#4f46e5',icono:'🛡️',moduloIds:[1,2,3],nivel:'Principiante',duracion:'~8h',descripcion:'Triada CIA, redes, logs, el rol del SOC y cómo responder a tus primeros incidentes reales con herramientas profesionales.'},
  {id:2,titulo:'Detection & Analysis',subtitulo:'Analista L2 avanzado',color:'#7c3aed',icono:'🔍',moduloIds:[4,5,6],nivel:'Intermedio',duracion:'~10h',descripcion:'Threat Hunting proactivo, forense digital, cloud security y detección de amenazas avanzadas como las que enfrenta un L2 real.'},
  {id:3,titulo:'Advanced SOC Operations',subtitulo:'Nivel profesional L2/L3',color:'#ef4444',icono:'⚔️',moduloIds:[7,8,9],nivel:'Avanzado',duracion:'~12h',descripcion:'Automatización con Python, análisis de malware y el simulacro final de certificación profesional con 10 alertas simultáneas.'},
];

const PLATAFORMAS=[
  {nombre:'TryHackMe',desc:'Salas interactivas de ciberseguridad. Ideal para complementar los fundamentos.',url:'https://tryhackme.com',color:'#1db954',emoji:'🟢',nivel:'Principiante - Intermedio',gratis:true},
  {nombre:'HackTheBox Academy',desc:'Máquinas y challenges avanzados. Para analistas que quieren ir al siguiente nivel.',url:'https://hacktheboxacademy.com',color:'#9fef00',emoji:'💚',nivel:'Intermedio - Avanzado',gratis:false},
  {nombre:'Blue Team Labs',desc:'Laboratorios enfocados en defensa y análisis forense. Perfectos para SOC.',url:'https://blueteamlabs.online',color:'#0ea5e9',emoji:'🔵',nivel:'Todos los niveles',gratis:true},
  {nombre:'CyberDefenders',desc:'Challenges de Blue Team con logs reales. PCAP, SIEM, forense y más.',url:'https://cyberdefenders.org',color:'#f59e0b',emoji:'🟡',nivel:'Intermedio - Avanzado',gratis:true},
  {nombre:'LetsDefend',desc:'Plataforma SOC simulada. Gestiona alertas reales como si fueras L1/L2.',url:'https://letsdefend.io',color:'#8b5cf6',emoji:'🟣',nivel:'Todos los niveles',gratis:true},
  {nombre:'SANS Courses',desc:'Los mejores cursos de ciberseguridad del mundo. Caros pero valen cada euro.',url:'https://sans.org',color:'#dc2626',emoji:'🔴',nivel:'Todos los niveles',gratis:false},
];

const CERTIFICACIONES=[
  {nombre:'CompTIA Security+',desc:'La cert de entrada más reconocida. Imprescindible para L1 SOC.',color:'#ef4444',dificultad:'Fácil',precio:'~380€',tiempo:'3-6 meses',credly:true},
  {nombre:'CompTIA CySA+',desc:'Cybersecurity Analyst. Específica para analistas SOC. Muy valorada.',color:'#f97316',dificultad:'Medio',precio:'~380€',tiempo:'6-9 meses',credly:true},
  {nombre:'BTL1 — Blue Team Labs',desc:'Blue Team Level 1. Práctica y reconocida en el sector SOC europeo.',color:'#0ea5e9',dificultad:'Medio',precio:'~200€',tiempo:'3-6 meses',credly:true},
  {nombre:'SC-200 — Microsoft Sentinel',desc:'Cert oficial de Microsoft para Sentinel. Muy demandada en empresas Azure.',color:'#0078d4',dificultad:'Medio',precio:'~165€',tiempo:'3-6 meses',credly:true},
  {nombre:'eJPT — eLearnSecurity',desc:'Junior Penetration Tester. Buena base de red team para defenders.',color:'#0891b2',dificultad:'Fácil',precio:'~200€',tiempo:'2-4 meses',credly:false},
  {nombre:'OSCP — OffSec',desc:'La cert más respetada del sector. Examen de 24h práctico. Para L3+.',color:'#dc2626',dificultad:'Difícil',precio:'~1499€',tiempo:'12-18 meses',credly:false},
];

// ── COMPONENTES AUXILIARES ───────────────────────────────────────────────────
function TeoriaRender({texto,color}){
  const lineas=texto.split('\n');
  const bloques=[];let p=[],li=[],co=[];
  const flushP=()=>{if(p.length){bloques.push({t:'p',v:p.join(' ')});p=[];}};
  const flushLi=()=>{if(li.length){bloques.push({t:'li',v:[...li]});li=[];}};
  const flushCo=()=>{if(co.length){bloques.push({t:'code',v:[...co]});co=[];}};
  for(const raw of lineas){
    const l=raw.trim();
    if(!l){flushP();flushLi();flushCo();continue;}
    if(l===l.toUpperCase()&&l.length>4&&l.length<80&&/[A-ZÁÉÍÓÚ]/.test(l)&&!l.startsWith('-')&&!l.startsWith('🔴')&&!l.startsWith('index=')){
      flushP();flushLi();flushCo();bloques.push({t:'h',v:l});continue;
    }
    if(/^[-•]\s/.test(l)||/^🔴|^🟠|^🟡|^🟢/.test(l)){
      flushP();flushCo();li.push(l.replace(/^[-•]\s*/,''));continue;
    }
    if(/^(import |def |for |with |index=|\w+ = |\w+\.)/.test(l)){
      flushP();flushLi();co.push(l);continue;
    }
    flushLi();flushCo();p.push(l);
  }
  flushP();flushLi();flushCo();
  return(
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      {bloques.map((b,i)=>{
        if(b.t==='p')return<p key={i} style={{fontSize:14,color:'#374151',lineHeight:1.85,margin:0}}>{b.v}</p>;
        if(b.t==='h')return(
          <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'9px 14px',borderRadius:8,background:`${color}08`,border:`1px solid ${color}18`,marginTop:6}}>
            <div style={{width:3,height:14,borderRadius:2,background:color,flexShrink:0}}/>
            <span style={{fontSize:11,fontWeight:700,color,letterSpacing:'1.5px'}}>{b.v}</span>
          </div>
        );
        if(b.t==='li')return(
          <div key={i} style={{display:'flex',flexDirection:'column',gap:5,padding:'4px 0'}}>
            {b.v.map((item,j)=>{
              const isAlert=/^🔴|^🟠|^🟡|^🟢/.test(item);
              const c=item.startsWith('🔴')?'#ef4444':item.startsWith('🟢')?'#059669':item.startsWith('🟠')?'#f97316':item.startsWith('🟡')?'#d97706':'#374151';
              return(
                <div key={j} style={{display:'flex',alignItems:'flex-start',gap:8,padding:isAlert?'7px 11px':'3px 0',borderRadius:isAlert?8:0,background:isAlert?`${c}06`:undefined,border:isAlert?`1px solid ${c}18`:undefined}}>
                  {!isAlert&&<div style={{width:5,height:5,borderRadius:'50%',background:color,marginTop:8,flexShrink:0}}/>}
                  <span style={{fontSize:13.5,color:c,lineHeight:1.75}}>{item}</span>
                </div>
              );
            })}
          </div>
        );
        if(b.t==='code')return(
          <div key={i} style={{borderRadius:10,background:'#0f172a',border:'1px solid #1e293b',overflow:'hidden',marginTop:4}}>
            <div style={{padding:'6px 14px',background:'rgba(79,70,229,0.12)',borderBottom:'1px solid #1e293b',display:'flex',gap:5,alignItems:'center'}}>
              {['#ef4444','#f59e0b','#22c55e'].map((c,k)=><div key={k} style={{width:8,height:8,borderRadius:'50%',background:c+'bb'}}/>)}
              <span style={{fontSize:10,color:'#475569',fontFamily:'monospace',marginLeft:6}}>terminal</span>
            </div>
            <div style={{padding:'14px 18px',display:'flex',flexDirection:'column',gap:2}}>
              {b.v.map((l,j)=><span key={j} style={{fontSize:12.5,color:'#a5b4fc',fontFamily:'monospace',lineHeight:1.8}}>{l}</span>)}
            </div>
          </div>
        );
        return null;
      })}
    </div>
  );
}

// ── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function TrainingPage(){
  const navigate=useNavigate();
  const {user}=useAuth();
  const avatarConfig=user?.avatar_config||null;
  const foto=user?.foto_perfil||'';

  const [tab,setTab]=useState('cursos');
  const [cursoActivo,setCursoActivo]=useState(null);
  const [moduloActivo,setModuloActivo]=useState(null);
  const [leccionActiva,setLeccionActiva]=useState(null);
  const [fase,setFase]=useState('teoria');
  const [respuestas,setRespuestas]=useState({});
  const [enviado,setEnviado]=useState(false);
  const [completadas,setCompletadas]=useState(()=>{try{return JSON.parse(localStorage.getItem('sb_train_v3')||'[]');}catch{return[];}});
  const [certificados,setCertificados]=useState(()=>{try{return JSON.parse(localStorage.getItem('sb_certs_v3')||'[]');}catch{return[];}});
  const [certModal,setCertModal]=useState(null);

  const save=(comp,certs)=>{
    setCompletadas(comp);localStorage.setItem('sb_train_v3',JSON.stringify(comp));
    setCertificados(certs);localStorage.setItem('sb_certs_v3',JSON.stringify(certs));
  };

  const lComp=mod=>mod.lecciones.filter(l=>completadas.includes(`${mod.id}-${l.id}`)).length;
  const mDone=mod=>mod.lecciones.length>0&&lComp(mod)===mod.lecciones.length;
  const cPct=curso=>{const mods=curso.moduloIds.map(id=>MODULOS.find(m=>m.id===id));const t=mods.reduce((a,m)=>a+m.lecciones.length,0);const h=mods.reduce((a,m)=>a+lComp(m),0);return t>0?Math.round((h/t)*100):0;};
  const cUnlock=curso=>curso.id===1||CURSOS[curso.id-2].moduloIds.every(id=>mDone(MODULOS.find(m=>m.id===id)));
  const totalLec=MODULOS.reduce((a,m)=>a+m.lecciones.length,0);
  const totalXP=MODULOS.reduce((a,m)=>a+m.xp,0);

  const iniciar=(lec,mod)=>{setLeccionActiva(lec);setModuloActivo(mod);setFase('teoria');setRespuestas({});setEnviado(false);};
  const nota=()=>{const p=leccionActiva?.preguntas||[];if(!p.length)return 100;let c=0;p.forEach((q,i)=>{if(respuestas[i]===q.correcta)c++;});return Math.round((c/p.length)*100);};
  const completar=()=>{
    const key=`${moduloActivo.id}-${leccionActiva.id}`;
    const nuevas=completadas.includes(key)?completadas:[...completadas,key];
    const todas=moduloActivo.lecciones.map(l=>`${moduloActivo.id}-${l.id}`);
    let nc=[...certificados];
    if(todas.every(k=>nuevas.includes(k))&&!certificados.find(c=>c.moduloId===moduloActivo.id)){
      const cert={moduloId:moduloActivo.id,titulo:moduloActivo.certificado,fecha:new Date().toLocaleDateString('es-ES'),color:moduloActivo.color};
      nc=[...certificados,cert];save(nuevas,nc);setCertModal(cert);
    }else{save(nuevas,nc);setLeccionActiva(null);}
  };

  const css=BASE_CSS+`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=DM+Mono:wght@400;500&display=swap');
    *{font-family:'DM Sans',system-ui,sans-serif!important;}
    code,pre,.mono{font-family:'DM Mono',monospace!important;}
    .tb:hover{color:#0f172a!important;}
    .lrow:hover{background:#f5f3ff!important;}
    .ccard:hover{transform:translateY(-6px)!important;box-shadow:0 20px 50px rgba(0,0,0,0.12)!important;}
    .pcard:hover{transform:translateY(-3px)!important;box-shadow:0 12px 32px rgba(0,0,0,0.1)!important;}
    .optb:hover{border-color:#a5b4fc!important;background:#f5f3ff!important;}
    .mrow:hover{background:#faf5ff!important;}
    @keyframes fadeSlide{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
    .fu{animation:fadeSlide .35s ease forwards;}
    @keyframes certIn{from{opacity:0;transform:scale(0.9);}to{opacity:1;transform:scale(1);}}
    .certModal{animation:certIn .4s cubic-bezier(.34,1.56,.64,1) forwards;}
    .progBar{transition:width 1s cubic-bezier(.4,0,.2,1);}
  `;

  // ── CERT MODAL ──────────────────────────────────────────────────────────────
  if(certModal)return(
    <div style={{minHeight:'100vh',background:'rgba(15,23,42,0.7)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',padding:24,position:'fixed',inset:0,zIndex:1000}}>
      <style>{css}</style>
      <div className="certModal" style={{maxWidth:460,width:'100%',borderRadius:24,background:'#fff',overflow:'hidden',boxShadow:'0 40px 100px rgba(0,0,0,0.3)'}}>
        <div style={{height:6,background:`linear-gradient(90deg,${certModal.color},${certModal.color}88,${certModal.color})`}}/>
        <div style={{padding:'40px 36px',textAlign:'center'}}>
          <div style={{width:72,height:72,borderRadius:'50%',background:`${certModal.color}10`,border:`2px solid ${certModal.color}25`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',fontSize:32}}>🏅</div>
          <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'4px 14px',borderRadius:100,background:'#fef3c7',border:'1px solid #fde68a',marginBottom:16}}>
            <span style={{fontSize:10,fontWeight:700,color:'#d97706',letterSpacing:'2px'}}>CERTIFICADO COMPLETADO</span>
          </div>
          <h1 style={{fontSize:22,fontWeight:900,color:'#0f172a',marginBottom:8,lineHeight:1.3}}>{certModal.titulo}</h1>
          <p style={{fontSize:13,color:'#64748b',marginBottom:28,fontFamily:'DM Mono,monospace'}}>SocBlast Training Platform · {certModal.fecha}</p>
          <div style={{height:1,background:'#f1f5f9',marginBottom:24}}/>
          <div style={{display:'flex',gap:10}}>
            <button onClick={()=>{setCertModal(null);setLeccionActiva(null);}} style={{flex:1,padding:14,borderRadius:12,background:`linear-gradient(135deg,${certModal.color},${certModal.color}cc)`,border:'none',color:'#fff',fontWeight:700,fontSize:14,cursor:'pointer',boxShadow:`0 4px 16px ${certModal.color}40`}}>Continuar →</button>
            <button onClick={()=>{setCertModal(null);navigate('/perfil');}} style={{flex:1,padding:14,borderRadius:12,background:'#f8fafc',border:'1px solid #e2e8f0',color:'#374151',fontSize:14,cursor:'pointer',fontWeight:600}}>Ver en perfil</button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── VISTA LECCIÓN: layout 70/30 estilo Cisco ────────────────────────────────
  if(leccionActiva&&moduloActivo){
    const pregs=leccionActiva.preguntas||[];
    const n=nota();
    const mc=moduloActivo.color;
    const modIndex=MODULOS.findIndex(m=>m.id===moduloActivo.id);
    const lecIndex=moduloActivo.lecciones.findIndex(l=>l.id===leccionActiva.id);
    const prevLec=lecIndex>0?moduloActivo.lecciones[lecIndex-1]:null;
    const nextLec=lecIndex<moduloActivo.lecciones.length-1?moduloActivo.lecciones[lecIndex+1]:null;
    return(
      <div style={{minHeight:'100vh',background:'#f8fafc',fontFamily:'DM Sans,system-ui,sans-serif',display:'flex',flexDirection:'column'}}>
        <style>{css}</style>
        {/* Topbar lección */}
        <div style={{height:52,background:'#fff',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',padding:'0 24px',gap:16,position:'sticky',top:0,zIndex:50,boxShadow:'0 1px 8px rgba(0,0,0,0.06)'}}>
          <button onClick={()=>setLeccionActiva(null)} style={{display:'flex',alignItems:'center',gap:6,background:'none',border:'1px solid #e2e8f0',color:'#374151',padding:'5px 14px',borderRadius:8,fontSize:13,cursor:'pointer',fontWeight:500,whiteSpace:'nowrap'}}>← Módulo</button>
          <div style={{flex:1,display:'flex',alignItems:'center',gap:10,minWidth:0}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:mc,flexShrink:0}}/>
            <span style={{fontSize:13,fontWeight:600,color:'#0f172a',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{moduloActivo.titulo}</span>
            <span style={{color:'#cbd5e1',flexShrink:0}}>/</span>
            <span style={{fontSize:13,color:'#64748b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{leccionActiva.titulo}</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
            {leccionActiva.esCaso&&<span style={{fontSize:11,padding:'3px 10px',borderRadius:100,background:'#fef2f2',color:'#ef4444',fontWeight:700,border:'1px solid #fecaca'}}>⚡ CASO PRÁCTICO</span>}
            <span style={{fontSize:12,fontWeight:700,color:'#059669',padding:'4px 12px',borderRadius:8,background:'#f0fdf4',border:'1px solid #bbf7d0'}}>+{leccionActiva.xp} XP</span>
          </div>
        </div>

        {/* Barra de progreso del módulo */}
        <div style={{height:3,background:'#f1f5f9'}}>
          <div className="progBar" style={{height:'100%',background:`linear-gradient(90deg,${mc},${mc}88)`,width:`${((lecIndex+1)/moduloActivo.lecciones.length)*100}%`}}/>
        </div>

        {/* Layout 70/30 */}
        <div style={{display:'flex',flex:1,maxWidth:1280,margin:'0 auto',width:'100%',padding:'0 24px',gap:0}}>

          {/* Contenido principal 70% */}
          <div style={{flex:'0 0 70%',padding:'36px 40px 80px 0',maxWidth:760}}>

            {/* Tabs */}
            <div style={{display:'flex',gap:0,marginBottom:32,borderBottom:'2px solid #f1f5f9'}}>
              {['teoria','practica'].map(f=>(
                <button key={f} onClick={()=>f==='teoria'&&setFase('teoria')}
                  style={{padding:'10px 24px',background:'none',border:'none',cursor:'pointer',fontSize:13,fontWeight:600,color:fase===f?mc:'#94a3b8',borderBottom:fase===f?`2px solid ${mc}`:'2px solid transparent',marginBottom:-2,transition:'all .15s',letterSpacing:'.3px'}}>
                  {f==='teoria'?'📖 Teoría':leccionActiva.esCaso?'⚡ Caso Práctico':'📝 Test de conocimientos'}
                </button>
              ))}
            </div>

            {/* TEORÍA */}
            {fase==='teoria'&&(
              <div className="fu">
                {/* Hero del módulo */}
                <div style={{padding:'20px 24px',borderRadius:14,background:`linear-gradient(135deg,${mc}10,${mc}04)`,border:`1px solid ${mc}20`,marginBottom:28,display:'flex',alignItems:'center',gap:16}}>
                  <div style={{width:48,height:48,borderRadius:12,background:`${mc}15`,border:`1px solid ${mc}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{moduloActivo.icono}</div>
                  <div>
                    <h2 style={{fontSize:20,fontWeight:800,color:'#0f172a',marginBottom:3,letterSpacing:'-0.4px'}}>{leccionActiva.titulo}</h2>
                    <div style={{display:'flex',gap:12,alignItems:'center'}}>
                      <span style={{fontSize:12,color:'#64748b'}}>⏱ {leccionActiva.duracion}</span>
                      <span style={{fontSize:12,color:mc,fontWeight:600}}>+{leccionActiva.xp} XP al completar</span>
                      {completadas.includes(`${moduloActivo.id}-${leccionActiva.id}`)&&<span style={{fontSize:11,padding:'2px 8px',borderRadius:100,background:'#f0fdf4',color:'#059669',fontWeight:700,border:'1px solid #bbf7d0'}}>✓ Completada</span>}
                    </div>
                  </div>
                </div>

                <TeoriaRender texto={leccionActiva.teoria} color={mc}/>

                <div style={{marginTop:32,padding:'18px 22px',borderRadius:12,background:'#f8fafc',border:'1px solid #e2e8f0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:13,color:'#64748b'}}>¿Listo para el test?</span>
                  <button onClick={()=>setFase('practica')}
                    style={{padding:'10px 24px',borderRadius:10,background:`linear-gradient(135deg,${mc},${mc}cc)`,border:'none',color:'#fff',fontWeight:700,fontSize:14,cursor:'pointer',boxShadow:`0 4px 14px ${mc}35`,display:'flex',alignItems:'center',gap:8}}>
                    {leccionActiva.esCaso?'Ir al Caso Práctico':'Ir al Test'} →
                  </button>
                </div>
              </div>
            )}

            {/* PRÁCTICA */}
            {fase==='practica'&&(
              <div className="fu">
                {/* Header test */}
                <div style={{padding:'16px 20px',borderRadius:12,background:leccionActiva.esCaso?'#fff7f7':'#f5f3ff',border:`1px solid ${leccionActiva.esCaso?'#fecaca':'#ddd6fe'}`,marginBottom:24,display:'flex',alignItems:'center',gap:14}}>
                  <span style={{fontSize:22}}>{leccionActiva.esCaso?'⚡':'📝'}</span>
                  <div>
                    <p style={{fontSize:13,fontWeight:700,color:'#0f172a',marginBottom:2}}>{leccionActiva.esCaso?'Caso Práctico — Toma de Decisiones':'Test de Conocimientos'}</p>
                    <p style={{fontSize:12,color:'#64748b'}}>{pregs.length} preguntas · Mínimo 60% para superar · Puedes ver la teoría cuando quieras</p>
                  </div>
                </div>

                <div style={{display:'flex',flexDirection:'column',gap:16,marginBottom:20}}>
                  {pregs.map((p,i)=>{
                    return(
                      <div key={i} style={{borderRadius:14,background:'#fff',border:'1px solid #e2e8f0',overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.04)'}}>
                        {leccionActiva.esCaso&&<div style={{height:3,background:`linear-gradient(90deg,#ef444480,transparent)`}}/>}
                        <div style={{padding:'20px 22px'}}>
                          <div style={{display:'flex',gap:12,alignItems:'flex-start',marginBottom:16}}>
                            <div style={{width:28,height:28,borderRadius:8,background:`${mc}10`,border:`1px solid ${mc}20`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                              <span style={{fontSize:11,fontWeight:800,color:mc,fontFamily:'DM Mono,monospace'}}>{i+1}</span>
                            </div>
                            <p style={{fontSize:14.5,color:'#0f172a',fontWeight:500,lineHeight:1.65,paddingTop:3}}>{p.pregunta}</p>
                          </div>
                          <div style={{display:'flex',flexDirection:'column',gap:7}}>
                            {p.opciones.map((op,j)=>{
                              let bg='#f8fafc',border='#e2e8f0',color='#374151',icon=null,fw=400;
                              if(enviado){
                                if(j===p.correcta){bg='#f0fdf4';border='#86efac';color='#059669';icon='✓';fw=600;}
                                else if(respuestas[i]===j){bg='#fef2f2';border='#fca5a5';color='#ef4444';icon='✗';}
                              }else if(respuestas[i]===j){bg=`${mc}08`;border=`${mc}50`;color=mc;fw=600;}
                              return(
                                <button key={j} className="optb" onClick={()=>!enviado&&setRespuestas(r=>({...r,[i]:j}))}
                                  style={{padding:'11px 16px',borderRadius:10,background:bg,border:`1.5px solid ${border}`,color,fontSize:13.5,cursor:enviado?'default':'pointer',textAlign:'left',display:'flex',alignItems:'center',gap:12,fontWeight:fw,transition:'all .12s'}}>
                                  <div style={{width:22,height:22,borderRadius:6,border:`1.5px solid ${border}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:11,fontWeight:700,color,background:icon?bg:'transparent'}}>
                                    {icon||String.fromCharCode(65+j)}
                                  </div>
                                  {op}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {!enviado?(
                  <button onClick={()=>setEnviado(true)}
                    style={{width:'100%',padding:15,borderRadius:12,background:`linear-gradient(135deg,${ACC},#6366f1)`,border:'none',color:'#fff',fontWeight:700,fontSize:15,cursor:'pointer',boxShadow:'0 4px 20px rgba(79,70,229,0.35)',letterSpacing:'.3px'}}>
                    Enviar respuestas
                  </button>
                ):(
                  <>
                    <div style={{padding:'22px 26px',borderRadius:14,background:n>=60?'#f0fdf4':'#fef2f2',border:`1.5px solid ${n>=60?'#86efac':'#fca5a5'}`,marginBottom:12,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <div>
                        <p style={{fontSize:44,fontWeight:900,color:n>=60?'#059669':'#ef4444',lineHeight:1,fontFamily:'DM Mono,monospace'}}>{n}%</p>
                        <p style={{fontSize:13,color:'#64748b',marginTop:4}}>{n>=60?'Lección superada correctamente ✓':'Mínimo 60% requerido para continuar'}</p>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <p style={{fontSize:24,fontWeight:800,color:n>=60?'#059669':'#94a3b8',fontFamily:'DM Mono,monospace'}}>+{n>=60?leccionActiva.xp:0} XP</p>
                      </div>
                    </div>
                    {n>=60?(
                      <button onClick={completar} style={{width:'100%',padding:15,borderRadius:12,background:'linear-gradient(135deg,#059669,#10b981)',border:'none',color:'#fff',fontWeight:700,fontSize:15,cursor:'pointer',boxShadow:'0 4px 20px rgba(5,150,105,0.35)'}}>
                        Completar y ganar +{leccionActiva.xp} XP →
                      </button>
                    ):(
                      <button onClick={()=>{setEnviado(false);setRespuestas({});setFase('teoria');}} style={{width:'100%',padding:15,borderRadius:12,background:'#fff',border:'1.5px solid #e2e8f0',color:'#374151',fontWeight:600,fontSize:15,cursor:'pointer'}}>
                        ← Revisar teoría e intentar de nuevo
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Sidebar 30% — índice de lecciones estilo Cisco */}
          <div style={{flex:'0 0 30%',padding:'24px 0 80px 28px',borderLeft:'1px solid #f1f5f9',position:'sticky',top:55,height:'calc(100vh - 55px)',overflowY:'auto'}}>
            <p style={{fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:'2px',marginBottom:16,paddingTop:12}}>CONTENIDO DEL MÓDULO</p>
            <div style={{display:'flex',flexDirection:'column',gap:4}}>
              {moduloActivo.lecciones.map((lec,i)=>{
                const done=completadas.includes(`${moduloActivo.id}-${lec.id}`);
                const isActive=lec.id===leccionActiva.id;
                return(
                  <button key={lec.id} onClick={()=>iniciar(lec,moduloActivo)}
                    style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 12px',borderRadius:10,background:isActive?`${mc}10`:'transparent',border:isActive?`1px solid ${mc}25`:'1px solid transparent',cursor:'pointer',textAlign:'left',width:'100%',transition:'all .12s'}}>
                    <div style={{width:22,height:22,borderRadius:'50%',background:done?'#059669':isActive?mc:'#e2e8f0',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1}}>
                      <span style={{fontSize:10,fontWeight:700,color:'#fff'}}>{done?'✓':i+1}</span>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:12.5,fontWeight:isActive?600:400,color:isActive?mc:done?'#059669':'#374151',lineHeight:1.4,marginBottom:2}}>{lec.titulo}</p>
                      <div style={{display:'flex',gap:8,alignItems:'center'}}>
                        <span style={{fontSize:10,color:'#94a3b8'}}>{lec.duracion}</span>
                        {lec.esCaso&&<span style={{fontSize:9,padding:'1px 6px',borderRadius:4,background:'#fef2f2',color:'#ef4444',fontWeight:700,border:'1px solid #fecaca'}}>CASO</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navegación prev/next */}
            <div style={{marginTop:24,padding:'16px',borderRadius:12,background:'#f8fafc',border:'1px solid #e2e8f0'}}>
              <p style={{fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:'1.5px',marginBottom:10}}>NAVEGACIÓN</p>
              {prevLec&&(
                <button onClick={()=>iniciar(prevLec,moduloActivo)} style={{width:'100%',padding:'8px 12px',borderRadius:8,background:'#fff',border:'1px solid #e2e8f0',color:'#374151',fontSize:12,cursor:'pointer',textAlign:'left',marginBottom:6,display:'flex',alignItems:'center',gap:8}}>
                  <span style={{color:'#94a3b8'}}>←</span> {prevLec.titulo}
                </button>
              )}
              {nextLec&&(
                <button onClick={()=>iniciar(nextLec,moduloActivo)} style={{width:'100%',padding:'8px 12px',borderRadius:8,background:`${mc}08`,border:`1px solid ${mc}20`,color:mc,fontSize:12,cursor:'pointer',textAlign:'left',display:'flex',alignItems:'center',gap:8,fontWeight:600}}>
                  {nextLec.titulo} <span>→</span>
                </button>
              )}
            </div>

            {/* Temas del módulo */}
            <div style={{marginTop:20,padding:'14px',borderRadius:12,background:'#f8fafc',border:'1px solid #e2e8f0'}}>
              <p style={{fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:'1.5px',marginBottom:10}}>TEMAS DE ESTE MÓDULO</p>
              {moduloActivo.temas.map((tema,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'4px 0'}}>
                  <div style={{width:5,height:5,borderRadius:'50%',background:`${mc}60`,flexShrink:0}}/>
                  <span style={{fontSize:12,color:'#64748b'}}>{tema}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── VISTA MÓDULOS DE UN CURSO ────────────────────────────────────────────────
  if(cursoActivo&&!leccionActiva){
    const mods=cursoActivo.moduloIds.map(id=>MODULOS.find(m=>m.id===id));
    const pct=cPct(cursoActivo);
    return(
      <div style={{minHeight:'100vh',background:BG,fontFamily:'DM Sans,system-ui,sans-serif'}}>
        <style>{css}</style>
        <SBNav user={user} avatarConfig={avatarConfig} foto={foto} activePage="/training" navigate={navigate}/>

        <div style={{maxWidth:1100,margin:'0 auto',padding:'36px 24px 80px'}}>

          {/* HERO del curso — estilo Cisco */}
          <div className="fu" style={{borderRadius:20,overflow:'hidden',marginBottom:32,boxShadow:'0 8px 32px rgba(0,0,0,0.1)'}}>
            <div style={{background:`linear-gradient(135deg,${cursoActivo.color}ee,${cursoActivo.color}99)`,padding:'36px 40px',position:'relative',overflow:'hidden'}}>
              {/* Patrón de fondo */}
              <div style={{position:'absolute',inset:0,opacity:0.06,backgroundImage:`radial-gradient(circle at 20% 50%, white 1px, transparent 1px)`,backgroundSize:'24px 24px'}}/>
              <div style={{position:'relative',display:'flex',alignItems:'center',gap:24}}>
                <div style={{width:72,height:72,borderRadius:20,background:'rgba(255,255,255,0.15)',backdropFilter:'blur(10px)',border:'1px solid rgba(255,255,255,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,flexShrink:0}}>{cursoActivo.icono}</div>
                <div style={{flex:1}}>
                  <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'3px 12px',borderRadius:100,background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.25)',marginBottom:10}}>
                    <span style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.9)',letterSpacing:'2px'}}>{cursoActivo.nivel.toUpperCase()}</span>
                  </div>
                  <h1 style={{fontSize:28,fontWeight:900,color:'#fff',marginBottom:4,letterSpacing:'-0.5px'}}>{cursoActivo.titulo}</h1>
                  <p style={{fontSize:14,color:'rgba(255,255,255,0.8)',marginBottom:0}}>{cursoActivo.descripcion}</p>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <p style={{fontSize:42,fontWeight:900,color:'#fff',lineHeight:1,fontFamily:'DM Mono,monospace'}}>{pct}%</p>
                  <p style={{fontSize:12,color:'rgba(255,255,255,0.7)'}}>completado</p>
                </div>
              </div>
              {/* Barra de progreso */}
              <div style={{marginTop:24,height:6,borderRadius:3,background:'rgba(255,255,255,0.2)',overflow:'hidden'}}>
                <div className="progBar" style={{height:'100%',background:'#fff',borderRadius:3,width:`${pct}%`}}/>
              </div>
            </div>
            {/* Stats bar */}
            <div style={{background:'#fff',padding:'16px 40px',display:'flex',gap:32,borderTop:'1px solid #f1f5f9'}}>
              {[
                {l:'Módulos',v:mods.length},
                {l:'Lecciones',v:mods.reduce((a,m)=>a+m.lecciones.length,0)},
                {l:'Duración',v:cursoActivo.duracion},
                {l:'XP disponibles',v:mods.reduce((a,m)=>a+m.xp,0).toLocaleString()},
                {l:'Certificados',v:mods.length},
              ].map((s,i)=>(
                <div key={i} style={{textAlign:'center'}}>
                  <p style={{fontSize:16,fontWeight:800,color:'#0f172a',fontFamily:'DM Mono,monospace'}}>{s.v}</p>
                  <p style={{fontSize:11,color:'#94a3b8'}}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Lista de módulos estilo Cisco — vertical con sidebar */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:24,alignItems:'start'}}>
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              {mods.map((mod,mi)=>{
                const comp=lComp(mod);
                const total=mod.lecciones.length;
                const pctM=total>0?Math.round((comp/total)*100):0;
                const done=mDone(mod);
                const cert=certificados.find(c=>c.moduloId===mod.id);
                const isOpen=moduloActivo?.id===mod.id;
                return(
                  <div key={mod.id} className="fu" style={{borderRadius:16,background:'#fff',border:`1px solid ${isOpen?mod.color+'40':'#e2e8f0'}`,boxShadow:isOpen?`0 4px 20px ${mod.color}12`:'0 2px 10px rgba(0,0,0,0.04)',overflow:'hidden',transition:'all .2s'}}>
                    {/* Header del módulo */}
                    <div onClick={()=>setModuloActivo(isOpen?null:mod)} style={{padding:'20px 24px',cursor:'pointer',display:'flex',alignItems:'center',gap:16}}>
                      {/* Número + icono */}
                      <div style={{position:'relative',flexShrink:0}}>
                        <div style={{width:52,height:52,borderRadius:14,background:`${mod.color}10`,border:`1.5px solid ${mod.color}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>{mod.icono}</div>
                        {done&&<div style={{position:'absolute',bottom:-4,right:-4,width:18,height:18,borderRadius:'50%',background:'#059669',border:'2px solid #fff',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:9,color:'#fff',fontWeight:700}}>✓</span></div>}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                          <span style={{fontSize:10,fontWeight:700,color:mod.color,fontFamily:'DM Mono,monospace',letterSpacing:'1px'}}>MÓDULO {mod.num}</span>
                          {cert&&<span style={{fontSize:10,padding:'1px 7px',borderRadius:4,background:'#fef3c7',color:'#d97706',fontWeight:700,border:'1px solid #fde68a'}}>🏅 Certificado</span>}
                          <span style={{fontSize:10,padding:'1px 7px',borderRadius:4,background:done?'#f0fdf4':`${mod.color}08`,color:done?'#059669':mod.color,fontWeight:700,border:`1px solid ${done?'#bbf7d0':mod.color+'20'}`}}>
                            {done?'COMPLETADO':'ACTIVO'}
                          </span>
                        </div>
                        <h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',marginBottom:3,letterSpacing:'-0.2px'}}>{mod.titulo}</h3>
                        <p style={{fontSize:12.5,color:'#64748b',lineHeight:1.5}}>{mod.descripcion}</p>
                      </div>
                      <div style={{textAlign:'right',flexShrink:0}}>
                        <p style={{fontSize:20,fontWeight:800,color:done?'#059669':mod.color,fontFamily:'DM Mono,monospace'}}>{pctM}%</p>
                        <p style={{fontSize:11,color:'#94a3b8'}}>{comp}/{total} lecciones</p>
                        <div style={{height:4,borderRadius:2,background:'#f1f5f9',overflow:'hidden',marginTop:6,width:80}}>
                          <div className="progBar" style={{height:'100%',background:done?'#059669':mod.color,width:`${pctM}%`}}/>
                        </div>
                      </div>
                    </div>

                    {/* Lecciones desplegables */}
                    {isOpen&&(
                      <div style={{borderTop:`1px solid ${mod.color}15`,background:`${mod.color}03`}}>
                        {mod.lecciones.map((lec,i)=>{
                          const done2=completadas.includes(`${mod.id}-${lec.id}`);
                          return(
                            <div key={lec.id} className="lrow" onClick={()=>iniciar(lec,mod)}
                              style={{display:'flex',alignItems:'center',gap:14,padding:'14px 24px',borderBottom:i<mod.lecciones.length-1?`1px solid ${mod.color}10`:'none',cursor:'pointer',transition:'background .12s'}}>
                              {/* Step indicator */}
                              <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:0,flexShrink:0}}>
                                <div style={{width:28,height:28,borderRadius:'50%',background:done2?'#059669':`${mod.color}15`,border:`1.5px solid ${done2?'#059669':mod.color+'40'}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                                  <span style={{fontSize:11,fontWeight:700,color:done2?'#fff':mod.color,fontFamily:'DM Mono,monospace'}}>{done2?'✓':i+1}</span>
                                </div>
                              </div>
                              <div style={{flex:1}}>
                                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                                  <span style={{fontSize:13.5,fontWeight:500,color:done2?'#059669':'#0f172a'}}>{lec.titulo}</span>
                                  {lec.esCaso&&<span style={{fontSize:10,padding:'2px 7px',borderRadius:5,background:'#fef2f2',color:'#ef4444',fontWeight:700,border:'1px solid #fecaca'}}>CASO PRÁCTICO</span>}
                                </div>
                                <div style={{display:'flex',gap:12}}>
                                  <span style={{fontSize:11,color:'#94a3b8'}}>⏱ {lec.duracion}</span>
                                  <span style={{fontSize:11,color:mod.color,fontWeight:600}}>+{lec.xp} XP</span>
                                </div>
                              </div>
                              <span style={{fontSize:18,color:'#cbd5e1'}}>›</span>
                            </div>
                          );
                        })}
                        {/* CTA abrir primer lección */}
                        <div style={{padding:'14px 24px'}}>
                          <button onClick={()=>iniciar(mod.lecciones[0],mod)}
                            style={{padding:'10px 20px',borderRadius:10,background:`linear-gradient(135deg,${mod.color},${mod.color}cc)`,border:'none',color:'#fff',fontWeight:700,fontSize:13,cursor:'pointer',boxShadow:`0 4px 14px ${mod.color}35`}}>
                            {comp===0?'Comenzar módulo →':`Continuar módulo (${comp}/${mod.lecciones.length})`}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Sidebar derecho */}
            <div style={{position:'sticky',top:80,display:'flex',flexDirection:'column',gap:16}}>
              {/* Progreso general */}
              <div style={{padding:'20px',borderRadius:16,background:'#fff',border:'1px solid #e2e8f0',boxShadow:'0 2px 10px rgba(0,0,0,0.04)'}}>
                <p style={{fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:'2px',marginBottom:14}}>TU PROGRESO</p>
                {mods.map(mod=>{
                  const p=lComp(mod);const t=mod.lecciones.length;const pctM=t>0?Math.round((p/t)*100):0;
                  return(
                    <div key={mod.id} style={{marginBottom:12}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                        <span style={{fontSize:11,color:'#374151',fontWeight:500}}>{mod.icono} {mod.titulo.split('—')[0].trim()}</span>
                        <span style={{fontSize:11,color:mod.color,fontWeight:700,fontFamily:'DM Mono,monospace'}}>{pctM}%</span>
                      </div>
                      <div style={{height:4,borderRadius:2,background:'#f1f5f9',overflow:'hidden'}}>
                        <div className="progBar" style={{height:'100%',background:mDone(mod)?'#059669':mod.color,width:`${pctM}%`}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Certificados */}
              <div style={{padding:'20px',borderRadius:16,background:'#fff',border:'1px solid #e2e8f0',boxShadow:'0 2px 10px rgba(0,0,0,0.04)'}}>
                <p style={{fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:'2px',marginBottom:14}}>CERTIFICADOS DE ESTE CURSO</p>
                {mods.map(mod=>{
                  const cert=certificados.find(c=>c.moduloId===mod.id);
                  return(
                    <div key={mod.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid #f8fafc'}}>
                      <span style={{fontSize:16}}>{cert?'🏅':'🔒'}</span>
                      <div>
                        <p style={{fontSize:11.5,fontWeight:cert?600:400,color:cert?'#d97706':'#94a3b8'}}>{mod.certificado}</p>
                        {cert&&<p style={{fontSize:10,color:'#94a3b8'}}>{cert.fecha}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── VISTA PRINCIPAL ──────────────────────────────────────────────────────────
  return(
    <div style={{minHeight:'100vh',background:BG,fontFamily:'DM Sans,system-ui,sans-serif',color:'#0f172a'}}>
      <style>{css}</style>
      <SBNav user={user} avatarConfig={avatarConfig} foto={foto} activePage="/training" navigate={navigate}/>

      <div style={{maxWidth:1180,margin:'0 auto',padding:'40px 24px 80px'}}>

        {/* HERO */}
        <div className="fu" style={{marginBottom:40}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'4px 14px',borderRadius:100,background:'#eef2ff',border:'1px solid #c7d2fe',marginBottom:16}}>
            <span style={{fontSize:10,fontWeight:700,color:ACC,letterSpacing:'2px'}}>SOC TRAINING PLATFORM</span>
          </div>
          <h1 style={{fontSize:34,fontWeight:900,color:'#0f172a',letterSpacing:'-0.8px',marginBottom:8,lineHeight:1.1}}>
            Conviértete en<br/><span style={{color:ACC}}>analista SOC profesional</span>
          </h1>
          <p style={{fontSize:15,color:'#64748b',maxWidth:560,lineHeight:1.65,marginBottom:24}}>
            {MODULOS.length} módulos · 3 cursos · {totalXP.toLocaleString()} XP · Casos prácticos reales · Certificados verificables
          </p>
          {/* Barra de progreso global */}
          <div style={{maxWidth:520,padding:'16px 20px',borderRadius:12,background:'#fff',border:'1px solid #e2e8f0',boxShadow:'0 2px 10px rgba(0,0,0,0.04)'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
              <span style={{fontSize:12,color:'#374151',fontWeight:600}}>Progreso general</span>
              <span style={{fontSize:12,color:ACC,fontWeight:700,fontFamily:'DM Mono,monospace'}}>{completadas.length}/{totalLec} lecciones completadas</span>
            </div>
            <div style={{height:8,borderRadius:4,background:'#f1f5f9',overflow:'hidden'}}>
              <div className="progBar" style={{height:'100%',borderRadius:4,background:`linear-gradient(90deg,${ACC},#059669)`,width:`${totalLec>0?(completadas.length/totalLec)*100:0}%`}}/>
            </div>
          </div>
        </div>

        {/* Certificados obtenidos */}
        {certificados.length>0&&(
          <div style={{padding:'16px 20px',borderRadius:14,background:'#fff',border:'1px solid #fde68a',marginBottom:28,boxShadow:'0 2px 10px rgba(0,0,0,0.04)'}}>
            <p style={{fontSize:10,fontWeight:700,color:'#d97706',letterSpacing:'2px',marginBottom:10}}>TUS CERTIFICADOS OBTENIDOS</p>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {certificados.map((cert,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:6,padding:'6px 14px',borderRadius:8,background:'#fef3c7',border:'1px solid #fde68a'}}>
                  <span style={{fontSize:14}}>🏅</span>
                  <span style={{fontSize:12,color:'#d97706',fontWeight:600}}>{cert.titulo}</span>
                  <span style={{fontSize:10,color:'#92400e'}}>{cert.fecha}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TABS */}
        <div style={{display:'flex',gap:4,marginBottom:28,borderBottom:'2px solid #f1f5f9'}}>
          {[{id:'cursos',l:'📚 Cursos SocBlast'},{id:'plataformas',l:'🌐 Plataformas externas'},{id:'certificaciones',l:'🏅 Certificaciones'}].map(t=>(
            <button key={t.id} className="tb" onClick={()=>setTab(t.id)}
              style={{padding:'10px 20px',background:'none',border:'none',cursor:'pointer',fontSize:13,fontWeight:600,color:tab===t.id?'#0f172a':'#94a3b8',borderBottom:tab===t.id?`2px solid ${ACC}`:'2px solid transparent',marginBottom:-2,transition:'all .15s'}}>
              {t.l}
            </button>
          ))}
        </div>

        {/* TAB CURSOS */}
        {tab==='cursos'&&(
          <div className="fu" style={{display:'flex',flexDirection:'column',gap:20}}>
            {CURSOS.map(curso=>{
              const unlock=cUnlock(curso);
              const pct=cPct(curso);
              const done=pct===100;
              const mods=curso.moduloIds.map(id=>MODULOS.find(m=>m.id===id));
              const totalLecCurso=mods.reduce((a,m)=>a+m.lecciones.length,0);
              const compLecCurso=mods.reduce((a,m)=>a+lComp(m),0);
              return(
                <div key={curso.id} className={unlock?'ccard':''} onClick={()=>{if(!unlock)return;setCursoActivo(curso);setModuloActivo(null);}}
                  style={{borderRadius:20,background:'#fff',border:`1px solid ${unlock?curso.color+'25':'#e2e8f0'}`,cursor:unlock?'pointer':'not-allowed',opacity:unlock?1:.45,overflow:'hidden',boxShadow:unlock?'0 4px 24px rgba(0,0,0,0.07)':'none',transition:'all .2s'}}>
                  {/* Banner superior con gradiente */}
                  <div style={{background:`linear-gradient(135deg,${curso.color}ee,${curso.color}88)`,padding:'28px 32px',display:'flex',alignItems:'center',gap:24,position:'relative',overflow:'hidden'}}>
                    <div style={{position:'absolute',inset:0,opacity:0.05,backgroundImage:`radial-gradient(circle at 10% 50%, white 1px, transparent 1px)`,backgroundSize:'20px 20px'}}/>
                    <div style={{width:64,height:64,borderRadius:18,background:'rgba(255,255,255,0.18)',backdropFilter:'blur(10px)',border:'1px solid rgba(255,255,255,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0,position:'relative'}}>{curso.icono}</div>
                    <div style={{flex:1,position:'relative'}}>
                      <div style={{display:'flex',gap:8,marginBottom:8,flexWrap:'wrap'}}>
                        <span style={{fontSize:10,padding:'2px 10px',borderRadius:100,background:'rgba(255,255,255,0.2)',color:'rgba(255,255,255,0.9)',fontWeight:700,border:'1px solid rgba(255,255,255,0.3)',letterSpacing:'1px'}}>{curso.nivel.toUpperCase()}</span>
                        <span style={{fontSize:10,padding:'2px 10px',borderRadius:100,background:!unlock?'rgba(255,255,255,0.1)':done?'rgba(255,255,255,0.25)':'rgba(255,255,255,0.15)',color:'rgba(255,255,255,0.9)',fontWeight:700,border:'1px solid rgba(255,255,255,0.25)'}}>
                          {!unlock?'🔒 BLOQUEADO':done?'✓ COMPLETADO':'ACTIVO'}
                        </span>
                      </div>
                      <h3 style={{fontSize:22,fontWeight:900,color:'#fff',marginBottom:2,letterSpacing:'-0.4px'}}>{curso.titulo}</h3>
                      <p style={{fontSize:13,color:'rgba(255,255,255,0.8)'}}>{curso.subtitulo}</p>
                    </div>
                    {/* Progreso circular visual */}
                    <div style={{textAlign:'right',flexShrink:0,position:'relative'}}>
                      <p style={{fontSize:40,fontWeight:900,color:'#fff',lineHeight:1,fontFamily:'DM Mono,monospace'}}>{pct}%</p>
                      <p style={{fontSize:11,color:'rgba(255,255,255,0.7)'}}>completado</p>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{padding:'22px 32px'}}>
                    <p style={{fontSize:13.5,color:'#64748b',lineHeight:1.65,marginBottom:20}}>{curso.descripcion}</p>

                    {/* Stats */}
                    <div style={{display:'flex',gap:0,marginBottom:20,borderRadius:12,overflow:'hidden',border:'1px solid #f1f5f9'}}>
                      {[
                        {l:'Módulos',v:curso.moduloIds.length},
                        {l:'Lecciones',v:totalLecCurso},
                        {l:'Duración',v:curso.duracion},
                        {l:'XP',v:mods.reduce((a,m)=>a+m.xp,0).toLocaleString()},
                      ].map((s,i)=>(
                        <div key={i} style={{flex:1,padding:'12px 0',textAlign:'center',borderRight:i<3?'1px solid #f1f5f9':undefined,background:'#fafafa'}}>
                          <p style={{fontSize:16,fontWeight:800,color:'#0f172a',fontFamily:'DM Mono,monospace'}}>{s.v}</p>
                          <p style={{fontSize:10,color:'#94a3b8',letterSpacing:'.5px'}}>{s.l}</p>
                        </div>
                      ))}
                    </div>

                    {/* Barra progreso */}
                    <div style={{marginBottom:18}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                        <span style={{fontSize:12,color:'#64748b'}}>{compLecCurso} de {totalLecCurso} lecciones completadas</span>
                        <span style={{fontSize:12,color:done?'#059669':curso.color,fontWeight:700,fontFamily:'DM Mono,monospace'}}>{pct}%</span>
                      </div>
                      <div style={{height:8,borderRadius:4,background:'#f1f5f9',overflow:'hidden'}}>
                        <div className="progBar" style={{height:'100%',borderRadius:4,background:done?'#059669':`linear-gradient(90deg,${curso.color},${curso.color}aa)`,width:`${pct}%`}}/>
                      </div>
                    </div>

                    {/* Módulos preview */}
                    <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:20}}>
                      {mods.map(mod=>{
                        const p=lComp(mod);const t=mod.lecciones.length;const d=mDone(mod);
                        return(
                          <div key={mod.id} style={{display:'flex',alignItems:'center',gap:6,padding:'5px 12px',borderRadius:8,background:`${mod.color}08`,border:`1px solid ${mod.color}20`}}>
                            <span style={{fontSize:12}}>{mod.icono}</span>
                            <span style={{fontSize:11,color:d?'#059669':mod.color,fontWeight:600}}>{mod.titulo.split('—')[0].trim().split(' ').slice(0,3).join(' ')}</span>
                            <span style={{fontSize:10,color:'#94a3b8',fontFamily:'DM Mono,monospace'}}>{p}/{t}</span>
                          </div>
                        );
                      })}
                    </div>

                    {unlock&&(
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                        <p style={{fontSize:13,color:curso.color,fontWeight:700}}>{done?'Ver certificados y repasar →':`Comenzar ${curso.titulo} →`}</p>
                        <div style={{padding:'10px 22px',borderRadius:10,background:`linear-gradient(135deg,${curso.color},${curso.color}cc)`,color:'#fff',fontSize:13,fontWeight:700,boxShadow:`0 4px 14px ${curso.color}35`}}>
                          {done?'Completado ✓':'Abrir curso'}
                        </div>
                      </div>
                    )}
                    {!unlock&&(
                      <p style={{fontSize:13,color:'#94a3b8',display:'flex',alignItems:'center',gap:6}}>🔒 Completa el curso anterior para desbloquear</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB PLATAFORMAS */}
        {tab==='plataformas'&&(
          <div className="fu">
            <div style={{padding:'16px 20px',borderRadius:14,background:'linear-gradient(135deg,#eef2ff,#f5f3ff)',border:'1px solid #c7d2fe',marginBottom:28}}>
              <p style={{fontSize:13.5,color:'#374151',lineHeight:1.7}}>Complementa tu formación SocBlast con estas plataformas. Todas son reconocidas por empresas reales. <strong style={{color:ACC}}>Pronto podrás conectar tu perfil de TryHackMe y HackTheBox</strong> directamente desde SocBlast para mostrar tus logros en tu Analyst Card.</p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
              {PLATAFORMAS.map((p,i)=>(
                <div key={i} className="pcard" onClick={()=>window.open(p.url,'_blank')}
                  style={{padding:'22px 20px',borderRadius:16,background:'#fff',border:'1px solid #e2e8f0',cursor:'pointer',boxShadow:'0 2px 10px rgba(0,0,0,0.04)',transition:'all .2s',position:'relative',overflow:'hidden'}}>
                  <div style={{position:'absolute',top:0,left:0,right:0,height:4,background:`linear-gradient(90deg,${p.color},${p.color}60)`}}/>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                    <span style={{fontSize:24}}>{p.emoji}</span>
                    <div>
                      <h3 style={{fontSize:15,fontWeight:800,color:'#0f172a',marginBottom:2}}>{p.nombre}</h3>
                      <span style={{fontSize:10,padding:'2px 7px',borderRadius:5,background:p.gratis?'#f0fdf4':'#fef3c7',color:p.gratis?'#059669':'#d97706',fontWeight:700,border:`1px solid ${p.gratis?'#bbf7d0':'#fde68a'}`}}>{p.gratis?'Gratuito':'De pago'}</span>
                    </div>
                  </div>
                  <p style={{fontSize:12.5,color:'#64748b',lineHeight:1.65,marginBottom:12}}>{p.desc}</p>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:11,color:'#94a3b8'}}>{p.nivel}</span>
                    <span style={{fontSize:12,color:p.color,fontWeight:700}}>Abrir →</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginTop:20,padding:'18px 22px',borderRadius:14,background:'#fff',border:'1px solid #c7d2fe',display:'flex',alignItems:'center',gap:14}}>
              <span style={{fontSize:24}}>🔗</span>
              <div style={{flex:1}}>
                <p style={{fontSize:13,fontWeight:700,color:'#0f172a',marginBottom:3}}>Integraciones automáticas — próximamente</p>
                <p style={{fontSize:12.5,color:'#64748b'}}>Conecta tu cuenta de TryHackMe y HackTheBox para que tus logros aparezcan verificados en tu Analyst Card automáticamente.</p>
              </div>
              <span style={{fontSize:11,padding:'6px 14px',borderRadius:100,background:'#eef2ff',color:ACC,fontWeight:700,flexShrink:0,border:'1px solid #c7d2fe',whiteSpace:'nowrap'}}>Próximamente</span>
            </div>
          </div>
        )}

        {/* TAB CERTIFICACIONES */}
        {tab==='certificaciones'&&(
          <div className="fu">
            <div style={{padding:'16px 20px',borderRadius:14,background:'linear-gradient(135deg,#eef2ff,#f5f3ff)',border:'1px solid #c7d2fe',marginBottom:28}}>
              <p style={{fontSize:13.5,color:'#374151',lineHeight:1.7}}>Las certificaciones más valoradas en el sector SOC. <strong style={{color:ACC}}>Pronto podrás añadirlas a tu Analyst Card</strong> desde Perfil → Certificaciones. Las de Credly se verificarán automáticamente con tu URL de badge.</p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
              {CERTIFICACIONES.map((cert,i)=>(
                <div key={i} style={{padding:'20px',borderRadius:16,background:'#fff',border:'1px solid #e2e8f0',boxShadow:'0 2px 10px rgba(0,0,0,0.04)',position:'relative',overflow:'hidden'}}>
                  <div style={{position:'absolute',top:0,left:0,right:0,height:4,background:`linear-gradient(90deg,${cert.color},${cert.color}60)`}}/>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                    <h3 style={{fontSize:14,fontWeight:700,color:'#0f172a',lineHeight:1.4,flex:1,paddingRight:8}}>{cert.nombre}</h3>
                    {cert.credly&&<span style={{fontSize:9,padding:'2px 7px',borderRadius:5,background:'#fef3c7',color:'#d97706',fontWeight:700,border:'1px solid #fde68a',flexShrink:0}}>Credly ✓</span>}
                  </div>
                  <p style={{fontSize:12.5,color:'#64748b',lineHeight:1.65,marginBottom:14}}>{cert.desc}</p>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:8}}>
                    {[{l:'Dificultad',v:cert.dificultad,c:cert.dificultad==='Difícil'?'#dc2626':cert.dificultad==='Medio'?'#d97706':'#059669'},{l:'Precio',v:cert.precio,c:'#374151'}].map((s,j)=>(
                      <div key={j} style={{padding:'8px 10px',borderRadius:8,background:'#f8fafc',border:'1px solid #f1f5f9',textAlign:'center'}}>
                        <p style={{fontSize:9,color:'#94a3b8',marginBottom:2,letterSpacing:'.5px'}}>{s.l.toUpperCase()}</p>
                        <p style={{fontSize:12,fontWeight:700,color:s.c}}>{s.v}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{padding:'7px 10px',borderRadius:8,background:'#f8fafc',border:'1px solid #f1f5f9',textAlign:'center'}}>
                    <p style={{fontSize:9,color:'#94a3b8',marginBottom:2,letterSpacing:'.5px'}}>TIEMPO ESTIMADO</p>
                    <p style={{fontSize:12,fontWeight:700,color:'#374151'}}>{cert.tiempo}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginTop:20,padding:'18px 22px',borderRadius:14,background:'#fff',border:'1px solid #c7d2fe',display:'flex',alignItems:'center',gap:14}}>
              <span style={{fontSize:24}}>🏅</span>
              <div style={{flex:1}}>
                <p style={{fontSize:13,fontWeight:700,color:'#0f172a',marginBottom:3}}>Añade tus certificaciones a tu Analyst Card</p>
                <p style={{fontSize:12.5,color:'#64748b'}}>Las certificaciones verificadas aparecerán en tu perfil público con badge ✓. Las de Credly se verifican automáticamente.</p>
              </div>
              <button onClick={()=>navigate('/perfil')} style={{padding:'10px 20px',borderRadius:100,background:`linear-gradient(135deg,${ACC},#6366f1)`,border:'none',color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',flexShrink:0,boxShadow:'0 4px 14px rgba(79,70,229,0.3)'}}>Ir a perfil →</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}