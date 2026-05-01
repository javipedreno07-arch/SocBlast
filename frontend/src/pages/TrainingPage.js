import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SBNav, Icon, ACC, BG, BASE_CSS } from './SBLayout';
import { useAuth } from '../context/AuthContext';

// ── DATOS ────────────────────────────────────────────────────────────────────
const MODULOS = [
  {
    id:1, num:'01', titulo:'Fundamentos de Ciberseguridad y SOC',
    descripcion:'Triada CIA, tipos de ataques, actores de amenaza y el rol del SOC',
    color:'#4f46e5', icono:'🛡️', xp:200, certificado:'Analista SOC — Fundamentos',
    lecciones:[
      { id:1, titulo:'Introducción a la Ciberseguridad', xp:35, teoria:`La ciberseguridad protege sistemas, redes y datos frente a ataques digitales.\n\nTRIADA CIA — EL NÚCLEO DE TODA LA SEGURIDAD:\n- Confidencialidad — Solo los autorizados acceden a la información\n- Integridad — La información no se altera sin autorización\n- Disponibilidad — Los sistemas están accesibles cuando se necesitan\n\nTIPOS DE ATAQUES MÁS COMUNES:\n- Malware — Software malicioso (virus, ransomware, trojan, spyware)\n- Phishing — Suplantación de identidad para robar credenciales\n- DDoS — Saturar un servicio con tráfico masivo hasta tumbarlo\n- Man-in-the-Middle — Interceptar comunicaciones entre dos partes\n- SQL Injection — Manipular consultas a bases de datos\n\nACTORES DE AMENAZA:\n- Script Kiddies — Sin conocimiento avanzado, usan herramientas ajenas\n- Hacktivistas — Motivación ideológica o política\n- Ciberdelincuentes — Motivación económica (ransomware, fraude)\n- APT — Estados nación, ataques muy sofisticados y persistentes\n- Insider Threat — Empleados maliciosos o negligentes`,
        preguntas:[
          {pregunta:'¿Qué significa la "I" en la triada CIA?',opciones:['Identidad','Integridad','Intrusión','Inteligencia'],correcta:1},
          {pregunta:'¿Qué tipo de ataque satura un servicio con tráfico masivo?',opciones:['Phishing','SQL Injection','DDoS','Ransomware'],correcta:2},
          {pregunta:'¿Qué es un APT?',opciones:['Un tipo de malware','Ataque avanzado y persistente, generalmente estatal','Una herramienta de defensa','Un protocolo de red'],correcta:1},
          {pregunta:'¿Cuál es la motivación principal de los ciberdelincuentes?',opciones:['Ideológica','Técnica','Económica','Social'],correcta:2},
          {pregunta:'¿Qué garantiza la Disponibilidad en CIA?',opciones:['Que los datos no se alteran','Que solo los autorizados acceden','Que los sistemas estén accesibles cuando se necesitan','Que se cifran las comunicaciones'],correcta:2},
        ]
      },
      { id:2, titulo:'Redes para SOC — Fundamentos críticos', xp:40, teoria:`Las redes son el campo de batalla del analista SOC. Debes dominarlas.\n\nMODELO OSI — 7 CAPAS:\n- Física — Cables y señales\n- Enlace — Direcciones MAC, switches\n- Red — Direcciones IP, enrutamiento\n- Transporte — TCP/UDP, puertos\n- Sesión — Gestión de sesiones\n- Presentación — Cifrado y formato\n- Aplicación — HTTP, DNS, FTP, SMB\n\nPROTOCOLOS CLAVE EN SOC:\n- HTTP/HTTPS (80/443) — Tráfico web\n- DNS (53) — Resolución de nombres, muy abusado por atacantes\n- SMB (445) — Compartir archivos Windows, objetivo frecuente\n- RDP (3389) — Escritorio remoto, vector de ataque habitual\n- SSH (22) — Acceso remoto seguro\n\nCONCEPTOS ESENCIALES:\n- IPs privadas: 192.168.x.x · 10.x.x.x · 172.16-31.x.x\n- TCP — Fiable, usa 3-way handshake\n- UDP — Rápido, sin confirmación`,
        preguntas:[
          {pregunta:'¿En qué capa OSI opera el protocolo IP?',opciones:['Capa 2 — Enlace','Capa 3 — Red','Capa 4 — Transporte','Capa 7 — Aplicación'],correcta:1},
          {pregunta:'¿Qué puerto usa SMB?',opciones:['80','443','445','3389'],correcta:2},
          {pregunta:'¿Cuál es la diferencia entre TCP y UDP?',opciones:['TCP es más rápido','UDP es fiable, TCP no','TCP es fiable con confirmación, UDP es rápido sin ella','Son idénticos'],correcta:2},
          {pregunta:'¿Qué rango de IPs es privado?',opciones:['8.8.8.8','192.168.1.1','142.250.0.1','1.1.1.1'],correcta:1},
          {pregunta:'El protocolo DNS opera en el puerto...',opciones:['80','443','53','22'],correcta:2},
        ]
      },
      { id:3, titulo:'Logs y Eventos — El lenguaje del SOC', xp:35, teoria:`Los logs son la evidencia de todo lo que ocurre en un sistema.\n\nTIPOS DE LOGS:\n- Logs de sistema — Arranque, errores, inicio/cierre de sesión\n- Logs de red — Tráfico, conexiones, reglas de firewall\n- Logs de aplicación — Errores de app, accesos web\n- Logs de seguridad — Autenticación, cambios de privilegios\n\nWINDOWS EVENT IDS CRÍTICOS:\n- 4624 — Inicio de sesión EXITOSO\n- 4625 — Inicio de sesión FALLIDO (muchos = brute force)\n- 4648 — Login con credenciales explícitas (sospechoso)\n- 4688 — Proceso creado (detectar malware)\n- 4698 — Tarea programada creada (persistencia)\n- 4720 — Cuenta de usuario creada\n- 7045 — Servicio instalado (puede ser malware)\n\n¿QUÉ ES UN SIEM?\nSecurity Information and Event Management — centraliza logs, correlaciona eventos y genera alertas. Ejemplos: Splunk, IBM QRadar, Microsoft Sentinel`,
        preguntas:[
          {pregunta:'¿Qué Event ID indica un inicio de sesión fallido?',opciones:['4624','4625','4688','7045'],correcta:1},
          {pregunta:'¿Para qué sirve el Event ID 4688?',opciones:['Login exitoso','Proceso creado','Servicio instalado','Cuenta creada'],correcta:1},
          {pregunta:'¿Qué es un SIEM?',opciones:['Un firewall avanzado','Sistema que centraliza y correlaciona logs','Un antivirus empresarial','Un protocolo de red'],correcta:1},
          {pregunta:'Muchos Event ID 4625 desde la misma IP indican...',opciones:['Actividad normal','Brute force attack','Actualización del sistema','Backup automático'],correcta:1},
        ]
      },
      { id:4, titulo:'El SOC — Roles, flujo y herramientas', xp:40, teoria:`El SOC es el centro neurálgico de la seguridad. Opera 24/7.\n\nROLES EN EL SOC:\n- L1 Triage — Monitoriza alertas, clasifica incidentes, escala\n- L2 Investigación — Analiza incidentes en profundidad\n- L3 Threat Hunting — Busca amenazas activamente\n- SOC Manager — Coordina el equipo\n\nFLUJO DE TRABAJO:\n- Alerta generada por SIEM o EDR\n- L1 clasifica: ¿falso positivo o incidente real?\n- Si real, escala a L2 con todo el contexto\n- L2 investiga: logs, IOCs, impacto\n- L3 coordina la respuesta y contención\n- Documentación y lecciones aprendidas\n\nHERRAMIENTAS CORE:\n- SIEM (Splunk, Sentinel) — Correlación de eventos\n- EDR (CrowdStrike, SentinelOne) — Protección de endpoints\n- SOAR — Automatización de respuestas\n- Threat Intel Platforms — IOCs, CVEs, TTPs`,
        preguntas:[
          {pregunta:'¿Qué rol hace el triage inicial de alertas?',opciones:['L3','L2','L1','SOC Manager'],correcta:2},
          {pregunta:'¿Qué herramienta automatiza respuestas en un SOC?',opciones:['SIEM','EDR','SOAR','Firewall'],correcta:2},
          {pregunta:'CrowdStrike es un ejemplo de...',opciones:['SIEM','Firewall','EDR','SOAR'],correcta:2},
          {pregunta:'¿Cuál es el primer paso cuando se genera una alerta?',opciones:['Contener el incidente','Clasificar si es falso positivo o real','Apagar el servidor','Notificar a prensa'],correcta:1},
        ]
      },
      { id:5, titulo:'CASO PRÁCTICO — Primer incidente SOC', xp:50, esCaso:true, teoria:`CASO REAL: Detección de acceso no autorizado al Domain Controller\n\nSon las 3:17 AM. El SIEM genera una alerta crítica:\n\nALERTA ACTIVA:\n- Source IP: 185.234.219.56 (Rusia)\n- Target: CORP-DC01 (Domain Controller)\n- Events: 847 x EventID 4625 en 4 minutos\n- Seguido: 1 x EventID 4624 (login EXITOSO)\n- Usuario comprometido: administrator\n\nANÁLISIS:\n- 847 intentos fallidos → Brute Force confirmado\n- Login exitoso → Credenciales comprometidas\n- Target = Domain Controller → CRÍTICO\n- IP externa + hora 3 AM → No es usuario legítimo\n\nRESPUESTA CORRECTA EN ORDEN:\n- AISLAR inmediatamente CORP-DC01\n- RESETEAR credenciales del administrator\n- REVISAR qué hizo el atacante tras el login\n- ESCALAR a L2/L3 y notificar al CISO\n- PRESERVAR logs para análisis forense`,
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
      { id:1, titulo:'SIEM — El cerebro del SOC', xp:45, teoria:`El SIEM es la herramienta central del analista. Sin SIEM no hay SOC.\n\nFUNCIONES PRINCIPALES:\n- Recopilar y normalizar logs de toda la infraestructura\n- Correlacionar eventos de múltiples fuentes\n- Generar alertas basadas en reglas y umbrales\n\nQUERIES EN SPLUNK:\nindex=windows EventID=4625 | stats count by src_ip\nindex=firewall action=blocked | top src_ip\n\nTIPOS DE ALERTAS:\n- True Positive (TP) — Alerta real, incidente confirmado\n- False Positive (FP) — Alerta falsa, actividad legítima\n- True Negative (TN) — Sin alerta y sin incidente\n- False Negative (FN) — Sin alerta pero HAY incidente (peligroso)\n\nCORRELACIÓN:\n+100 EventID 4625 en 5 min desde la misma IP = Brute Force`,
        preguntas:[
          {pregunta:'¿Qué es un False Negative en SIEM?',opciones:['Una alerta falsa','Incidente real sin alerta — el más peligroso','Una alerta correcta','Un log sin datos'],correcta:1},
          {pregunta:'True Positive significa...',opciones:['Falsa alarma','Alerta real con incidente confirmado','Sistema sin amenazas','Log sin anomalías'],correcta:1},
          {pregunta:'¿Qué hace el SIEM con logs de distintas fuentes?',opciones:['Los elimina','Los normaliza y correlaciona','Los cifra','Los ignora'],correcta:1},
          {pregunta:'Una buena regla SIEM para detectar brute force...',opciones:['1 login fallido = alerta','+100 logins fallidos en 5 min desde la misma IP','Cualquier login = alerta','Logins de lunes a viernes = alerta'],correcta:1},
        ]
      },
      { id:2, titulo:'MITRE ATT&CK Framework', xp:45, teoria:`MITRE ATT&CK es la biblia del analista SOC. Documenta tácticas y técnicas reales.\n\nESTRUCTURA:\n- Tácticas — El QUÉ quiere el atacante\n- Técnicas — El CÓMO lo consigue\n- Sub-técnicas — Variantes específicas\n\nTÉCNICAS MÁS VISTAS EN SOC:\n- T1566 — Phishing (Initial Access)\n- T1059 — Command and Scripting Interpreter (Execution)\n- T1078 — Valid Accounts (Persistence)\n- T1027 — Obfuscated Files (Defense Evasion)\n- T1110 — Brute Force (Credential Access)\n- T1021 — Remote Services (Lateral Movement)\n- T1486 — Data Encrypted for Impact (Ransomware)`,
        preguntas:[
          {pregunta:'¿Qué táctica MITRE corresponde a T1566 (Phishing)?',opciones:['Execution','Initial Access','Lateral Movement','Persistence'],correcta:1},
          {pregunta:'T1110 Brute Force corresponde a la táctica...',opciones:['Initial Access','Defense Evasion','Credential Access','Collection'],correcta:2},
          {pregunta:'¿Para qué sirve MITRE ATT&CK?',opciones:['Gestionar firewalls','Documentar tácticas y técnicas reales de atacantes','Crear políticas de backup','Configurar SIEM'],correcta:1},
          {pregunta:'T1021 Remote Services corresponde a...',opciones:['Initial Access','Persistence','Defense Evasion','Lateral Movement'],correcta:3},
        ]
      },
      { id:3, titulo:'Threat Intelligence — IOCs y OSINT', xp:40, teoria:`La Threat Intelligence te permite conocer al enemigo antes de que ataque.\n\nIOCS (INDICATORS OF COMPROMISE):\n- IPs maliciosas — Servidores C2, Tor exit nodes\n- Dominios — phishing.evil.com, dominios de C2\n- Hashes de ficheros — MD5/SHA256 de malware conocido\n- URLs — Links de phishing y exploits\n\nHERRAMIENTAS OSINT ESENCIALES:\n- VirusTotal — Analizar hashes, IPs y dominios\n- AbuseIPDB — Score de reputación de IPs\n- Shodan — Dispositivos expuestos en internet\n- MalwareBazaar — Base de datos de muestras\n- URLscan.io — Análisis visual de URLs sospechosas\n\nPROCESO DE ENRIQUECIMIENTO:\n- Busca la IP en AbuseIPDB — ¿reportada como maliciosa?\n- Busca en VirusTotal — ¿asociada a malware conocido?\n- Busca en Shodan — ¿qué servicios expone?`,
        preguntas:[
          {pregunta:'¿Qué es un IOC?',opciones:['Un tipo de malware','Indicador de Compromiso — evidencia de actividad maliciosa','Una herramienta SIEM','Un protocolo de red'],correcta:1},
          {pregunta:'Para verificar si una IP es maliciosa usarías...',opciones:['Google','AbuseIPDB o VirusTotal','Shodan únicamente','El SIEM directamente'],correcta:1},
          {pregunta:'¿Qué muestra Shodan?',opciones:['Malware conocido','Dispositivos y servicios expuestos en internet','Logs de Windows','URLs de phishing'],correcta:1},
          {pregunta:'El enriquecimiento de alertas sirve para...',opciones:['Eliminar alertas','Añadir contexto para confirmar si una alerta es real','Crear nuevas reglas SIEM','Formatear logs'],correcta:1},
        ]
      },
      { id:4, titulo:'CASO PRÁCTICO — Phishing con malware', xp:60, esCaso:true, teoria:`CASO REAL: Campaña de phishing con RAT\n\nCRONOLOGÍA:\n- 09:23 — Usuario de RRHH reporta email sospechoso\n- 09:31 — EDR: outlook.exe lanza cmd.exe (anómalo)\n- 09:31 — Conexión saliente a 45.33.32.156:4444\n- 09:45 — SIEM: mismo patrón en 3 máquinas más\n\nEMAIL:\n- De: rrhh-nominas@empresa-corp.com (DOMINIO FALSO)\n- Adjunto: nomina_revision.pdf.exe — MALWARE\n\nANÁLISIS:\n- outlook.exe → cmd.exe → macro ejecutada desde adjunto\n- Puerto 4444 → típico de reverse shell C2\n- IP VirusTotal: C2 de RAT conocido\n- 4 máquinas afectadas → movimiento lateral\n\nTÉCNICAS MITRE:\n- T1566.001 — Spearphishing Attachment\n- T1059.003 — Windows Command Shell\n- T1071 — Application Layer Protocol C2`,
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
      { id:1, titulo:'Ciclo de Respuesta NIST SP 800-61', xp:40, teoria:`El NIST SP 800-61 es el estándar de referencia para respuesta a incidentes.\n\nFASE 1 — PREPARACIÓN:\n- Políticas y procedimientos documentados\n- Herramientas instaladas y configuradas\n- Playbooks por tipo de incidente\n\nFASE 2 — DETECCIÓN Y ANÁLISIS:\n- Identificar el incidente\n- Clasificar severidad\n- Documentar todo desde el inicio\n\nFASE 3 — CONTENCIÓN:\n- Corto plazo: Aislar sistemas afectados\n- CRÍTICO: Preservar evidencias antes de actuar\n\nFASE 4 — ERRADICACIÓN:\n- Eliminar el malware y backdoors\n- Parchear vulnerabilidades explotadas\n\nFASE 5 — RECUPERACIÓN:\n- Restaurar desde backup limpio\n- Monitorización intensiva post-restauración\n\nFASE 6 — LECCIONES APRENDIDAS:\n- Post-mortem: ¿Qué falló?\n- Actualizar playbooks\n- Mejorar reglas de detección`,
        preguntas:[
          {pregunta:'¿Cuál es la fase donde se elimina el malware?',opciones:['Contención','Recuperación','Erradicación','Preparación'],correcta:2},
          {pregunta:'¿Por qué preservar evidencias ANTES de contener?',opciones:['Por protocolo burocrático','Para análisis forense posterior','Porque no es urgente','Para informar a prensa'],correcta:1},
          {pregunta:'La fase de Lecciones Aprendidas sirve para...',opciones:['Celebrar el éxito','Mejorar procesos y detecciones para el futuro','Cerrar tickets','Informar a clientes'],correcta:1},
          {pregunta:'¿Qué viene ANTES de la Erradicación en NIST?',opciones:['Recuperación','Preparación','Lecciones Aprendidas','Contención'],correcta:3},
        ]
      },
      { id:2, titulo:'Clasificación y severidad de incidentes', xp:35, teoria:`Clasificar correctamente es una de las habilidades más críticas del analista L1.\n\nNIVELES DE SEVERIDAD:\n- 🔴 CRÍTICO — Impacto inmediato. Ransomware activo, DC comprometido. Respuesta: <15 minutos\n- 🟠 ALTO — Riesgo significativo. Malware detectado, cuentas privilegiadas. Respuesta: <1 hora\n- 🟡 MEDIO — Impacto limitado. Malware en endpoint aislado. Respuesta: <4 horas\n- 🟢 BAJO — Poco impacto. Escaneo de puertos bloqueado. Respuesta: <24 horas\n\nFACTORES PARA CLASIFICAR:\n- ¿Qué sistemas están afectados? DC > servidor > endpoint\n- ¿Hay datos sensibles en riesgo?\n- ¿El ataque está activo o fue contenido?\n- ¿Cuántos usuarios afectados?`,
        preguntas:[
          {pregunta:'Ransomware activo en 50 sistemas. ¿Qué severidad?',opciones:['Baja','Media','Alta','Crítica'],correcta:3},
          {pregunta:'Escaneo de puertos bloqueado por firewall. ¿Severidad?',opciones:['Crítica','Alta','Baja','Media'],correcta:2},
          {pregunta:'¿Cuál es el tiempo máximo para un incidente CRÍTICO?',opciones:['24 horas','4 horas','1 hora','15 minutos'],correcta:3},
          {pregunta:'Un Domain Controller comprometido se clasifica como...',opciones:['Medio','Bajo','Crítico','Alto'],correcta:2},
        ]
      },
      { id:3, titulo:'CASO PRÁCTICO — Respuesta a Ransomware', xp:70, esCaso:true, teoria:`CASO REAL: Ataque de ransomware tipo WannaCry\n\nCRONOLOGÍA:\n- 08:20 — Phishing ejecutado por usuario de contabilidad\n- 08:22 — Descarga de payload desde 91.108.4.55\n- 08:23 — Explota MS17-010 (EternalBlue) via SMB 445\n- 08:25 — Propagación a 12 equipos de la red\n- 08:47 — Primera alerta en SIEM (27 minutos después)\n\nSEÑALES:\n- Archivos con extensión .encrypted\n- EDR: svchost_update.exe cifrando archivos masivamente\n- EventID 7045 en 12 equipos (servicio malicioso)\n- Tráfico SMB masivo interno en puerto 445\n\nRESPUESTA:\n- 08:50 — Segmentar red, aislar 12 equipos\n- 09:30 — Identificar y eliminar payload\n- 12:00 — Restaurar desde backup del domingo`,
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
      { id:1, titulo:'¿Qué es el Threat Hunting?', xp:40, teoria:`El Threat Hunting es la búsqueda proactiva de amenazas que han evadido las defensas.\n\nDETECCIÓN REACTIVA VS HUNTING:\n- Reactiva — Esperas a que el SIEM o EDR genere una alerta\n- Hunting — Buscas activamente sin esperar alertas\n\n¿POR QUÉ ES NECESARIO?\nLos APT pueden permanecer meses sin generar alertas. Dwell time medio: 24 días.\n\nPROCESO:\n- HIPÓTESIS — Creo que hay un atacante usando PowerShell lateralmente\n- INVESTIGACIÓN — Busco en logs PowerShell ejecutándose inusualmente\n- ANÁLISIS — Evalúo los resultados\n- RESPUESTA — Si encuentro algo, inicio proceso de IR\n- MEJORA — Si no encuentro nada, mejoro detecciones del SIEM`,
        preguntas:[
          {pregunta:'¿Cuál es la diferencia clave entre detección reactiva y hunting?',opciones:['No hay diferencia','Detección reactiva espera alertas; hunting busca activamente','Hunting es más lento','La detección reactiva es más efectiva'],correcta:1},
          {pregunta:'¿Cuánto tiempo puede pasar un APT sin detectarse (dwell time)?',opciones:['1 hora','1 día','24 días','1 año'],correcta:2},
          {pregunta:'El primer paso del proceso de hunting es...',opciones:['Analizar logs','Formular una hipótesis','Instalar herramientas','Escalar al CISO'],correcta:1},
        ]
      },
      { id:2, titulo:'CASO PRÁCTICO — Hunting de cuenta comprometida', xp:60, esCaso:true, teoria:`CASO HUNTING: Detectar cuenta administrativa comprometida\n\nHIPÓTESIS: Atacante usa credenciales válidas para moverse lateralmente de noche.\n\nQUERY SIEM:\nindex=windows EventID=4624 LogonType=3\n| where hour<6 OR hour>22\n| stats count by user, src_ip, dest\n| where count > 3\n\nRESULTADOS SOSPECHOSOS:\n- Usuario: svc_backup (cuenta de servicio)\n- Horario: 02:14 a 04:37 AM\n- IPs origen: 5 IPs internas diferentes\n- Destinos: file-server-01, dc-01, hr-server\n- Total logins: 47 en 2 horas\n\nCONCLUSIÓN: Cuenta de servicio comprometida usada para reconocimiento y movimiento lateral.`,
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
      { id:1, titulo:'Fundamentos del Forense Digital', xp:45, teoria:`El forense digital investiga qué pasó, cómo pasó y quién lo hizo.\n\nPRINCIPIOS FUNDAMENTALES:\n- Preservación — Nunca alterar la evidencia original\n- Cadena de custodia — Documentar quién maneja qué y cuándo\n- Integridad — Verificar con hashes (MD5/SHA256)\n- Reproducibilidad — El análisis debe poder repetirse\n\nORDEN DE VOLATILIDAD:\n- Memoria RAM → Tráfico de red activo → Disco duro → Logs\n\nARTEFACTOS CLAVE EN WINDOWS:\n- Prefetch — Programas ejecutados recientemente\n- Registry — Configuración del sistema y autorun\n- Event Logs — Historial de actividad\n- Browser History — Historial de navegación`,
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
      { id:1, titulo:'Fundamentos de seguridad cloud', xp:50, teoria:`El cloud ha transformado el SOC. Los ataques y defensas son diferentes.\n\nMODELO DE RESPONSABILIDAD COMPARTIDA:\n- Cloud Provider — Seguridad DE la infraestructura física\n- Cliente — Seguridad EN la infraestructura (datos, configs, accesos)\n\nLOGS ESENCIALES EN AWS:\n- CloudTrail — Registra todas las llamadas a la API\n- VPC Flow Logs — Todo el tráfico de red\n- GuardDuty — Detección automática de amenazas\n\nATAQUES CLOUD MÁS FRECUENTES:\n- Credential stuffing — Robo de credenciales de consola\n- Misconfigured S3 buckets — Datos públicos por error\n- IAM privilege escalation — Escalar permisos via roles\n- Cryptojacking — Usar recursos comprometidos para minar`,
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
      { id:1, titulo:'Python para analistas SOC', xp:50, teoria:`Python es la herramienta de automatización del analista moderno.\n\nCASOS DE USO REALES:\n- Parsear y analizar miles de logs automáticamente\n- Buscar IOCs en VirusTotal y AbuseIPDB\n- Generar reportes de incidentes\n- Enriquecer alertas del SIEM con Threat Intelligence\n\nSCRIPT — VERIFICAR REPUTACIÓN DE IPS:\nimport requests\ndef check_ip(ip):\n    url = "https://api.abuseipdb.com/api/v2/check"\n    headers = {"Key": "API_KEY"}\n    r = requests.get(url, headers=headers, params={"ipAddress": ip})\n    return r.json()["data"]["abuseConfidenceScore"]\n\nfor ip in ips_from_siem:\n    score = check_ip(ip)\n    if score > 50:\n        print(f"ALERTA IP maliciosa: {ip} — Score: {score}")`,
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
      { id:1, titulo:'Análisis estático vs dinámico', xp:55, teoria:`El análisis de malware determina exactamente qué hace un archivo malicioso.\n\nANÁLISIS ESTÁTICO — SIN EJECUTAR:\n- Calcular hash SHA256 y buscar en VirusTotal\n- Strings — Extraer texto legible: URLs, IPs\n- PE Headers — Metadatos del ejecutable Windows\n- Imports — Funciones de Windows que usa el malware\n\nFUNCIONES SOSPECHOSAS:\n- 🔴 CreateRemoteThread — Inyección de código\n- 🔴 VirtualAllocEx — Reserva memoria en proceso ajeno\n- 🔴 WriteProcessMemory — Escribe código en proceso ajeno\n- 🔴 RegSetValueEx — Modifica registro (persistencia)\n\nANÁLISIS DINÁMICO — EN SANDBOX:\n- Any.run, Cuckoo Sandbox, Joe Sandbox\n- Se observa comportamiento real en tiempo de ejecución`,
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
      { id:1, titulo:'Simulacro Final — Gestión de incidente múltiple', xp:500, esCaso:true, teoria:`SIMULACRO FINAL: Son las 23:47. Eres el analista de guardia. Se disparan 10 alertas.\n\nUSA TODO LO APRENDIDO EN LOS 8 MÓDULOS ANTERIORES.\n\nALERTAS ACTIVAS:\n- 1. CRÍTICA — 1847 EventID 4625 hacia CORP-DC01 desde 185.220.101.45\n- 2. CRÍTICA — EDR: svchost.exe lanza powershell -enc base64\n- 3. ALTA — DNS: 847 queries a random-xyz.evil en 3 minutos\n- 4. ALTA — Nuevo usuario admin creado: backup_svc\n- 5. MEDIA — 50 instancias EC2 lanzadas en AWS a las 23:45\n- 6. MEDIA — RDP desde IP de Tor hacia servidor de contabilidad\n- 7. BAJA — Escaneo de puertos desde 10.0.0.45 (interno)\n- 8. BAJA — 3 intentos fallidos VPN usuario jgarcia\n- 9. INFO — Antivirus actualizado en 200 equipos\n- 10. INFO — Certificado SSL caducado en web corporativa`,
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

// Plataformas externas de training
const PLATAFORMAS = [
  { nombre:'TryHackMe', desc:'Salas interactivas de ciberseguridad. Ideal para complementar los fundamentos.', url:'https://tryhackme.com', color:'#1db954', emoji:'🟢', nivel:'Principiante - Intermedio', gratis:true },
  { nombre:'HackTheBox', desc:'Máquinas y challenges avanzados. Para analistas que quieren ir al siguiente nivel.', url:'https://hacktheboxacademy.com', color:'#9fef00', emoji:'💚', nivel:'Intermedio - Avanzado', gratis:false },
  { nombre:'Blue Team Labs', desc:'Laboratorios enfocados en defensa y análisis forense. Perfectos para SOC.', url:'https://blueteamlabs.online', color:'#0ea5e9', emoji:'🔵', nivel:'Todos los niveles', gratis:true },
  { nombre:'CyberDefenders', desc:'Challenges de Blue Team con logs reales. PCAP, SIEM, forense y más.', url:'https://cyberdefenders.org', color:'#f59e0b', emoji:'🟡', nivel:'Intermedio - Avanzado', gratis:true },
  { nombre:'LetsDefend', desc:'Plataforma SOC simulada. Gestiona alertas reales como si fueras L1/L2.', url:'https://letsdefend.io', color:'#8b5cf6', emoji:'🟣', nivel:'Todos los niveles', gratis:true },
  { nombre:'SANS Courses', desc:'Los mejores cursos de ciberseguridad del mundo. Caros pero valen cada euro.', url:'https://sans.org', color:'#dc2626', emoji:'🔴', nivel:'Todos los niveles', gratis:false },
];

// Certificaciones recomendadas
const CERTIFICACIONES = [
  { nombre:'CompTIA Security+', desc:'La cert de entrada más reconocida. Imprescindible para L1 SOC.', color:'#ef4444', dificultad:'Fácil', precio:'~380€', tiempo:'3-6 meses', credly:true },
  { nombre:'CompTIA CySA+', desc:'Cybersecurity Analyst. Específica para analistas SOC. Muy valorada.', color:'#f97316', dificultad:'Medio', precio:'~380€', tiempo:'6-9 meses', credly:true },
  { nombre:'eJPT — eLearnSecurity', desc:'Junior Penetration Tester. Buena base de red team para defenders.', color:'#0891b2', dificultad:'Fácil', precio:'~200€', tiempo:'2-4 meses', credly:false },
  { nombre:'BTL1 — Blue Team Labs', desc:'Blue Team Level 1. Práctica y reconocida en el sector SOC europeo.', color:'#0ea5e9', dificultad:'Medio', precio:'~200€', tiempo:'3-6 meses', credly:true },
  { nombre:'SC-200 — Microsoft Sentinel', desc:'Cert oficial de Microsoft para Sentinel. Muy demandada en empresas Azure.', color:'#0078d4', dificultad:'Medio', precio:'~165€', tiempo:'3-6 meses', credly:true },
  { nombre:'OSCP — OffSec', desc:'La cert más respetada del sector. Examen de 24h práctico. Para L3+.', color:'#dc2626', dificultad:'Difícil', precio:'~1499€', tiempo:'12-18 meses', credly:false },
];

// ── COMPONENTES ──────────────────────────────────────────────────────────────
function TeoriaRender({ texto, color }) {
  const T2 = '#374151'; const T3 = '#64748b';
  const lineas = texto.split('\n');
  const bloques = [];
  let parrafo = [];

  const flushP = () => { if (parrafo.length) { bloques.push({tipo:'p', texto:parrafo.join(' ')}); parrafo = []; } };

  for (const raw of lineas) {
    const l = raw.trim();
    if (!l) { flushP(); continue; }
    // Título de sección en mayúsculas
    if (l === l.toUpperCase() && l.length > 4 && l.length < 80 && /[A-ZÁÉÍÓÚ]/.test(l) && !l.startsWith('-') && !l.startsWith('🔴')) {
      flushP(); bloques.push({tipo:'h', texto:l}); continue;
    }
    // Item de lista
    if (/^[-•]\s/.test(l) || /^🔴|^🟠|^🟡|^🟢/.test(l)) {
      flushP(); bloques.push({tipo:'li', texto:l.replace(/^[-•]\s*/,'')}); continue;
    }
    // Código
    if (/^(import |def |for |with |index=|nmap |\w+ = )/.test(l)) {
      flushP(); bloques.push({tipo:'code', texto:l}); continue;
    }
    parrafo.push(l);
  }
  flushP();

  // Agrupar items de lista consecutivos
  const grouped = [];
  let liGroup = null;
  let codeGroup = null;
  for (const b of bloques) {
    if (b.tipo === 'li') {
      if (!liGroup) { liGroup = {tipo:'lista', items:[]}; grouped.push(liGroup); }
      liGroup.items.push(b.texto);
      codeGroup = null;
    } else if (b.tipo === 'code') {
      if (!codeGroup) { codeGroup = {tipo:'codigo', lineas:[]}; grouped.push(codeGroup); }
      codeGroup.lineas.push(b.texto);
      liGroup = null;
    } else {
      liGroup = null; codeGroup = null;
      grouped.push(b);
    }
  }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      {grouped.map((b,i) => {
        if (b.tipo==='p') return <p key={i} style={{fontSize:14,color:T2,lineHeight:1.8}}>{b.texto}</p>;
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
            </div>
            <div style={{padding:'14px 16px'}}>
              {b.lineas.map((l,j)=><div key={j} style={{fontSize:12,color:'#a5b4fc',fontFamily:'monospace',lineHeight:1.8}}>{l}</div>)}
            </div>
          </div>
        );
        return null;
      })}
    </div>
  );
}

// ── PÁGINA PRINCIPAL ──────────────────────────────────────────────────────────
export default function TrainingPage() {
  const navigate  = useNavigate();
  const { user }  = useAuth();
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
    setCompletadas(comp);  localStorage.setItem('sb_train_v2', JSON.stringify(comp));
    setCertificados(certs); localStorage.setItem('sb_certs_v2', JSON.stringify(certs));
  };

  const lComp  = mod => mod.lecciones.filter(l => completadas.includes(`${mod.id}-${l.id}`)).length;
  const mDone  = mod => mod.lecciones.length > 0 && lComp(mod) === mod.lecciones.length;
  const cPct   = curso => { const mods = curso.moduloIds.map(id=>MODULOS.find(m=>m.id===id)); const t=mods.reduce((a,m)=>a+m.lecciones.length,0); const h=mods.reduce((a,m)=>a+lComp(m),0); return t>0?Math.round((h/t)*100):0; };
  const cUnlock = curso => curso.id===1 || CURSOS[curso.id-2].moduloIds.every(id=>mDone(MODULOS.find(m=>m.id===id)));
  const totalLec = MODULOS.reduce((a,m)=>a+m.lecciones.length,0);

  const iniciar = (leccion) => {
    setLeccionActiva(leccion); setFase('teoria'); setRespuestas({}); setEnviado(false);
  };

  const nota = () => {
    const pregs = leccionActiva?.preguntas || [];
    if (!pregs.length) return 100;
    let c=0; pregs.forEach((p,i) => { if (respuestas[i]===p.correcta) c++; });
    return Math.round((c/pregs.length)*100);
  };

  const completar = () => {
    const key = `${moduloActivo.id}-${leccionActiva.id}`;
    const nuevas = completadas.includes(key) ? completadas : [...completadas, key];
    const todas  = moduloActivo.lecciones.map(l=>`${moduloActivo.id}-${l.id}`);
    let nuevosCerts = [...certificados];
    if (todas.every(k=>nuevas.includes(k)) && !certificados.find(c=>c.moduloId===moduloActivo.id)) {
      const cert = { moduloId:moduloActivo.id, titulo:moduloActivo.certificado, fecha:new Date().toLocaleDateString('es-ES'), color:moduloActivo.color };
      nuevosCerts = [...certificados, cert];
      save(nuevas, nuevosCerts);
      setCertModal(cert);
    } else {
      save(nuevas, nuevosCerts);
      setLeccionActiva(null);
    }
  };

  const css = BASE_CSS + `
    .tb:hover{color:#0f172a!important;}
    .lrow:hover{background:#f8f7ff!important;border-color:#c7d2fe!important;}
    .ccard:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,0.1)!important;}
    .pcard:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,0.08)!important;}
    .optb:hover{border-color:#a5b4fc!important;background:#f8f7ff!important;}
  `;

  // ── CERT MODAL ──
  if (certModal) return (
    <div style={{minHeight:'100vh',background:BG,display:'flex',alignItems:'center',justifyContent:'center',padding:24,fontFamily:'system-ui'}}>
      <style>{css}</style>
      <div style={{maxWidth:440,width:'100%',padding:'48px 40px',borderRadius:20,background:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 24px 80px rgba(0,0,0,0.12)',textAlign:'center',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,transparent,${certModal.color},transparent)`}}/>
        <div style={{width:60,height:60,borderRadius:'50%',background:`${certModal.color}12`,border:`1px solid ${certModal.color}25`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',fontSize:26}}>🏅</div>
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

  // ── LECCIÓN ──
  if (leccionActiva && moduloActivo) {
    const pregs   = leccionActiva.preguntas || [];
    const n       = nota();
    const modColor = moduloActivo.color;

    return (
      <div style={{minHeight:'100vh',background:BG,fontFamily:'system-ui'}}>
        <style>{css}</style>
        {/* Navbar leccion */}
        <nav style={{position:'sticky',top:0,zIndex:50,height:52,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 32px',background:'rgba(255,255,255,0.92)',backdropFilter:'blur(20px)',borderBottom:'1px solid #e8eaf0',boxShadow:'0 1px 16px rgba(79,70,229,0.07)'}}>
          <button onClick={()=>setLeccionActiva(null)} style={{display:'flex',alignItems:'center',gap:6,background:'none',border:'1px solid #e8eaf0',color:'#374151',padding:'5px 14px',borderRadius:8,fontSize:13,cursor:'pointer',fontWeight:500}}>
            ← Volver
          </button>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:modColor}}/>
            <span style={{fontSize:13,fontWeight:600,color:'#0f172a',maxWidth:400,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{leccionActiva.titulo}</span>
            {leccionActiva.esCaso && <span style={{fontSize:10,padding:'2px 8px',borderRadius:100,background:'rgba(239,68,68,0.08)',color:'#ef4444',fontWeight:700,border:'1px solid rgba(239,68,68,0.15)'}}>CASO PRÁCTICO</span>}
          </div>
          <span style={{fontSize:12,fontWeight:700,color:'#059669',padding:'4px 12px',borderRadius:8,background:'rgba(5,150,105,0.08)',border:'1px solid rgba(5,150,105,0.2)'}}>+{leccionActiva.xp} XP</span>
        </nav>

        <div style={{maxWidth:760,margin:'0 auto',padding:'32px 24px 80px'}}>
          {/* Tabs teoría/práctica */}
          <div style={{display:'flex',gap:4,marginBottom:28,padding:4,background:'#fff',borderRadius:12,border:'1px solid #e8eaf0',boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>
            {['teoria','practica'].map(f=>(
              <button key={f} onClick={()=>f==='teoria'&&setFase('teoria')}
                style={{flex:1,padding:10,borderRadius:9,fontSize:11,fontWeight:700,letterSpacing:'1.5px',cursor:'pointer',background:fase===f?modColor:'none',color:fase===f?'#fff':'#94a3b8',border:'none',transition:'all .15s'}}>
                {f==='teoria'?'TEORÍA':leccionActiva.esCaso?'CASO PRÁCTICO':'TEST'}
              </button>
            ))}
          </div>

          {/* TEORÍA */}
          {fase==='teoria' && (
            <div className="fu">
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:22}}>
                <div style={{width:3,height:24,borderRadius:2,background:modColor}}/>
                <h2 style={{fontSize:20,fontWeight:800,color:'#0f172a',letterSpacing:'-0.4px'}}>{leccionActiva.titulo}</h2>
              </div>
              <div style={{marginBottom:24}}>
                <TeoriaRender texto={leccionActiva.teoria} color={modColor}/>
              </div>
              <button onClick={()=>setFase('practica')}
                style={{width:'100%',padding:15,borderRadius:12,background:`linear-gradient(135deg,${modColor},${modColor}cc)`,border:'none',color:'#fff',fontWeight:700,fontSize:15,cursor:'pointer',boxShadow:`0 4px 16px ${modColor}30`}}>
                {leccionActiva.esCaso?'Ir al Caso Práctico →':'Ir al Test →'}
              </button>
            </div>
          )}

          {/* PRÁCTICA */}
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
                            if (j===p.correcta)             { bg='rgba(5,150,105,0.06)'; border='rgba(5,150,105,0.25)'; color='#059669'; icon='✓'; }
                            else if (respuestas[i]===j)     { bg='rgba(239,68,68,0.06)'; border='rgba(239,68,68,0.2)';  color='#ef4444'; icon='✗'; }
                          } else if (respuestas[i]===j)     { bg=`${modColor}08`; border=`${modColor}40`; color=modColor; }
                          return (
                            <button key={j} className="optb" onClick={()=>!enviado&&setRespuestas(r=>({...r,[i]:j}))}
                              style={{padding:'10px 14px',borderRadius:9,background:bg,border:`1px solid ${border}`,color,fontSize:13,cursor:enviado?'default':'pointer',textAlign:'left',display:'flex',alignItems:'center',gap:10,transition:'all .15s'}}>
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
                  style={{width:'100%',padding:15,borderRadius:12,background:`linear-gradient(135deg,${ACC},#6366f1)`,border:'none',color:'#fff',fontWeight:700,fontSize:15,cursor:'pointer',boxShadow:'0 4px 16px rgba(79,70,229,0.3)'}}>
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
                    <button onClick={completar} style={{width:'100%',padding:15,borderRadius:12,background:'rgba(5,150,105,0.08)',border:'1px solid rgba(5,150,105,0.25)',color:'#059669',fontWeight:700,fontSize:15,cursor:'pointer'}}>
                      Completar lección (+{leccionActiva.xp} XP) →
                    </button>
                  ) : (
                    <button onClick={()=>{setEnviado(false);setRespuestas({});setFase('teoria');}} style={{width:'100%',padding:15,borderRadius:12,background:'#f8f7ff',border:'1px solid #e8eaf0',color:'#374151',fontWeight:600,fontSize:15,cursor:'pointer'}}>
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

  // ── MÓDULOS DE UN CURSO ──
  if (cursoActivo) {
    const mods = cursoActivo.moduloIds.map(id=>MODULOS.find(m=>m.id===id));
    return (
      <div style={{minHeight:'100vh',background:BG,fontFamily:'system-ui'}}>
        <style>{css}</style>
        <nav style={{position:'sticky',top:0,zIndex:50,height:52,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 32px',background:'rgba(255,255,255,0.92)',backdropFilter:'blur(20px)',borderBottom:'1px solid #e8eaf0',boxShadow:'0 1px 16px rgba(79,70,229,0.07)'}}>
          <button onClick={()=>{setCursoActivo(null);setModuloActivo(null);}} style={{display:'flex',alignItems:'center',gap:6,background:'none',border:'1px solid #e8eaf0',color:'#374151',padding:'5px 14px',borderRadius:8,fontSize:13,cursor:'pointer',fontWeight:500}}>
            ← Training
          </button>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:16}}>{cursoActivo.icono}</span>
            <span style={{fontSize:14,fontWeight:700,color:'#0f172a'}}>{cursoActivo.titulo}</span>
          </div>
          <span style={{fontSize:12,fontWeight:700,color:cursoActivo.color,padding:'4px 12px',borderRadius:8,background:`${cursoActivo.color}08`,border:`1px solid ${cursoActivo.color}20`}}>{cPct(cursoActivo)}% completado</span>
        </nav>

        <div style={{maxWidth:900,margin:'0 auto',padding:'32px 24px 64px'}}>
          {/* Header curso */}
          <div style={{padding:'22px 28px',borderRadius:16,background:'#fff',border:'1px solid #e8eaf0',marginBottom:24,boxShadow:'0 2px 12px rgba(79,70,229,0.06)',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,transparent,${cursoActivo.color},transparent)`}}/>
            <div style={{display:'flex',alignItems:'center',gap:16}}>
              <div style={{width:52,height:52,borderRadius:14,background:`${cursoActivo.color}10`,border:`1px solid ${cursoActivo.color}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{cursoActivo.icono}</div>
              <div style={{flex:1}}>
                <h2 style={{fontSize:20,fontWeight:800,color:'#0f172a',marginBottom:2}}>{cursoActivo.titulo}</h2>
                <p style={{fontSize:13,color:'#64748b'}}>{cursoActivo.subtitulo} · {cursoActivo.nivel} · {cursoActivo.duracion}</p>
              </div>
            </div>
          </div>

          {/* Módulos */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:24}}>
            {mods.map(mod => {
              const done  = mDone(mod);
              const comp  = lComp(mod);
              const total = mod.lecciones.length;
              const pct   = total>0?(comp/total)*100:0;
              const cert  = certificados.find(c=>c.moduloId===mod.id);
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
                      {cert && <span style={{fontSize:12}}>🏅</span>}
                      <span style={{fontSize:10,padding:'2px 8px',borderRadius:5,background:done?'rgba(5,150,105,0.08)':`${mod.color}10`,color:done?'#059669':mod.color,fontWeight:700,border:`1px solid ${done?'rgba(5,150,105,0.2)':mod.color+'25'}`}}>
                        {done?'DONE':'OPEN'}
                      </span>
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

          {/* Lecciones del módulo activo */}
          {moduloActivo && cursoActivo.moduloIds.includes(moduloActivo.id) && (
            <div className="s1" style={{padding:'22px 24px',borderRadius:16,background:'#fff',border:`1px solid ${moduloActivo.color}20`,boxShadow:'0 4px 16px rgba(0,0,0,0.06)',position:'relative',overflow:'hidden'}}>
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
                          {lec.esCaso && <span style={{fontSize:9,padding:'2px 7px',borderRadius:5,background:'rgba(239,68,68,0.07)',color:'#ef4444',border:'1px solid rgba(239,68,68,0.15)',fontFamily:'monospace',fontWeight:700}}>CASO</span>}
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

  // ── VISTA PRINCIPAL ──────────────────────────────────────────────────────────
  const totalXP = MODULOS.reduce((a,m)=>a+m.xp,0);

  return (
    <div style={{minHeight:'100vh',background:BG,fontFamily:'system-ui',color:'#0f172a'}}>
      <style>{css}</style>
      <SBNav user={user} avatarConfig={avatarConfig} foto={foto} activePage="/training" navigate={navigate}/>

      <div style={{maxWidth:1080,margin:'0 auto',padding:'36px 24px 64px'}}>

        {/* HEADER */}
        <div className="fu" style={{marginBottom:32}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'4px 14px',borderRadius:100,background:'#eef2ff',border:'1px solid #c7d2fe',marginBottom:14}}>
            <Icon name="book" size={11} color={ACC}/>
            <span style={{fontSize:11,fontWeight:700,color:ACC,letterSpacing:'1.5px'}}>SOC TRAINING PLATFORM</span>
          </div>
          <h1 style={{fontSize:32,fontWeight:900,color:'#0f172a',letterSpacing:'-0.8px',marginBottom:8,lineHeight:1.1}}>
            Conviértete en<br/><span style={{color:ACC}}>analista SOC profesional</span>
          </h1>
          <p style={{fontSize:15,color:'#64748b',marginBottom:20,maxWidth:560,lineHeight:1.6}}>{MODULOS.length} módulos · 3 cursos · {totalXP.toLocaleString()} XP disponibles · Casos prácticos reales · Certificados verificables</p>
          <div style={{display:'flex',alignItems:'center',gap:12,maxWidth:400}}>
            <div style={{flex:1,height:6,borderRadius:3,background:'#e8eaf0',overflow:'hidden'}}>
              <div style={{width:`${totalLec>0?(completadas.length/totalLec)*100:0}%`,height:'100%',borderRadius:3,background:`linear-gradient(90deg,${ACC},#059669)`}}/>
            </div>
            <span style={{fontSize:12,color:'#94a3b8',fontFamily:'monospace',flexShrink:0}}>{completadas.length}/{totalLec} lecciones</span>
          </div>
        </div>

        {/* CERTIFICADOS OBTENIDOS */}
        {certificados.length > 0 && (
          <div className="s1" style={{padding:'16px 20px',borderRadius:14,background:'#fff',border:'1px solid rgba(217,119,6,0.2)',marginBottom:24,boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
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

        {/* TABS */}
        <div style={{display:'flex',gap:4,marginBottom:28,borderBottom:'1px solid #e8eaf0'}}>
          {[{id:'cursos',l:'Cursos SocBlast'},{id:'plataformas',l:'Plataformas externas'},{id:'certificaciones',l:'Certificaciones'}].map(t=>(
            <button key={t.id} className="tb" onClick={()=>setTab(t.id)}
              style={{padding:'10px 20px',background:'none',border:'none',cursor:'pointer',fontSize:13,fontWeight:600,color:tab===t.id?'#0f172a':'#94a3b8',borderBottom:tab===t.id?`2.5px solid ${ACC}`:'2.5px solid transparent',marginBottom:-1,transition:'all .15s'}}>
              {t.l}
            </button>
          ))}
        </div>

        {/* TAB CURSOS */}
        {tab==='cursos' && (
          <div className="fu" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
            {CURSOS.map(curso => {
              const unlock = cUnlock(curso);
              const pct    = cPct(curso);
              const done   = pct===100;
              return (
                <div key={curso.id} className={unlock?'ccard':''} onClick={()=>{if(!unlock)return;setCursoActivo(curso);setModuloActivo(null);}}
                  style={{borderRadius:20,background:'#fff',border:done?'1px solid rgba(5,150,105,0.2)':unlock?`1px solid ${curso.color}20`:'1px solid #e8eaf0',cursor:unlock?'pointer':'not-allowed',opacity:unlock?1:.4,overflow:'hidden',boxShadow:unlock?'0 4px 20px rgba(0,0,0,0.07)':'none',transition:'all .2s'}}>
                  {/* Header coloreado */}
                  <div style={{height:100,background:unlock?`linear-gradient(135deg,${curso.color}12,${curso.color}04)`:'#f8f7ff',display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
                    <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:unlock?`linear-gradient(90deg,transparent,${curso.color},transparent)`:undefined}}/>
                    <div style={{width:56,height:56,borderRadius:16,background:`${curso.color}12`,border:`1px solid ${curso.color}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26}}>{curso.icono}</div>
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
                    <p style={{fontSize:12,color:curso.color,marginBottom:10,fontStyle:'italic'}}>{curso.subtitulo}</p>
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
                    {unlock && <p style={{fontSize:12,color:curso.color,fontWeight:700,fontFamily:'monospace'}}>{done?'Ver certificados →':'Comenzar →'}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB PLATAFORMAS */}
        {tab==='plataformas' && (
          <div className="fu">
            <div style={{padding:'16px 20px',borderRadius:14,background:'linear-gradient(135deg,rgba(79,70,229,0.05),rgba(99,102,241,0.03))',border:'1px solid #c7d2fe',marginBottom:24}}>
              <p style={{fontSize:13,color:'#374151',lineHeight:1.7}}>
                Complementa tu formación SocBlast con estas plataformas externas. Todas son reconocidas por empresas reales. Pronto podrás conectar tu perfil de TryHackMe y HackTheBox directamente desde SocBlast.
              </p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
              {PLATAFORMAS.map((p,i)=>(
                <div key={i} className="pcard" onClick={()=>window.open(p.url,'_blank')}
                  style={{padding:'22px 20px',borderRadius:16,background:'#fff',border:'1px solid #e8eaf0',cursor:'pointer',boxShadow:'0 2px 10px rgba(0,0,0,0.05)',transition:'all .2s',position:'relative',overflow:'hidden'}}>
                  <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,transparent,${p.color},transparent)`}}/>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                    <span style={{fontSize:22}}>{p.emoji}</span>
                    <div>
                      <h3 style={{fontSize:15,fontWeight:800,color:'#0f172a',marginBottom:1}}>{p.nombre}</h3>
                      <span style={{fontSize:10,padding:'2px 7px',borderRadius:5,background:p.gratis?'rgba(5,150,105,0.08)':'rgba(217,119,6,0.08)',color:p.gratis?'#059669':'#d97706',fontWeight:700,border:`1px solid ${p.gratis?'rgba(5,150,105,0.2)':'rgba(217,119,6,0.2)'}`}}>{p.gratis?'Gratis':'De pago'}</span>
                    </div>
                  </div>
                  <p style={{fontSize:12,color:'#64748b',lineHeight:1.65,marginBottom:12}}>{p.desc}</p>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:11,color:'#94a3b8'}}>{p.nivel}</span>
                    <span style={{fontSize:12,color:p.color,fontWeight:700}}>Abrir →</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginTop:20,padding:'16px 20px',borderRadius:12,background:'#f8f7ff',border:'1px solid #c7d2fe',display:'flex',alignItems:'center',gap:12}}>
              <span style={{fontSize:20}}>🔗</span>
              <div>
                <p style={{fontSize:13,fontWeight:600,color:'#0f172a',marginBottom:2}}>Integraciones próximamente</p>
                <p style={{fontSize:12,color:'#64748b'}}>Conecta tu cuenta de TryHackMe y HackTheBox para que tus logros aparezcan en tu Analyst Card automáticamente.</p>
              </div>
              <span style={{fontSize:11,padding:'4px 12px',borderRadius:100,background:'#eef2ff',color:ACC,fontWeight:700,flexShrink:0,border:'1px solid #c7d2fe'}}>Próximamente</span>
            </div>
          </div>
        )}

        {/* TAB CERTIFICACIONES */}
        {tab==='certificaciones' && (
          <div className="fu">
            <div style={{padding:'16px 20px',borderRadius:14,background:'linear-gradient(135deg,rgba(79,70,229,0.05),rgba(99,102,241,0.03))',border:'1px solid #c7d2fe',marginBottom:24}}>
              <p style={{fontSize:13,color:'#374151',lineHeight:1.7}}>
                Estas son las certificaciones más valoradas en el sector SOC. Pronto podrás añadirlas a tu Analyst Card desde Perfil → Certificaciones. Las de Credly se verificarán automáticamente.
              </p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
              {CERTIFICACIONES.map((cert,i)=>(
                <div key={i} style={{padding:'20px',borderRadius:16,background:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 10px rgba(0,0,0,0.05)',position:'relative',overflow:'hidden'}}>
                  <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,transparent,${cert.color},transparent)`}}/>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                    <h3 style={{fontSize:14,fontWeight:700,color:'#0f172a',lineHeight:1.4,flex:1,paddingRight:8}}>{cert.nombre}</h3>
                    {cert.credly && <span style={{fontSize:9,padding:'2px 7px',borderRadius:5,background:'rgba(217,119,6,0.08)',color:'#d97706',fontWeight:700,border:'1px solid rgba(217,119,6,0.2)',flexShrink:0}}>Credly</span>}
                  </div>
                  <p style={{fontSize:12,color:'#64748b',lineHeight:1.6,marginBottom:14}}>{cert.desc}</p>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
                    {[{l:'Dificultad',v:cert.dificultad},{l:'Precio',v:cert.precio},{l:'Tiempo',v:cert.tiempo}].slice(0,2).map((s,j)=>(
                      <div key={j} style={{padding:'7px 10px',borderRadius:8,background:'#f8f7ff',border:'1px solid #e8eaf0',textAlign:'center'}}>
                        <p style={{fontSize:9,color:'#94a3b8',marginBottom:2,fontFamily:'monospace'}}>{s.l.toUpperCase()}</p>
                        <p style={{fontSize:11,fontWeight:700,color:'#374151'}}>{s.v}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{marginTop:8,padding:'7px 10px',borderRadius:8,background:'#f8f7ff',border:'1px solid #e8eaf0',textAlign:'center'}}>
                    <p style={{fontSize:9,color:'#94a3b8',marginBottom:2,fontFamily:'monospace'}}>TIEMPO ESTIMADO</p>
                    <p style={{fontSize:11,fontWeight:700,color:'#374151'}}>{cert.tiempo}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginTop:20,padding:'16px 20px',borderRadius:12,background:'#f8f7ff',border:'1px solid #c7d2fe',display:'flex',alignItems:'center',gap:12}}>
              <span style={{fontSize:20}}>🏅</span>
              <div>
                <p style={{fontSize:13,fontWeight:600,color:'#0f172a',marginBottom:2}}>Añade tus certificaciones a tu Analyst Card</p>
                <p style={{fontSize:12,color:'#64748b'}}>Las certificaciones verificadas aparecerán en tu perfil público con badge ✓. Las de Credly se verifican automáticamente con tu URL de badge.</p>
              </div>
              <button onClick={()=>navigate('/perfil')} style={{padding:'8px 16px',borderRadius:100,background:ACC,border:'none',color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',flexShrink:0}}>Ir a perfil</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}