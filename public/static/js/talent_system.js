document.addEventListener('DOMContentLoaded', function() {
    let talentCalculator = new TalentCalculator();

    window.talentSystemData = {
        talentPoints: {
            warrior: { Стойкость: 0, Проворство: 0, Ярость: 0 },
            rogue: { Приемы: 0, Уловки: 0, Удары: 0 },
            mage: { Лед: 0, Пламя: 0, Энергия: 0 },
            priest: { Опека: 0, Отомщение: 0, Вера: 0 },
            archer: { Охотник: 0, Стрелок: 0, Снайпер: 0 }
        },
        availablePoints: 42,
        spentPoints: 0
    };

    // Данные о талантах для каждого класса
    const classTalents = {
        warrior: [
            {
                name: 'Стойкость',
                description: 'Увеличивает запас здоровья и сопротивление критическому урону на 0.75%, а также блок на 0.5%.',
                talents: [
                    { name: 'Сомкнуть Ряды', description: 'Увеличивает радиус действия ауры «Сомкнуть ряды» на 5 метров и добавляет к ауре прибавку к сопротивлению критическому урону на 800.', pointsRequired: 6 },
                    { name: 'Защитная Стойка', description: 'Умение дополнительно повышает маг/физ броню на 10%, парирование, уклонение, сопротивление магии, блок на 5%, сопротивление критическому урону на 7.5%, а количество зарядов на 2.', pointsRequired: 12 },
                    { name: 'Метнуть Оружие', description: 'Попадание увеличивает желание монстров атаковать именно воина и обездвиживает противника на 2 секунды.', pointsRequired: 18 },
                    { name: 'Второе Дыхание', description: 'Увеличивает максимальный запас здоровья на 30%, сопротивление критическому урону на 5000, а также исцеляет воина на 30% от максимального запаса здоровья. Умение можно применять, находясь под воздействием безмолвия.', pointsRequired: 24 }
                ]
            },
            {
                name: 'Проворство',
                description: 'Увеличивает точность 0.5%, уклонения и скорость атаки 1%.',
                talents: [
                    { name: 'Сокрушительный Удар', description: 'Длительность оглушения увеличена на 1 сек.', pointsRequired: 6 },
                    { name: 'Рывок', description: 'Получает невосприимчивость к обездвиживанию на время действия способности, а также ускорение увеличивается дополнительно на 10%.', pointsRequired: 12 },
                    { name: 'Вертушка', description: 'Воин начинает вращаться, нанося урон всем рядом стоящим противникам. При применении этого умения воин снимает с себя 2 негативных эффекта.', pointsRequired: 18 },
                    { name: 'Превосходство', description: 'При применении воин на некоторое время снижает у всех противников поблизости скорость передвижения на 20% и скорость атаки на 1750. За каждого поражённого умением противника скорость передвижения увеличивается на 10%, а скорость атаки на 575 - максимум 5 зарядов усиления, также за каждую поражённую цель воин исцеляется, а его успешные атаки под действием Превосходства исцеляют его, но не чаще 1 раза в 0.5 сек, отраженные атаки (срабатывание у врага парирования, блока, сопротивление магии, уклонения), исцеляют воина лишь с шансом 25%.', pointsRequired: 24 }
                ]
            },
            {
                name: 'Ярость',
                description: 'Увеличен шанс критического урона 0.75%, сила атаки на 0.5% и сопротивление магии на 1%.',
                talents: [
                    { name: 'Берсерк', description: 'Затраты маны на умение снижаются на 10%, а перезарядка на 5 сек.', pointsRequired: 6 },
                    { name: 'Сотрясти Землю', description: 'Увеличивает радиус действия на 2.5м вокруг каждой поражённой цели, урон умения на 10% и эффект замедления на 15%.', pointsRequired: 12 },
                    { name: 'Боевой клич', description: 'На 15 сек. снижает силу атаки всех противников и увеличивает силу атаки союзников вокруг в радиусе 10 метров вокруг воина. Негативный и положительный эффекты умения также распространяются на все цели в радиусе 8 метров от поражённых целей. Умение накладывает на противников эффект безмолвия на 3.5 cек., и снимает с воина негативные эффекты в количеству равному поражённым негативным эффектом целям.', pointsRequired: 18 },
                    { name: 'Адреналин', description: 'Получает периодическое исцеление, а атаки противников восстанавливают ему здоровье. При срабатывании восстановления здоровья от атак противников, воин наносит урон вокруг себя в радиусе 7.5-м и замедляет поражённые цели на 25% на 2 сек. Под действием умения воин получает 30% сопротивления замедлению. Длительность эффекта 12 сек.', pointsRequired: 24 }
                ]
            }
        ],
        rogue: [
            {
                name: 'Приемы',
                description: 'Повышаются сопротивление критическому урону и точность на 0.75%, а также физ./маг. броня на 0.5% за каждый вложенный талант.',
                talents: [
                    { name: 'Град Ударов', description: 'Количество ударов в серии увеличивается до трех.', pointsRequired: 6 },
                    { name: 'Спутать Карты', description: 'Скорость разбойника повышается на 10-30% (в зависимости от количества противников поблизости при применении) на время действия способности. Перезарядка снижается на 4 секунды.', pointsRequired: 12 },
                    { name: 'Быстрые Ноги', description: 'В течение 10 сек. разбойник двигается на 40% быстрее, а его уклонение увеличивается на 12%.', pointsRequired: 18 },
                    { name: 'Поднять Ставки', description: 'При применении повышается показатель критического урона на 45%, появляется 45% шанс применить умения без затрат маны и 15% шанс проигнорировать защиту целей (уклонение, парирование, блок, сопротивление) - длительность эффекта 12 сек, дополнительно при использовании умения Разбойник без затрат маны и ухода на перезарядку использует умение Быстрые Ноги. Использование умения сбрасывает перезарядку всех умений ветки (Быстрые ноги, Спутать карты, Град ударов).', pointsRequired: 24 }
                ]
            },
            {
                name: 'Уловки',
                description: 'Повышает запас маны повышен на 0.5%, а показатели шанса критического урона и уклонения на 0.75% за каждый вложенный талант.',
                talents: [
                    { name: 'Шипы', description: 'Длительность замедления увеличивается на 3 секунды.', pointsRequired: 6 },
                    { name: 'Тень', description: 'Время применения 1 сек. Можно использовать только в состоянии вне боя. При использовании разбойник получает невидимость и увеличение скорости передвижения на 20% на 18-22 сек. Любая полученная/нанесённая атака прерывает состояние невидимости. После выхода из невидимости сила атаки и показатель шанса критического урона разбойника понижены на 80% на 2 сек. При наличии таланта скорость передвижения разбойника во время действия умения увеличивается на 15%. ', pointsRequired: 12 },
                    { name: 'Дымовая Шашка', description: 'Едкий дым наносит урон и в течение 3.5 секунд не дает применять способности, а также замедляет всех противников, попавших в зону поражения, на 15%. Умение имеет 50% шанс проигнорировать защиту.', pointsRequired: 18 },
                    { name: 'Удавка', description: 'Разбойник атакует всех противников в конусе перед собой, атака наносит цели мгновенный урон и прерывает применение умений, а также в течение 10 сек. противник будет получать периодический урон и терять ману, восстанавливая её разбойнику. Умение игнорирует защиту цели, а также накладывает на разбойника эффект Стремительная Расправа - скорость передвижения увеличивается на 40% на 10 сек.', pointsRequired: 24 }
                ]
            },
            {
                name: 'Удары',
                description: 'Повышены сила атаки и парирование на 0.75%, а также увеличен показатель критического урона на 0.5% за каждый вложенный талант.',
                talents: [
                    { name: 'Подстроенный Удар', description: 'Атака наносит урон и снижает сопротивление критическому урону цели на 1400 на 8 секунд.', pointsRequired: 6 },
                    { name: 'Коварный Порез', description: 'Перезарядка снижается на 5 секунд, шанс срабатывания негативного эффекта повышается до 100%. Способность начинает игнорировать парирование цели.', pointsRequired: 12 },
                    { name: 'Парализующий Яд', description: 'Разбойник смазывает свое оружие ядом на 25 сек, который при атаках может на некоторое время вызывать у жертвы мышечный паралич, оглушая её на 1.25 сек. Паралич срабатывает не чаще 1 раза в 4 сек. Можно использовать в комбинации со Смертельным Ядом.', pointsRequired: 18 },
                    { name: 'Зияющая Рана', description: 'Разбойник оставляет на теле всех врагов в конусе перед собой кровоточащие порезы на 10 сек, которые наносят большой периодический урон. Дальность поражения умения 6 метров. Умение с шансом 50% игнорирует парирование цели. Если цель парировала умение, разбойник восстановит 100% от затраченной на умение маны.', pointsRequired: 24 }
                ]
            }
        ],
        mage: [
            {
                name: 'Лед',
                description: 'Повышает физическую броню на 1% а также сопротивление критическому урону и точность на 0.75% за каждый вложенный талант.',
                talents: [
                    { name: 'Морозные Доспехи', description: 'Замедление усиливается дополнительно на 10%, а его длительность увеличивается на 1 сек.', pointsRequired: 6 },
                    { name: 'Ледяная Тюрьма', description: 'Маг получает возможность использовать заклинание Ледяная Тюрьма на себя (после окончания заморозки на маге не будет эффекта замедления, длительность заморозки - 4 секунды).', pointsRequired: 12 },
                    { name: 'Ледяные Осколки', description: 'Волна поражает противников в радиусе 7.5 метров, при попадании противники замедляются на 4%, а маг ускоряется на 4% на 8 сек. Оба эффекта складываются до 6 раз. Умение имеет 30% шанс проигнорировать уклонение цели.', pointsRequired: 18 },
                    { name: 'Полярный Холод', description: 'На 4 секунды маг замедляет всех окружающих противников, после окончания замедления противники получают урон и оглушаются на 4 секунды.', pointsRequired: 24 }
                ]
            },
            {
                name: 'Пламя',
                description: 'Увеличивает силу атаки и показатель критического урона на 0.75%, а также запас здоровья на 0.5% за каждый вложенный талант.',
                talents: [
                    { name: 'Воспламенение', description: 'Умение получает способность поджигать противников в радиусе 3 метров от цели.', pointsRequired: 6 },
                    { name: 'Огненный Шар', description: 'Заклинание «Огненный Шар» получает способность на 7 сек. поджигать противников, а его зона поражения увеличена на 2 метра.', pointsRequired: 12 },
                    { name: 'Испепеление', description: 'Волшебник копит внутренний огонь и выпускает его в выбранную цель, нанося урон ей и окружающим её противникам в радиусе 4 метров. Пораженные умением враги теряют 33% магической брони на 10 сек. Умение игнорирует сопротивление магии целей.', pointsRequired: 18 },
                    { name: 'Пылающий Метеорит', description: 'Маг призывает с небес раскаленную каменную глыбу, которая приземляется спустя 3 сек. и при ударе о землю наносит огромный урон всем врагам в радиусе 5 метров, оглушает их на 4 секунды. При падении метеорит также замедляет все цели в радиусе 10 метров на 33% на 4 сек, эффект замедления игнорирует сопротивление магии цели.', pointsRequired: 24 }
                ]
            },
            {
                name: 'Энергия',
                description: 'Увеличивает критического урона и уклонения на 0.75%, а также запаса маны на 0.5% за каждый вложенный талант.',
                talents: [
                    { name: 'Удар Молнии', description: 'Заклинание «Удар Молнии» оглушает цель вместо обездвиживания.', pointsRequired: 6 },
                    { name: 'Энергетическая Волна', description: 'Увеличивает количество энергии, сжимаемой заклинанием «Энергетическая волна» на 20%. Заклинание получает способность снижать сопротивление магии противников на 20% на 8 сек.', pointsRequired: 12 },
                    { name: 'Магическая Ловушка', description: 'Маг получает заклинание «Магическая ловушка». Маг ставит на землю ловушку, которая взрывается при попадании в неё противников, лишая возможности применять способности на 4 секунды.', pointsRequired: 18 },
                    { name: 'Запредельный разряд', description: 'Маг выпускает мощный разряд, поражающий цель и противников в радиусе 6 метров вокруг неё. Обездвиживает противников и не имеют возможности использовать умения в течении 4 сек, а также их сила атаки снижена на 50% на 7 сек.', pointsRequired: 24 }
                ]
            }
        ],
        priest: [
            {
                name: 'Опека',
                description: 'Увеличивается запас здоровья 0.75%, сопротивление критическому урону 0.75% и восстановления энергии 0.5% за каждый вложенный талант.',
                talents: [
                    { name: 'Божественный Щит', description: 'Превращает заклинание «Божественный щит» в ауру, действующую и на других игроков.', pointsRequired: 6 },
                    { name: 'Молитва', description: 'Молитва получает возможность увеличивать силу атаки жреца и его союзников на 160-900 и дополнительно на 12-80 за каждого противника в радиусе 7.5м от жреца. Максимум 15 зарядов дополнительного усиления.', pointsRequired: 12 },
                    { name: 'Кольцо веры', description: 'Жрец получает заклинание «Кольцо Веры». Жрец освящает землю в указанной точке. В течение 5 секунд все дружественные персонажи, попавшие под воздействие заклинания, игнорируют вражеские атаки.', pointsRequired: 18 },
                    { name: 'Перевоплощение', description: 'Жрец получает заклинание «Перевоплощение», которое увеличивает показатели физ/маг брони на 6000-28000, силы атаки на 1000-4500 и здоровья на 3000-15000 на 20 сек. В этом состоянии атаки жреца провоцируют монстров атаковать его.', pointsRequired: 24 }
                ]
            },
            {
                name: 'Отомщение',
                description: 'Увеличивает свои показатели максимального запаса маны на 0.5%, а силы атаки и шанса критического урона на 0.75%. за каждый вложенный талант.',
                talents: [
                    { name: 'Правосудие', description: 'Заклинание Правосудие получает способность давать жрецу и его спутникам невосприимчивость к эффектам обездвиживания на 5 сек.', pointsRequired: 6 },
                    { name: 'Кара', description: 'Заклинание Кара получает способность оглушать противников 2.5 сек, а также снижать их магическую броню на 33% на это же время.', pointsRequired: 12 },
                    { name: 'Благословение', description: 'Аура "Благословение" даёт жрецу и его союзникам в радиусе 25м положительный эффект, под действием которого, успешные атаки на 7 сек увеличивают скорость перемещения на 3-5% и скорость атаки на 50-360 единиц за каждый заряд эффекта.', pointsRequired: 18 },
                    { name: 'Возмездие', description: 'Игнорирует защиту цели (сопротивление магии). Умение наносит урон только в PVE. Жрец обездвиживает цель на 4 сек, а также на 10-16 сек получает положительный эффект, увеличивающий атакующие характеристики на 10% и позволяющий его атакам обездвиживать цель на 1.5 сек', pointsRequired: 24 }
                ]
            },
            {
                name: 'Вера',
                description: 'Укрепленный в вере жрец повышает показатели сопротивления магии на 1%, а также сопротивления критическому урону и блока на 0.5% за каждый вложенный талант.',
                talents: [
                    { name: 'Божественное Сияние', description: 'Заклинание "Божественное Сияние" исцеляет дополнительно 20% от нанесённого им урона, а также частота срабатывания увеличивается на 20%.', pointsRequired: 6 },
                    { name: 'Небесный Cвет', description: 'Небесный Свет получает способность усиливать дружественным игрокам магическую броню на 750-10000 и рассеивать с них ещё 1 негативный эффект.', pointsRequired: 12 },
                    { name: 'Живительный поток', description: 'Наполняет себя и всех союзников в радиусе 15 метров силой света, повышая восстановление здоровья на 2000-10000 и восстановление энергии на 430-2000, а также увеличивая физическую и магическую броню на 20% в течение 15 секунд. ', pointsRequired: 18 },
                    { name: 'Воскрешение', description: 'Жрец воскрешает своего соратника, находящегося на расстоянии не более 7.5м. Длительность применения 3.3 сек. Один и тот же персонаж может быть воскрешён не чаще 1 раза в 80 сек.', pointsRequired: 24 }
                ]
            }
        ],
        archer: [
            {
                name: 'Охотник',
                description: 'Увеличивает здоровье и сопротивление критическому урону на 0.75%, а также скорость атаки на 0.5% за каждое вложенное очко.',
                talents: [
                    { name: 'Тактическое Отступление', description: 'Применение усиленной способности снимает с лучника 3 негативных эффекта.', pointsRequired: 6 },
                    { name: 'Сковывающий Выстрел', description: 'Усиленная талантом способность оглушает цель.', pointsRequired: 12 },
                    { name: 'Ослепляющая Стрела', description: 'Стрела взрывается яркой вспышкой света, нанося цели небольшой магический урон и снижая её показатель точности на 90% на 4 сек. Умение игнорирует уклонение цели.', pointsRequired: 18 },
                    { name: 'Жажда Крови', description: 'Лучник стреляет во всех противников перед собой заколдованными стрелами, которые при попадании наносят им урон и восстанавливают здоровье лучнику в размере 50% от нанесённого урона - умение игнорирует уклонение цели. Также лучнику становится доступно аналогичное умение по одиночной цели, которое восстанавливает здоровье в размере 17.5% от максимального запаса (35% при критическом срабатывании), а также похищает у цели 22.5% базового сопротивления критическому урону (не учитываются прибавки от гильдейских усилений, эликсиров и так далее) на 12 сек. Умения имеют общую перезарядку.', pointsRequired: 24 }
                ]
            },
            {
                name: 'Стрелок',
                description: 'Увеличивает силу атаки и восстановление энергии на 0.75%, а также физ./маг. броню на 0.5% за каждое вложенное очко таланта.',
                talents: [
                    { name: 'Выстрел на Вскидку', description: 'Лишает возможности применять умения в течении 1.5 секунды, но перезарядка умения увеличивается на 5 сек.', pointsRequired: 6 },
                    { name: 'Веерная Стрельба', description: 'Усиленная талантом способность с 20% шансом не потратит энергии.', pointsRequired: 12 },
                    { name: 'Дождь из Стрел', description: 'Лучник выпускает в небо огромное количество стрел которые спустя 3 секунды обрушиваются на его противников в указанной области. Каждое попадание наносит урон и замедляет цели на 30% на 3 сек.', pointsRequired: 18 },
                    { name: 'Расплавляющие Стрелы', description: 'Под действием этой способности в течение 14 сек. атаки лучника снижают физическую броню цели на 7%, а также наносят периодический урон - негативный эффект суммируется до 5 раз и длится 10 сек.', pointsRequired: 24 }
                ]
            },
            {
                name: 'Снайпер',
                description: 'Увеличивает точность и уклонение на 0.75%, а также запас энергии на 0.5% за каждое вложенное очко таланта.',
                talents: [
                    { name: 'Меткость Снайпера', description: 'Талант увеличивает радиус поражения на 1 метр, сокращает перезарядку на 5 секунд и уменьшает стоимость в мане на 15%.', pointsRequired: 6 },
                    { name: 'Аура Точности', description: 'Помимо точности аура начинает увеличивать ещё и шанс критического урона на аналогичное точности значение.', pointsRequired: 12 },
                    { name: 'Взрывная Стрела', description: 'Лучник выпускает в цель стрелу со взрывчаткой которая взрывается через 4 секунды после попадания и наносит урон всем противникам в радиусе 4-м. Взрыв игнорирует сопротивление магии целей.', pointsRequired: 18 },
                    { name: 'Уязвимые места', description: 'Успешные атаки будут наносить дополнительный урон и замедлять цель на 20% на 3 сек, также под действием эффекта умения повышается шанс лучника проигнорировать защиты цели (уклонение, сопротивление магии, блок) на 12.5%.', pointsRequired: 24 }
                ]
            }
        ]
    };

    // Переменные состояния
    let currentClass = 'warrior';
    let availablePoints = window.talentSystemData.availablePoints;
    let spentPoints = window.talentSystemData.spentPoints;
    let talentPoints = window.talentSystemData.talentPoints;
    
    // Переменная для хранения текущей активной вкладки
    let currentActiveTab = '';

    // Элементы интерфейса
    const talentsSection = document.querySelector('.talents-section');
    const classButtons = document.querySelectorAll('.class-btn');

    // Инициализация системы талантов
    function initializeTalentSystem() {
        // Заменяем существующую секцию талантов на новую
        talentsSection.innerHTML = `
            <h2>Таланты <span id="points-counter">0/42</span></h2>
            <div class="talent-tree" id="talent-tree">
                <!-- Таланты будут загружены динамически -->
            </div>
            <div class="talent-controls">
                <button id="reset-talents" class="talent-btn">Сбросить таланты</button>
                <div class="points-info">
                    <span>Доступно очков: <span id="available-points">42</span></span>
                    <span>Потрачено очков: <span id="spent-points">0</span></span>
                </div>
            </div>
        `;

        // Загружаем таланты для текущего класса
        loadTalentsForClass(currentClass);

        // Добавляем обработчики событий (кнопка Применить удалена)
        document.getElementById('reset-talents').addEventListener('click', resetTalents);

        // Обновляем обработчики классов
        classButtons.forEach(button => {
            button.addEventListener('click', function() {
                currentClass = this.getAttribute('data-class');
                
                // Сбрасываем таланты при смене класса
                resetTalentsOnClassChange();
                
                // Загружаем таланты для нового класса
                loadTalentsForClass(currentClass);
            });
        });
    }

    // Загрузка талантов для выбранного класса
    function loadTalentsForClass(characterClass) {
        const talentTree = document.getElementById('talent-tree');
        const talents = classTalents[characterClass];
        
        if (!talents) return;

        // Определяем, какую вкладку показывать активной
        let activeTab = currentActiveTab || talents[0].name;

        talentTree.innerHTML = `
            <div class="talents-tabs">
                <div class="talents-tab-buttons" id="talents-tab-buttons">
                    ${talents.map((branch, index) => `
                        <button class="talents-tab-btn ${branch.name === activeTab ? 'active' : ''}" 
                                data-branch="${branch.name}">
                            ${branch.name}
                        </button>
                    `).join('')}
                </div>
                <div class="talents-tab-content" id="talents-tab-content">
                    ${talents.map((branch, index) => `
                        <div class="talents-tab-pane ${branch.name === activeTab ? 'active' : ''}" 
                            id="branch-${branch.name}">
                            <div class="talent-branch">
                                <div class="branch-header">
                                    <div class="branch-title">
                                        <h3>${branch.name}</h3>
                                        <p class="branch-description">${branch.description}</p>
                                    </div>
                                    <div class="branch-progress">
                                        <span class="points-display">${talentPoints[characterClass][branch.name]}/24</span>
                                        <button class="add-point-btn" 
                                                data-branch="${branch.name}"
                                                ${availablePoints === 0 || talentPoints[characterClass][branch.name] >= 24 ? 'disabled' : ''}>
                                            +
                                        </button>
                                    </div>
                                </div>
                                <div class="talents-list">
                                    ${branch.talents.map((talent, talentIndex) => `
                                        <div class="talent-item ${talentPoints[characterClass][branch.name] >= talent.pointsRequired ? 'unlocked' : 'locked'}" 
                                            data-branch="${branch.name}" 
                                            data-talent="${talentIndex}">
                                            <div class="talent-points-required">${talent.pointsRequired}</div>
                                            <div class="talent-info">
                                                <h4>${talent.name}</h4>
                                                <p>${talent.description}</p>
                                            </div>
                                            <div class="talent-status">
                                                ${talentPoints[characterClass][branch.name] >= talent.pointsRequired ? '✓' : '✗'}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Добавляем обработчики для вкладок
        document.querySelectorAll('.talents-tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const branchName = this.getAttribute('data-branch');
                
                // Сохраняем текущую активную вкладку
                currentActiveTab = branchName;
                
                // Убираем активный класс у всех кнопок
                document.querySelectorAll('.talents-tab-btn').forEach(b => b.classList.remove('active'));
                // Добавляем активный класс текущей кнопке
                this.classList.add('active');
                
                // Скрываем все вкладки
                document.querySelectorAll('.talents-tab-pane').forEach(pane => pane.classList.remove('active'));
                // Показываем выбранную вкладку
                document.getElementById(`branch-${branchName}`).classList.add('active');
            });
        });

        // Добавляем обработчики для кнопок "+"
        document.querySelectorAll('.add-point-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const branchName = this.getAttribute('data-branch');
                
                // Сохраняем текущую активную вкладку перед добавлением очка
                currentActiveTab = branchName;
                
                addPointToBranch(branchName);
            });
        });

        updatePointsDisplay();
    }

    // Добавление очка в ветку
    function addPointToBranch(branchName) {
        if (availablePoints > 0 && talentPoints[currentClass][branchName] < 24) {
            talentPoints[currentClass][branchName]++;
            availablePoints--;
            spentPoints++;
            
            // Обновляем глобальные данные
            window.talentSystemData.availablePoints = availablePoints;
            window.talentSystemData.spentPoints = spentPoints;
            window.talentSystemData.talentPoints = talentPoints;
            
            updatePointsDisplay();
            loadTalentsForClass(currentClass);

            applyTalents();
        }
    }

    // Обновление отображения очков
    function updatePointsDisplay() {
        document.getElementById('points-counter').textContent = `${spentPoints}/42`;
        document.getElementById('available-points').textContent = availablePoints;
        document.getElementById('spent-points').textContent = spentPoints;
    }

    // Применение талантов
    function applyTalents() {
        if (!window.statCalculator || !window.statCalculator.currentClass) {
            console.warn('Калькулятор статистик не доступен');
            return;
        }
        
        // Получаем текущие статистики ДО применения талантов
        const currentStats = window.statCalculator.calculateTotalStats();
        
        if (!currentStats || Object.keys(currentStats).length === 0) {
            console.warn('Не удалось получить текущие статистики');
            return;
        }
        
        // ПРИМЕНЯЕМ АКТИВНЫЕ АУРЫ/БАФФЫ ОТ ТАЛАНТОВ
        const talentAuras = calculateTalentAuras(currentClass, talentPoints[currentClass]);
        
        // Объединяем пассивные бонусы и активные ауры
        const allTalentBonuses = { ...talentAuras };
        
        // Применяем бонусы к глобальному калькулятору статистик
        window.statCalculator.setTalentPoints(currentClass, talentPoints[currentClass]);
        
        // Устанавливаем активные ауры талантов
        window.statCalculator.setTalentAuras(talentAuras);
        
        // Пересчитываем и обновляем статистики (таланты применятся автоматически)
        const newStats = window.statCalculator.calculateTotalStats();
        
        // Обновляем отображение статистик
        if (window.updateStatsDisplay) {
            window.updateStatsDisplay(newStats);
        }
        
        console.log('Таланты применены:', talentPoints[currentClass]);
        console.log('Активные ауры:', talentAuras);
        console.log('Статистики до талантов:', currentStats);
        console.log('Статистики после талантов:', newStats);
    }

    // функция для расчета активных аур/баффов от талантов
    function calculateTalentAuras(characterClass, talentPoints) {
        const auras = {};
        
        // Проверяем, активирован ли чекбокс "Талантовый бафф"
        const talentBuffEnabled = document.getElementById('talent-buff')?.checked;
        if (!talentBuffEnabled) {
            return auras;
        }
        
        // Ауры для воина
        if (characterClass === 'warrior') {
            if (talentPoints['Стойкость'] >= 6) {
                auras['crit_damage_resistance'] = (auras['crit_damage_resistance'] || 0) + 800;
                console.log('✅ Аура "Сомкнуть Ряды" применена: +800 к сопротивлению критическому урону');
            }
        }
        
        // Ауры для жреца
        if (characterClass === 'priest') {
            if (talentPoints['Отомщение'] >= 18) {
                auras['speed_percent'] = (auras['speed_percent'] || 0) + 5;
                auras['attack_speed_percent'] = (auras['attack_speed_percent'] || 0) + 5;
                
                console.log('✅ Аура "Благословение" применена: +5% скорости перемещения, +5% скорости атаки');
            }
        }
        
        // Ауры для лучника
        if (characterClass === 'archer') {
            if (talentPoints['Снайпер'] >= 12) {
                auras['hit_percent'] = (auras['hit_percent'] || 0) + 5; 
                auras['crit_percent'] = (auras['crit_percent'] || 0) + 5; 
                
                console.log('✅ Аура "Аура Точности" применена: +5% к точности, +5% к шансу критического удара');
            }
        }
        
        return auras;
    }

    function resetTalentsOnClassChange() {
        availablePoints = window.talentSystemData.availablePoints;
        spentPoints = window.talentSystemData.spentPoints;
        
        // Сбрасываем активную вкладку
        currentActiveTab = '';
        
        updatePointsDisplay();
        
        // Перезагружаем таланты для текущего класса
        if (currentClass) {
            loadTalentsForClass(currentClass);
        }
    }

    // Сброс талантов
    function resetTalents() {
        availablePoints = 42;
        spentPoints = 0;
        
        // Сброс очков для текущего класса
        Object.keys(talentPoints[currentClass]).forEach(branch => {
            talentPoints[currentClass][branch] = 0;
        });
        
        // Обновляем глобальные данные
        window.talentSystemData.availablePoints = availablePoints;
        window.talentSystemData.spentPoints = spentPoints;
        window.talentSystemData.talentPoints = talentPoints;
        
        // Сбрасываем активную вкладку на первую
        currentActiveTab = '';
        
        updatePointsDisplay();
        loadTalentsForClass(currentClass);
        
        // Сбрасываем таланты в калькуляторе
        if (window.statCalculator) {
            window.statCalculator.setTalentPoints(currentClass, talentPoints[currentClass]);
            const newStats = window.statCalculator.calculateTotalStats();
            if (window.updateStatsDisplay) {
                window.updateStatsDisplay(newStats);
            }
        }
    }
    
    window.applyTalents = applyTalents;

    window.talentSystem = {
        talentPoints: talentPoints,
        spentPoints: spentPoints,
        availablePoints: availablePoints,
        currentClass: currentClass,
        currentActiveTab: currentActiveTab,
        addPointToBranch: addPointToBranch,
        resetTalents: resetTalents,
        updatePointsDisplay: updatePointsDisplay,
        loadTalentsForClass: loadTalentsForClass,
        applyTalents: applyTalents,

        setCurrentClass: function(className) {
            currentClass = className;
            this.currentClass = className;
            
            // Сбрасываем активную вкладку при смене класса
            currentActiveTab = '';
            this.currentActiveTab = '';
            
            // Загружаем таланты для нового класса
            if (this.loadTalentsForClass) {
                this.loadTalentsForClass(className);
            }
            
            console.log('✅ Система талантов: класс изменен на', className);
        }
    };


    // Инициализируем систему при загрузке
    initializeTalentSystem();
});