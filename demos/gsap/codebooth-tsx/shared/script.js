const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

/* configuration */
const rows = 10;
const cols = 10;

/** Wait a specified number of milliseconds. */
function wait(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

/** Generate a random color in hex format. */
function randomColor() {
  return (
    "#" +
    new Array(3)
      .fill(null)
      .map(() =>
        Math.floor(0x100 * Math.random())
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

/* set canvas dimensions */
function setDims() {
  const rect = canvas.getBoundingClientRect();
  canvas.height = rect.height;
  canvas.width = rect.width;
}
setDims();
// window.addEventListener("resize", setDims);

const rWidth = canvas.width / cols;
const rHeight = canvas.height / rows;

/* draw grid */
async function draw() {
  for (let i = 0; i < rows; ++i) {
    for (let j = 0; j < cols; ++j) {
      ctx.beginPath();
      ctx.fillStyle = randomColor();
      ctx.fillRect(j * rWidth, i * rHeight, rWidth, rHeight);
      await wait(50);
    }
  }
}

draw();
