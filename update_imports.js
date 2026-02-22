const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            results.push(file);
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src/app'));

files.forEach(file => {
    if (!file.endsWith('.tsx') && !file.endsWith('.ts')) return;
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace editors
    content = content.replace(/@\/legacy-pages\/BlogEditorEnhanced/g, '@/components/admin/blog/BlogEditorEnhanced');
    content = content.replace(/@\/legacy-pages\/ProjectEditorEnhanced/g, '@/components/admin/project/ProjectEditorEnhanced');

    // Replace all other views with co-located imports
    // The previous imports looked like: import AboutPage from "@/legacy-pages/AboutPage";
    // We want to replace "@/legacy-pages/AboutPage" with "./AboutPage"
    content = content.replace(/@\/legacy-pages\/([A-Za-z0-9_]+)/g, './$1');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
