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

  move(secs: number) {
    this.x += this.vX * secs;
    this.y += this.vY * secs;
  }

  getPos(xWrap: number, yWrap: number): [number, number] {
    return [modulo(this.x, xWrap), modulo(this.y, yWrap)];
  }
}

export function modulo(num: number, wrap: number) {
  if (num < 0) {
    return (wrap + (num % wrap));
  }

  return num % wrap;
}

function printRobots(robots: Robot[], wide: number, tall: number) {
  const positions = robots.map(r => r.getPos(wide, tall));

  for (let y = 0; y < tall; y++) {
    const counts: number[] = [];
      
    for (let x = 0; x < wide; x++) {
      const count = positions.filter(p => p.at(0) === x && p.at(1) === y).length;
      counts.push(count);
    }

    const countsText = counts.map(c => c === 0 ? "." : c.toString()).join("");
    console.log(countsText);
  }
}

function parseRobot(line: string) {
  const parts = line.split(" v=");
  const [vX, vY] = parts[1].split(",").map((v) => parseInt(v));
  const [x, y] = parts[0].substring(2).split(",").map((p) => parseInt(p));

  return new Robot(x, y, vX, vY);
}

if (import.meta.main) {
  const text = await Deno.readTextFile("example");
  const lines = text.split("\n");
  const robots = lines.map((line) => parseRobot(line));

  const seconds = 5;

  let q1 = 0;
  let q2 = 0;
  let q3 = 0;
  let q4 = 0;

  const wide = 11;
  const tall = 7;

  const midX = (wide - 1) / 2;
  const midY = (tall - 1) / 2;

  for (const robot of robots) {
    robot.move(seconds);
    const [x, y] = robot.getPos(wide, tall);

    if (x < midX && y < midY) {
      q1 += 1;
    } else if (x > midX && y < midY) {
      q2 += 1;
    } else if (x > midX && y > midY) {
      q3 += 1;
    } else if (x < midX && y > midY) {
      q4 += 1;
    }

  }

  printRobots(robots, wide, tall);

  const product = q1 * q2 * q3 * q4;

  console.log(product);
}
