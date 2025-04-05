var Endgame;
(function (Endgame) {
    class Bubble extends Endgame.MovingObject {
        constructor() {
            super();
            this.x = Math.random() * 550 + 100;
            this.y = 450;
            this.dy = Math.random() * -1.5;
            this.r = 10;
            this.type = 3;
        }
        draw() {
            const r = this.r;
            const x = this.x;
            const y = this.y;

            const gradient = Endgame.crc.createRadialGradient(x, y, r * 0.1, x, y, r);
            gradient.addColorStop(0, "rgba(255, 255, 255, 0.6)");
            gradient.addColorStop(1, "rgba(173, 216, 230, 0.1)");

            let bubble = new Path2D();
            bubble.arc(x, y, r, 0, 2 * Math.PI);
            Endgame.crc.fillStyle = gradient;
            Endgame.crc.fill(bubble);

            let highlight = new Path2D();
            highlight.arc(x - r * 0.4, y - r * 0.4, r * 0.2, 0, 2 * Math.PI);
            Endgame.crc.fillStyle = "rgba(255,255,255,0.7)";
            Endgame.crc.fill(highlight);

            Endgame.crc.strokeStyle = "rgba(255,255,255,0.3)";
            Endgame.crc.lineWidth = 1;
            Endgame.crc.stroke(bubble);
        }
        update() {
            this.move();
            this.draw();
        }
        move() {
            this.y += this.dy;
            if (this.y + 20 < 0) {
                this.y = 450;
                this.x = Math.random() * 550 + 100;
            }
        }
    }
    Endgame.Bubble = Bubble;
})(Endgame || (Endgame = {}));
//# sourceMappingURL=Bubble.js.map