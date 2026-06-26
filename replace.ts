import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(/fetch\('/g, "authenticatedFetch('");
content = content.replace(/fetch\(\`/g, "authenticatedFetch(\`");
fs.writeFileSync('src/App.tsx', content);
