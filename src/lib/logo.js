// DW Logo as base64 for PDF embedding
// This is a placeholder SVG. Replace with actual logo by converting to base64.
// To convert: open logo image in browser, use canvas.toDataURL() or online converter

export const DW_LOGO_BASE64 = 'data:image/svg+xml;base64,' + btoa(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <circle cx="100" cy="100" r="98" fill="#1B5E20" stroke="#FFD700" stroke-width="3"/>
  <circle cx="100" cy="100" r="82" fill="white"/>
  <circle cx="100" cy="100" r="78" fill="#E8F5E9"/>
  <!-- Simplified DW emblem -->
  <path d="M100 35 L115 70 L150 70 L122 90 L132 125 L100 105 L68 125 L78 90 L50 70 L85 70 Z" fill="#FFD700" stroke="#B8860B" stroke-width="1"/>
  <circle cx="100" cy="80" r="15" fill="#DC143C"/>
  <rect x="93" y="65" width="14" height="30" rx="2" fill="white" opacity="0.9"/>
  <!-- Chain border -->
  ${Array.from({ length: 24 }, (_, i) => {
    const angle = (i * 15) * Math.PI / 180;
    const x = 100 + 90 * Math.cos(angle);
    const y = 100 + 90 * Math.sin(angle);
    return `<circle cx="${x}" cy="${y}" r="4" fill="#FFD700" stroke="#B8860B" stroke-width="0.5"/>`;
}).join('')}
  <text x="100" y="155" text-anchor="middle" font-size="14" font-weight="bold" fill="#1B5E20" font-family="serif">DHARMA WANITA</text>
  <text x="100" y="172" text-anchor="middle" font-size="10" font-weight="bold" fill="#1B5E20" font-family="serif">PERSATUAN</text>
</svg>
`);

// For user to replace with actual logo:
// 1. Convert logo.png to base64 at https://base64.guru/converter/encode/image
// 2. Replace the value above with: 'data:image/png;base64,<your_base64_string>'
