const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'resources/js/Pages/Invitations/Show.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// The wrapper for Luxury Theme
content = content.replace(/'bg-\[#0a0a0a\] text-white font-serif'/g, "'bg-[#0a0a0a] text-white font-sans'");

// The headings for Luxury Theme
content = content.replace(/\? `text-4xl font-light tracking-\[0\.2em\] uppercase font-serif text-neutral-400 font-bold`/g, 
                          "? `text-4xl font-light tracking-[0.2em] uppercase font-sans text-neutral-400 font-bold`");
                          
content = content.replace(/\? `text-3xl font-light tracking-\[0\.2em\] uppercase font-serif text-neutral-400 font-bold`/g, 
                          "? `text-3xl font-light tracking-[0.2em] uppercase font-sans text-neutral-400 font-bold`");

// "LO VE" text
// Before: className="text-7xl md:text-9xl font-bold tracking-[0.15em] text-white leading-none translate-y-[15%] font-serif"
// Let's replace font-serif with font-sans for LO and VE
content = content.replace(/text-white leading-none translate-y-\[15%\] font-serif/g, "text-white leading-none translate-y-[15%] font-sans");
content = content.replace(/text-black leading-none -translate-y-\[15%\] font-serif/g, "text-black leading-none -translate-y-[15%] font-sans");

// Also check the Profiling section names "font-serif" 
// `text-3xl font-light tracking-widest font-serif mt-4 ${nameTextClass}` -> wait, this is used for non-luxury. 
// Luxury uses `text-4xl md:text-5xl mt-3 ${nameTextClass}` without font-serif inside the class, but uses style={{ fontFamily: "'Great Vibes', cursive" }}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fonts for inner sections in Luxury Theme updated to font-sans to match cover.');
