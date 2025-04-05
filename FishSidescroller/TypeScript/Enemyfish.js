var Endgame;
(function (Endgame) {
    class Enemyfish extends Endgame.MovingObject {
        constructor() {
            super();
            this.type = 1;
            this.x = -5;
            this.y = Math.random() * Endgame.canvas.height;
            this.r = 15;
            this.color = "black";
            this.dx = Math.random() * 2 - 2;
            this.dy = Math.random() * 2 - 2;
        }
        draw() {
            const r = this.r;
            const x = this.x;
            const y = this.y;
        
            const gradient = Endgame.crc.createRadialGradient(x, y, r * 0.2, x, y, r);
            gradient.addColorStop(0, "#333");
            gradient.addColorStop(1, "#000");
        
            let body = new Path2D();
            body.arc(x, y, r, 0, 2 * Math.PI);
            Endgame.crc.fillStyle = gradient;
            Endgame.crc.fill(body);
        
            let eyeball = new Path2D();
            eyeball.arc(x + r * 0.3, y - r * 0.2, r * 0.3, 0, 2 * Math.PI);
            Endgame.crc.fillStyle = "white";
            Endgame.crc.fill(eyeball);
        
            let iris = new Path2D();
            iris.arc(x + r * 0.3, y - r * 0.2, r * 0.1, 0, 2 * Math.PI);
            Endgame.crc.fillStyle = "red";
            Endgame.crc.fill(iris);
        
            let tail = new Path2D();
            tail.moveTo(x - r, y);
            tail.lineTo(x - r - 15, y - 10);
            tail.lineTo(x - r - 15, y + 10);
            tail.closePath();
            Endgame.crc.fillStyle = "#222";
            Endgame.crc.fill(tail);
        
            let fin = new Path2D();
            fin.moveTo(x - r * 0.3, y + r * 0.3);
            fin.lineTo(x + r * 0.5, y + r * 0.6);
            fin.lineTo(x - r * 0.5, y + r);
            fin.closePath();
            Endgame.crc.fillStyle = "rgba(200,200,200,0.3)";
            Endgame.crc.fill(fin);
        }        
        move() {
            this.x += this.dx;
            this.y += this.dy;
            if (this.x + 100 < 0) {
                this.x = 700;
                this.dx = Math.random() * 5 - 2.5;
                this.dy = Math.random() * 3 - 1.5;
            }
            if (this.x - 100 > 600) {
                this.x = -100;
                this.dx = Math.random() * 5 - 2.5;
                this.dy = Math.random() * 3 - 1.5;
            }
            if (this.y - 100 > 400) {
                this.y = -100;
                this.dx = Math.random() * 5 - 2.5;
                this.dy = Math.random() * 3 - 1.5;
            }
            if (this.y + 100 < 0) {
                this.y = 500;
                this.dx = Math.random() * 5 - 2.5;
                this.dy = Math.random() * 3 - 1.5;
            }
        }
        update() {
            this.move();
            this.draw();
        }
    }
    Endgame.Enemyfish = Enemyfish;
})(Endgame || (Endgame = {}));
//# sourceMappingURL=Enemyfish.js.map