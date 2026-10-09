const fs = require('fs');
const path = require('path');

const historiaDir = path.join(__dirname, 'historia');
const files = fs.readdirSync(historiaDir).filter(f => f.endsWith('.md')).sort();

const chapters = files.map(file => {
  const content = fs.readFileSync(path.join(historiaDir, file), 'utf8');
  const lines = content.split('\n');
  
  const getMeta = (key) => {
    const line = lines.find(l => l.trim().startsWith(key + ':'));
    if (!line) return '';
    return line.replace(new RegExp(`^${key}:\\s*"?([^"]*)"?`), '$1').trim();
  };

  return {
    id: file.replace('.md', ''),
    acto: getMeta('acto'),
    segmento: getMeta('segmento'),
    titulo: getMeta('titulo'),
    periodo: getMeta('periodobiblico'),
    content: content
  };
});

fs.writeFileSync(path.join(__dirname, 'web_app', 'data.json'), JSON.stringify(chapters, null, 2), 'utf8');
console.log(`¡data.json actualizado con éxito! Total capítulos: ${chapters.length}`);
