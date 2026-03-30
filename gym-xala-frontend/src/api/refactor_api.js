const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js') && f !== 'axiosClient.js' && f !== 'refactor_api.js');

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    
    // Remove multi-line headers completely:
    // matches: headers: { ... Authorization ... }
    content = content.replace(/headers:\s*\{\s*Authorization:\s*`Bearer \$\{token\}`\,?\s*\}\,?\s*/g, '');
    
    // remove left-over parameter commas or empty objects
    content = content.replace(/,\s*\}\)/g, '})');
    content = content.replace(/\{\s*\}\)/g, ')');
    content = content.replace(/\,\s*\)/g, ')');
    
    // Replace let url = `http://localhost:8080/api/admin/memberships/${membershipId}/approve`;
    content = content.replace(/http:\/\/localhost:8080\/api/g, '');

    fs.writeFileSync(path.join(dir, file), content, 'utf8');
});

console.log('Refactoring round 2 complete!');
