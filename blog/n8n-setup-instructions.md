# N8N Configuration — Blog Converter Webhook

## Objetivo
Este workflow recibe conversiones (leads) desde el formulario de descarga de guías en los artículos del blog y los envía automáticamente por:
- 📧 Email (a mesainteligentedemo@gmail.com)
- 💬 Telegram (al chat especificado)

---

## PASO 1: Crear el webhook en N8N

1. Ir a **n8n.io** → Login a tu cuenta
2. Crear nuevo Workflow: `+ New` → `Workflow`
3. Nombrar: `Victor IA Blog Conversions`
4. Agregar nodo: **Webhook** (búsqueda)
   - Method: `POST`
   - Path: `victor-ia-blog-conversions`
   - Copiar la URL completa que aparece (ej: `https://hook.n8n.cloud/webhook/...`)

---

## PASO 2: Actualizar la URL del webhook en converter.js

En: `C:\Users\inbou\victor-ia-home\blog\js\converter.js`

Buscar línea 8:
```javascript
this.n8nWebhook = options.n8nWebhook || 'https://hook.n8n.cloud/webhook/victor-ia-blog-conversions';
```

Reemplazar con tu URL real:
```javascript
this.n8nWebhook = 'https://hook.n8n.cloud/webhook/YOUR_ACTUAL_WEBHOOK_ID_HERE';
```

Luego: `git add` → `git commit` → `vercel --prod`

---

## PASO 3: Configurar Email (Gmail SMTP)

En el workflow de n8n, agregar estos nodos en orden:

### Nodo 1: Webhook (ya existe)
- Salida → siguiente nodo

### Nodo 2: Set (variables del email)
- Agregar campos:
  ```
  subject = "🎯 Nueva conversión blog: " + $json.article
  body = `
  <h2>Nueva Conversión - Blog</h2>
  <p><strong>Nombre:</strong> ${$json.name}</p>
  <p><strong>Email:</strong> ${$json.email}</p>
  <p><strong>Teléfono:</strong> ${$json.phone || 'No proporcionado'}</p>
  <p><strong>Artículo:</strong> ${$json.article}</p>
  <p><strong>Guía descargada:</strong> ${$json.guide}</p>
  <p><strong>Hora:</strong> ${$json.timestamp}</p>
  <hr>
  <p><small>Fuente: ${$json.source}</small></p>
  `
  ```

### Nodo 3: Gmail (requiere credenciales)
- Conectar con tu cuenta Gmail o Outlook
- **To:** `mesainteligentedemo@gmail.com`
- **Subject:** `{{$node.Set.data.item.json.subject}}`
- **Text:** `{{$node.Set.data.item.json.body}}`

---

## PASO 4: ~~Configurar Telegram~~ (SOLO EMAIL)

✅ **Las conversiones se envían SOLO a email, no a Telegram.**

No es necesario configurar Telegram. Todas las conversiones van a **mesainteligentedemo@gmail.com** automáticamente.

---

## PASO 5: Conectar nodos y activar

1. En n8n, conectar en orden:
   - Webhook → Set → Gmail
   
2. Botón **Save** (arriba)

3. Botón **Activate** (arriba derecha)

4. **Test**: Enviar un POST a tu webhook con JSON:
   ```json
   {
     "name": "Test User",
     "email": "test@example.com",
     "phone": "5551234567",
     "article": "ia-para-restaurantes-mexico",
     "guide": "ia-para-restaurantes-mexico",
     "timestamp": "2026-06-02T10:30:00Z",
     "source": "blog-converter"
   }
   ```

---

## PASO 6: Configurar descarga automática de guías

**Opción A: Guías en HTML** (actual)
- Ubicación: `/blog/guides/{slug}.html`
- El JavaScript descarga automáticamente

**Opción B: Guías en PDF**
- Convertir HTML a PDF con: `html2pdf`, `pdfkit`, o herramienta online
- Guardar en: `/blog/guides/{slug}.pdf`
- Mismo flujo automático

---

## Checklist de configuración

- [ ] Webhook creado en n8n
- [ ] URL del webhook pegada en converter.js
- [ ] Credenciales Gmail agregadas a n8n
- [ ] Nodos conectados correctamente
- [ ] Workflow activado en n8n
- [ ] Test realizado con conversión fake
- [ ] Email recibido en mesainteligentedemo@gmail.com ✓ ÚNICO DESTINO

---

## Escalado a 97 artículos

Una vez confirmado con 1 artículo:

1. **Duplicar generador de guías**: Script Python que crea HTML de guía para cada slug
2. **Duplicar incorporación del modal**: Script que agrega converter-modal a todos los artículos
3. **Un solo webhook n8n**: Procesa TODOS los artículos (funciona para todos automáticamente)

Total tiempo: ~2 horas para 97 artículos.

---

## Debugging

**El webhook no recibe datos:**
- [ ] Webhook activo en n8n? (botón Activate)
- [ ] URL correcta en converter.js?
- [ ] Console del navegador (F12) → hay errores?

**El email no se envía:**
- [ ] Credenciales Gmail válidas en n8n?
- [ ] Nodo Gmail conectado después de Set?

**El Telegram no llega:**
- [ ] Token valido?
- [ ] Chat ID correcto?
- [ ] Bot está activo?

---

## Referencias
- N8N Docs: https://docs.n8n.io/
- Gmail en n8n: https://docs.n8n.io/integrations/builtin/credentials/google/
- Telegram en n8n: https://docs.n8n.io/integrations/builtin/credentials/telegram/
