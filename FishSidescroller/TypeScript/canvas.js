var Endgame;
(function (Endgame) {
    document.addEventListener("DOMContentLoaded", init);

    Endgame.imageWidth = 0;
    Endgame.scrollSpeed = 1;
    Endgame.scorePoints = 0;
    Endgame.playerArray = [];
    Endgame.collisionArray = [];
    Endgame.scoreArray = [];
    Endgame.animation = 0;
    Endgame.scoreTime = 0;
    Endgame.foodTime = 0;
    Endgame.bubbleTime = 0;

    const bubbles = [];
    const seaweed = [];

    let canvas, crc;

    function init() {
        window.addEventListener("keydown", keyHandleDown);
        window.addEventListener("keyup", keyHandleUp);
        document.getElementById("restart").addEventListener("click", startNew);

        Endgame.canvas = canvas = document.getElementsByTagName("canvas")[0];
        Endgame.crc = crc = canvas.getContext("2d");

        for (let i = 0; i < 20; i++) {
            bubbles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: 2 + Math.random() * 3,
                speed: 0.5 + Math.random()
            });
        }
        for (let i = 0; i < canvas.width; i += 30) {
            seaweed.push({
                baseX: i,
                offset: Math.random() * Math.PI * 2
            });
        }

        let player = new Endgame.Fish("blue");
        Endgame.playerArray.push(player);
        for (let i = 0; i < 6; i++) {
            let enemy = new Endgame.Enemyfish();
            Endgame.collisionArray.push(enemy);
        }

        let score = new Endgame.Score("20px", "Consolas", "white", 400, 30, "Points");
        Endgame.scoreArray.push(score);

        alert("Du steuerst den blauen Kugelfisch mit den Pfeiltasten. Du musst den schwarzen Fischen und den im Vordergrund aufsteigenden Luftblasen ausweichen. Die Luftblasen feuern dich nach oben und vorne, also versuche sofort in die andere Richtung zu steuern. Es fällt immer mal ein rundes Stück Futter von oben nach unten. Versuch es zu erreichen, um in einen Unsterblichkeits-Modus für wenige Sekunden zu wechseln, in welchem du Gegner fressen kannst und so extra Punkte verdienst. Wenn du verloren hast, kannst du auf den Button unter dem Spielfester klicken. Viel Spaß!");

        generateFood();
        generateBubbles();
        scoreP();
        update(0);
    }

    function keyHandleDown(_e) {
        if (_e.keyCode == 37) Endgame.playerArray[0].dx = -1.5;
        if (_e.keyCode == 39) Endgame.playerArray[0].dx = 1.5;
        if (_e.keyCode == 38) Endgame.playerArray[0].dy = -1.5;
        if (_e.keyCode == 40) Endgame.playerArray[0].dy = 1.5;
    }

    function keyHandleUp(_e) {
        if (_e.keyCode == 37 || _e.keyCode == 39) Endgame.playerArray[0].dx = 0;
        if (_e.keyCode == 38 || _e.keyCode == 40) Endgame.playerArray[0].dy = 0;
    }

    function drawBackground(time) {
        Endgame.imageWidth -= Endgame.scrollSpeed;
        if (Endgame.imageWidth <= -canvas.width) Endgame.imageWidth = 0;

        for (let offset = 0; offset <= canvas.width; offset += canvas.width) {
            let xOffset = Endgame.imageWidth + offset;

            const gradient = crc.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, "#001f3f");
            gradient.addColorStop(1, "#0074D9");
            crc.fillStyle = gradient;
            crc.fillRect(xOffset, 0, canvas.width, canvas.height);

            crc.save();
            crc.translate(xOffset, 0);

            // Lichtstrahlen
            crc.save();
            crc.globalAlpha = 0.05;
            for (let i = 0; i < 3; i++) {
                let lx = (Math.sin(time / 2000 + i) * 50 + i * 200) % canvas.width;
                crc.fillStyle = "#ffffff";
                crc.fillRect(lx, 0, 40, canvas.height);
            }
            crc.restore();

            // Blasen
            bubbles.forEach(b => {
                b.y -= b.speed;
                if (b.y < -b.r) {
                    b.y = canvas.height + b.r;
                    b.x = Math.random() * canvas.width;
                }
                crc.beginPath();
                crc.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                crc.fillStyle = "rgba(255, 255, 255, 0.3)";
                crc.fill();
            });

            // Sandboden
            crc.fillStyle = "#c2b280";
            crc.fillRect(0, canvas.height - 30, canvas.width, 30);

            // Pflanzen
            seaweed.forEach(w => {
                let sway = Math.sin(time / 500 + w.offset) * 5;
                crc.beginPath();
                crc.moveTo(w.baseX, canvas.height - 30);
                crc.lineTo(w.baseX + sway, canvas.height - 60);
                crc.lineWidth = 3;
                crc.strokeStyle = "#228B22";
                crc.stroke();
            });

            crc.restore();
        }
    }

    function update(time) {
        Endgame.animation = requestAnimationFrame(update);
        crc.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground(time);

        for (let food of Endgame.foodArray || []) {
            food.update();
        }
        for (let enemy of Endgame.collisionArray) {
            enemy.update();
        }
        for (let score of Endgame.scoreArray) {
            score.update();
        }
        for (let player of Endgame.playerArray) {
            player.update();
        }

        collision();
        Endgame.scoreArray[0].text = "SCORE: " + Endgame.scorePoints;
    }

    function startNew() {
        Endgame.refresh();
        deathOfThanos();
        crc.clearRect(0, 0, canvas.width, canvas.height);
        Endgame.scorePoints = 0;
        Endgame.playerArray = [];
        Endgame.collisionArray = [];
        let player = new Endgame.Fish("blue");
        Endgame.playerArray.push(player);
        for (let i = 0; i < 8; i++) {
            let enemy = new Endgame.Enemyfish();
            Endgame.collisionArray.push(enemy);
        }
        let score = new Endgame.Score("20px", "Consolas", "black", 500, 30, "text");
        Endgame.scoreArray.push(score);
        scoreP();
        generateFood();
        generateBubbles();
        update(0);
    }

    function collision() {
        for (let i = 0; i < Endgame.collisionArray.length; i++) {
            if (Endgame.playerArray[0].collisionEnemy(Endgame.collisionArray[i])) {
                if (Endgame.collisionArray[i].type == 1) {
                    if (Endgame.playerArray[0].r < Endgame.collisionArray[i].r) {
                        deathOfThanos();
                        /*Endgame.nickname = prompt("Das geht noch besser! " + "Score: " + Endgame.scorePoints + " | Los trag dich schnell ein:");
                        Endgame.insert();
                        Endgame.refresh();*/
                    } else {
                        Endgame.collisionArray.splice(i, 1);
                        Endgame.scorePoints += 100;
                        Endgame.collisionArray.push(new Endgame.Enemyfish());
                    }
                } else if (Endgame.collisionArray[i].type == 3) {
                    Endgame.playerArray[0].dx = 3;
                    Endgame.playerArray[0].dy = -1.5;
                    Endgame.collisionArray.splice(i, 1);
                    Endgame.scorePoints -= 100;
                } else {
                    Endgame.collisionArray.splice(i, 1);
                    Endgame.playerArray[0].r += 10;
                    Endgame.scorePoints += 200;
                    let c1 = setInterval(() => Endgame.playerArray[0].color = "pink", 150);
                    let c2 = setInterval(() => Endgame.playerArray[0].color = "red", 200);
                    setTimeout(() => {
                        Endgame.playerArray[0].r -= 10;
                        Endgame.playerArray[0].color = "blue";
                        clearInterval(c1);
                        clearInterval(c2);
                    }, 4000);
                }
            }
        }

        const p = Endgame.playerArray[0];
        if (p.x + p.r < 0 || p.x + p.r > canvas.width || p.y + p.r > canvas.height || p.y + p.r < 0) {
            deathOfThanos();
            /*Endgame.nickname = prompt("Schwache Leistung Rekrut... Score: " + Endgame.scorePoints + " | Verewige dich als Loser:");
            Endgame.insert();
            Endgame.refresh();*/
        }
    }

    function deathOfThanos() {
        cancelAnimationFrame(Endgame.animation);
        clearTimeout(Endgame.scoreTime);
        clearTimeout(Endgame.foodTime);
        clearTimeout(Endgame.bubbleTime);
    }

    function scoreP() {
        Endgame.scoreTime = setTimeout(scoreP, 100);
        Endgame.scorePoints += 1;
    }

    function generateFood() {
        Endgame.foodTime = setTimeout(generateFood, 7000);
        Endgame.collisionArray.push(new Endgame.Food());
    }

    function generateBubbles() {
        Endgame.bubbleTime = setTimeout(generateBubbles, 10000);
        Endgame.collisionArray.push(new Endgame.Bubble());
    }

})(Endgame || (Endgame = {}));
