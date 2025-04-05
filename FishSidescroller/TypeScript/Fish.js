var Endgame;
(function (Endgame) {
    class Fish extends Endgame.MovingObject {
        constructor(color) {
            super();
            this.x = Endgame.crc.canvas.width / 2;
            this.y = Endgame.crc.canvas.height / 2;
            this.r = 10;
            this.color = color;
            this.dx = 0.25;
            this.dy = 0;
        }
        draw() {
            const r = this.r;
            const x = this.x;
            const y = this.y;

            const gradient = Endgame.crc.createRadialGradient(x, y, r * 0.3, x, y, r);
            gradient.addColorStop(0, "white");
            gradient.addColorStop(1, this.color);

            let body = new Path2D();
            body.arc(x, y, r, 0, 2 * Math.PI);
            Endgame.crc.fillStyle = gradient;
            Endgame.crc.fill(body);

            let highlight = new Path2D();
            highlight.arc(x - r * 0.3, y - r * 0.3, r * 0.2, 0, 2 * Math.PI);
            Endgame.crc.fillStyle = "rgba(255,255,255,0.3)";
            Endgame.crc.fill(highlight);

            let eyeballs = new Path2D();
            eyeballs.arc(x + r * 0.3, y - r * 0.2, r * 0.33, 0, 2 * Math.PI);
            Endgame.crc.fillStyle = "white";
            Endgame.crc.fill(eyeballs);
            const irisGradient = Endgame.crc.createRadialGradient(x + r * 0.3, y - r * 0.2, 1, x + r * 0.3, y - r * 0.2, r * 0.1);
            irisGradient.addColorStop(0, "black");
            irisGradient.addColorStop(1, "#333");

            let iris = new Path2D();
            iris.arc(x + r * 0.3, y - r * 0.2, r * 0.1, 0, 2 * Math.PI);
            Endgame.crc.fillStyle = irisGradient;
            Endgame.crc.fill(iris);

            let tail = new Path2D();
            tail.moveTo(x - r, y);
            tail.quadraticCurveTo(x - r - 15, y - 20, x - r - 25, y);
            tail.quadraticCurveTo(x - r - 15, y + 20, x - r, y);
            Endgame.crc.fillStyle = "#ff4d4d";
            Endgame.crc.fill(tail);

            let fin = new Path2D();
            fin.moveTo(x - r * 0.3, y + r * 0.3);
            fin.lineTo(x + r * 0.5, y + r * 0.6);
            fin.lineTo(x - r * 0.5, y + r);
            fin.closePath();
            Endgame.crc.fillStyle = "rgba(255,255,255,0.6)";
            Endgame.crc.fill(fin);
        }

        move() {
            this.x += this.dx;
            this.y += this.dy;
        }
        update() {
            this.move();
            this.draw();
        }
        collisionEnemy(_collision) {
            let distanceX = this.x - _collision.x;
            let distanceY = this.y - _collision.y;
            let radiisum = this.r + _collision.r;
            let crash = true;
            if (distanceX * distanceX + distanceY * distanceY <= radiisum * radiisum) {
                return crash;
            }
            return false;
        }
    }
    Endgame.Fish = Fish;
})(Endgame || (Endgame = {}));