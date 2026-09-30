const sharp = require("sharp");
const path = require("path");

const W = 1200;
const H = 600;
const CREAM = "#FFF1DC";
const BROWN = "#4A3728";
const ORANGE = "#F4521E";
const MUTED = "#9B856E";

const logoPath = path.join(__dirname, "..", "public", "logo.png");
const outPath = path.join(__dirname, "..", "public", "og-image.png");

const FONT = "Apple SD Gothic Neo, AppleSDGothicNeo, sans-serif";

const textSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <style>
    .sub { font-family: ${FONT}; font-size: 40px; fill: ${MUTED}; font-weight: 500; }
    .big { font-family: ${FONT}; font-size: 78px; font-weight: 800; letter-spacing: -2px; }
  </style>
  <text x="630" y="245" class="sub">메뉴 고민은 그만,</text>
  <text x="628" y="345" class="big" fill="${BROWN}">내 주변 밥집</text>
  <text x="628" y="445" class="big" fill="${ORANGE}">랜덤 추천!</text>
</svg>`;

(async () => {
  const logo = await sharp(logoPath)
    .resize(520, 520, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: W,
      height: H,
      channels: 4,
      background: CREAM,
    },
  })
    .composite([
      { input: logo, left: 60, top: (H - 520) / 2 },
      { input: Buffer.from(textSvg), left: 0, top: 0 },
    ])
    .png()
    .toFile(outPath);

  console.log("OG image created:", outPath);
})();
