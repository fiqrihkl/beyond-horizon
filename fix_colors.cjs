const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'resources/js/Pages/Invitations/Show.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace Metallic Gradient text
content = content.replace(/bg-clip-text text-transparent bg-gradient-to-r from-neutral-400 via-white to-neutral-500/g, 'text-neutral-400');
content = content.replace(/bg-gradient-to-r from-neutral-400 via-white to-neutral-500 text-black shadow-\[0_10px_25px_-5px_rgba\(255,255,255,0\.4\)\] hover:brightness-110/g, 'bg-neutral-200 text-black hover:bg-white shadow-[0_10px_25px_-5px_rgba(255,255,255,0.4)]');
content = content.replace(/bg-gradient-to-r from-neutral-400 via-white to-neutral-500 text-black hover:brightness-110/g, 'bg-neutral-200 text-black hover:bg-white');
content = content.replace(/bg-gradient-to-r from-neutral-400 via-white to-neutral-500 text-black/g, 'bg-neutral-200 text-black hover:bg-white');

// Any remaining gold hex codes that might have been missed
// Luxury Theme Gold: #bf953f, #fcf6ba, #b38728
content = content.replace(/#bf953f/gi, '#a3a3a3'); // neutral-400
content = content.replace(/#fcf6ba/gi, '#ffffff'); // white
content = content.replace(/#b38728/gi, '#737373'); // neutral-500

// Add grayscale filter to any remaining images that might be gold (like corner ornaments)
content = content.replace(/style={{ backgroundImage: "url\('https:\/\/cdn-uploads.owlink.id\/c8776b90-ad6f-11f0-9962-7708b57ebb24.png'\)"/g, 
    'style={{ filter: "grayscale(100%) brightness(1.5)", backgroundImage: "url(\'https://cdn-uploads.owlink.id/c8776b90-ad6f-11f0-9962-7708b57ebb24.png\')"');

content = content.replace(/style={{ backgroundImage: "url\('https:\/\/cdn-uploads.owlink.id\/c8776b90-ad6f-11f0-9962-7708b57ebb24.png'\)", transform: "scale\(-1\)" }}/g, 
    'style={{ filter: "grayscale(100%) brightness(1.5)", backgroundImage: "url(\'https://cdn-uploads.owlink.id/c8776b90-ad6f-11f0-9962-7708b57ebb24.png\')", transform: "scale(-1)" }}');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Replaced metallic gradients, remaining gold hexes, and applied grayscale to ornaments in Show.jsx.');
