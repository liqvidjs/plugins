export const files = {
  "index.html": `<html>
<head>
  <link href="style.css" rel="stylesheet"/>
</head>
<body>
  <canvas></canvas>
  <script src="script.js"></script>
</body>
</html>`,
  "style.css": `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body, canvas {
  height: 100%;
  width: 100%;
}
`,
  "script.js": `const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
`
};
