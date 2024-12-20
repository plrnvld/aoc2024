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

  getPos(wide: number, tall: number): [number, number] {
    return [modulo(this.x, wide), modulo(this.y, tall)];
  }
}

export function modulo(num: number, wrap: number) {
  if (num < 0) {
    return (wrap + (num % wrap)) % wrap;
  }

  return num % wrap;
}

function countConnected(robots: Robot[], wide: number, tall: number) {
  let connected = 0;

  for (const robot of robots) {
    const [x, y] = robot.getPos(wide, tall);
    if (
      robots.some((r) => {
        const [otherX, otherY] = r.getPos(wide, tall);
        return Math.abs(x - otherX) <= 1 && Math.abs(y - otherY) <= 1 &&
          !(x === otherX && y === otherY);
      })
    ) {
      connected += 1;
    }
  }

  return connected;
}

function printRobots(robots: Robot[], wide: number, tall: number): string {
  const countsTexts: string[] = [];
  const positions = robots.map((r) => r.getPos(wide, tall));

  for (let y = 0; y < tall; y++) {
    const counts: number[] = [];

    for (let x = 0; x < wide; x++) {
      const count = positions.filter((p) =>
        p.at(0) === x && p.at(1) === y
      ).length;
      counts.push(count);
    }

    const countsText = counts.map((c) => c === 0 ? "." : c.toString()).join("");
    // console.log(countsText);

    countsTexts.push(countsText);
  }

  return countsTexts.join("\n");
}

function parseRobot(line: string) {
  const parts = line.split(" v=");
  const [vX, vY] = parts[1].split(",").map((v) => parseInt(v));
  const [x, y] = parts[0].substring(2).split(",").map((p) => parseInt(p));

  return new Robot(x, y, vX, vY);
}

if (import.meta.main) {
  const text = await Deno.readTextFile("input");
  const lines = text.split("\n");
  const robots = lines.map((line) => parseRobot(line));

  let q1 = 0;
  let q2 = 0;
  let q3 = 0;
  let q4 = 0;

  const wide = 101;
  const tall = 103;

  const midX = (wide - 1) / 2;
  const midY = (tall - 1) / 2;

  const allTexts: string[] = [];

  for (let n = 0; n < 10000; n++) {
    const seconds = n + 1;
    console.log();
    console.log("%cSecond " + seconds, "color: #FFC0CB");

    for (const robot of robots) {
      robot.move(1);
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

    const robotText = "\n\nAFTER " + seconds + "\n" +
      printRobots(robots, wide, tall);
    const connected = countConnected(robots, wide, tall);
    console.log("Connection: " + connected);

    if (connected >= 300) {
      allTexts.push(robotText);
    }
  }

  await Deno.writeTextFile("easteregg.txt", allTexts.join("\n"));

  const product = q1 * q2 * q3 * q4;

  console.log(product);
}
