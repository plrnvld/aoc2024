class Robot {
  x: number;
  y: number;
  vX: number;
  vY: number;

  constructor(x: number, y: number, vX: number, vY: number) {
    this.x = x;
    this.y = y;
    this.vX = vX;
    this.vY = vY;
  }
}

export function modulo(num: number, wrap: number) {
  if (num < 0)
    return (wrap + (num % wrap));

  return num % wrap;
}

function parseRobot(line: string) {
  const parts = line.split(" v=");
  const [vX, vY] = parts[1].split(",").map(v => parseInt(v));
  const [x, y] = parts[0].substring(2).split(",").map(p => parseInt(p));
  
  return new Robot(x, y, vX, vY);
}

if (import.meta.main) {
  const text = await Deno.readTextFile("example");
  const lines = text.split("\n");
  const robots = lines.map(line => parseRobot(line));

  console.log(robots);
}
