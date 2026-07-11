#!/usr/bin/env node
/**
 * MERGE EXPANSIONS → JSON BODIES
 * Integra los fragmentos HTML de expansions/ en los JSONs correspondientes
 * y regenera los artículos con generar-v2.js
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const MOTOR_DIR = __dirname;
const EXPANSIONS_DIR = path.join(MOTOR_DIR, "expansions");
const BLOG_DIR = path.join(MOTOR_DIR, "..", "blog");

// Mapeo: slug → nombre archivo JSON
function slugToJsonFile(slug) {
  return path.join(MOTOR_DIR, `${slug}.json`);
}

function slugFromFilename(filename) {
  return filename.replace(/\.html$/, "");
}

console.log("🔄 Iniciando merge de expansiones...\n");

// Leer todos los HTML de expansions/
const expansionFiles = fs.readdirSync(EXPANSIONS_DIR).filter(f => f.endsWith(".html"));
console.log(`📦 Encontradas ${expansionFiles.length} expansiones\n`);

let merged = 0;
let created = 0;
let failed = 0;

for (const filename of expansionFiles) {
  const slug = slugFromFilename(filename);
  const expansionPath = path.join(EXPANSIONS_DIR, filename);
  const jsonPath = slugToJsonFile(slug);

  try {
    const expansion = fs.readFileSync(expansionPath, "utf8");

    if (fs.existsSync(jsonPath)) {
      // JSON existe: actualizar body
      const json = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

      // Preservar el body anterior (intro + h1 + primeros párrafos) y agregar expansión
      // Buscar dónde termina el primer párrafo o primera sección
      const bodyLines = (json.body || "").split("\n");
      const insertIdx = bodyLines.findIndex((l, i) =>
        i > 5 && (l.includes("</article>") || l.includes("</section>"))
      );

      if (insertIdx > 0) {
        // Insertar expansion antes del cierre
        const newBody = bodyLines.slice(0, insertIdx).join("\n") +
                        "\n\n" + expansion + "\n\n" +
                        bodyLines.slice(insertIdx).join("\n");
        json.body = newBody;
      } else {
        // Fallback: concatenar al final
        json.body = (json.body || "") + "\n\n" + expansion;
      }

      fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2), "utf8");
      console.log(`✅ ${slug}: body actualizado`);
      merged++;
    } else {
      // JSON no existe: crear uno nuevo con el expansión como body
      console.log(`⚠️  ${slug}: JSON no existe (saltando por ahora)`);
      failed++;
    }
  } catch (err) {
    console.log(`❌ ${slug}: ${err.message}`);
    failed++;
  }
}

console.log(`\n📊 Resultados: ${merged} actualizados, ${created} creados, ${failed} saltados\n`);

// Regenerar HTMLs con generar-v2.js
console.log("🔨 Regenerando HTMLs...\n");
try {
  execSync("node generar-v2.js all", {
    cwd: MOTOR_DIR,
    stdio: "inherit"
  });
  console.log("\n✅ Regeneración completada\n");
} catch (err) {
  console.error("\n❌ Error en regeneración:", err.message);
}

console.log("🎉 Merge completado");