let state = {contentHided: false};
let two = null;

window.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // START OF: listen events =====
    const listenEvents = (function () {

        function listen () {
            listenHideUnhide();
            listenSubmit();
        }

        function listenHideUnhide () {
            $('.arrow').on('click', function () {
                if (state.contentHided) {
                    unhide();
                } else {
                    hide();
                }
            });
        }

        function hide() {
            const content = $('.content'), arrow = $('.arrow');
            state.contentHided = true;
            content.css('transform', 'translateX(100%)');
            arrow.css('transform', 'scaleX(-1)');
        }

        function unhide() {
            const content = $('.content'), arrow = $('.arrow'), input = $('.input_word');
            state.contentHided = false;
            content.css('transform', 'translateX(0)');
            arrow.css('transform', 'scaleX(1)');
            // input.focus();
        }

        function listenSubmit() {
            $('.form_word').on('submit', function (e) {
                e.preventDefault();
                let word = $('.input_word').val();

                hide();

                $.ajax({
                    type: "POST",
                    url: "/ajax/coefficients",
                    data: "word=" + word,
                    cache: false,
                    success: drawing
                });
            });
        }
        
        function drawing(res) {
            const data = JSON.parse(res);
            console.log(data);

            if (data.error) {
                console.log('Ошибка при запросе данных');
                return;
            }

            data.color.toString = function () {
                return 'rgb('
                    + this.r + ','
                    + this.g + ','
                    + this.b + ')';
            };


            const type = 'svg';
            if (two) two.clear();
            two = new Two({
                type: Two.Types[type],
                fullscreen: true
            }).appendTo($('.generated_image')[0]);
            let random = [Math.random() * 0.2 - 0.1, Math.random() * 0.2 - 0.1, Math.random() * 0.2 - 0.1];
            const mass = (data.roughness + random[0]) < 0 || (data.roughness + random[0]) > 1 ? 20 - ((data.roughness - random[0]) * 10 + 5) : 20 - ((data.roughness + random[0]) * 10 + 5), //ИНЕРТНОСТЬ (10) - от 5 до 15 - roughness
                radius = two.height / 5, //РАЗМЕР ВСЕЙ ФИГУРЫ (two.height / 5)
                strength = 0.0625, //СКОРОСТЬ (0.0625)
                drag = 0.0,

                background = two.makeGroup(),
                foreground = two.makeGroup(),

                physics = new Physics(),
                points = [],
                quant = (data.angularity + random[1]) < 0 || (data.angularity + random[1]) > 1 ? get_quant(data.angularity - random[0]) : get_quant(data.angularity + random[0]); //КОЛ-ВО ТОЧЕК (Two.Resolution) - от 6 до 20

            function get_quant(x) {
                return Math.round(14 * Math.pow(x, 2.5) + 6);
            }

            for (let i = 0; i < quant; i++) {

                const pct = i / quant,
                    theta = pct * Math.PI * 2,

                    ax = radius * Math.cos(theta),
                    ay = radius * Math.sin(theta);

                let middle = (data.angularity + data.roughness) / 2 + random[2] < 0 || (data.angularity + data.roughness) / 2 + random[2] > 1 ? ((data.angularity + data.roughness) / 2 - random[2]) * 4 : ((data.angularity + data.roughness) / 2 + random[2]) * 4;

                if (middle === 4)
                    middle = 3.9;

                middle = Math.floor(middle); //0,1,2,3
                middle *= 0.05;


                const variance = Math.random() * 0.5 + 0.5 - middle, //"ЖИДКОСТЬ": 0 - СУПЕРЖИДКИЙ, 1 - НЕ ДВИГАЮТСЯ ТОЧКИ
                    bx = variance * ax,
                    by = variance * ay,

                    origin = physics.makeParticle(mass, ax, ay),
                    particle = physics.makeParticle(Math.random() * mass * 0.66 + mass * 0.33, bx, by),
                    spring = physics.makeSpring(particle, origin, strength, drag, 0);

                origin.makeFixed();

                particle.shape = two.makeCircle(particle.position.x, particle.position.y, 5);
                particle.shape.noStroke().noFill();//.fill = '#fff';
                particle.position = particle.shape.translation;

                foreground.add(particle.shape);
                points.push(particle.position);
            }

            const inner = new Two.Path(points, true, true);
            inner.stroke = '#667eea';//noStroke();
            inner.linewidth = 10;
            inner.fill = data.color.toString();
            inner.scale = 1.25;

            background.add(inner);

            // _.extend(two.renderer.domElement.style, {
            //   backgroundImage: 'linear-gradient(to top, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)'
            // });

            resize();

            two
                .bind('resize', resize)
                .bind('update', function () {
                    physics.update();
                })
                .play();

            function resize() {
                background.translation.set(two.width / 2, two.height / 2);
                foreground.translation.copy(background.translation);
            }
        }

        return {
            listen: listen
        }
    }());
    listenEvents.listen();
// ===== END OF: listen events
});