const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');
let newProjects = fs.readFileSync('new_projects.html', 'utf8');

// 1. Inject projects-grid
const projStart = content.indexOf('<section class="page" id="page-projects"');
const gridStart = content.indexOf('<div class="projects-grid">', projStart);
const gridEndMarker = 'data-next="photos"';
const gridEnd = content.indexOf(gridEndMarker, gridStart);
const afterCommentIndex = content.lastIndexOf('<!--', gridEnd);

const before = content.substring(0, gridStart);
const after = content.substring(afterCommentIndex);

content = before + newProjects + '\n                </div>\n\n                ' + after;

// 2. Inject pdf_data.js script tag before app.js if not present
if (!content.includes('pdf_data.js')) {
    content = content.replace('<script src="js/app.js"></script>', '<script src="js/pdf_data.js"></script>\n    <script src="js/app.js"></script>');
}

fs.writeFileSync('index.html', content, 'utf8');
console.log('Injection successful');
