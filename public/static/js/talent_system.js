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
        selectedTalents: {
            warrior: { Стойкость: {}, Проворство: {}, Ярость: {} },
            rogue: { Приемы: {}, Уловки: {}, Удары: {} },
            mage: { Лед: {}, Пламя: {}, Энергия: {} },
            priest: { Опека: {}, Отомщение: {}, Вера: {} },
            archer: { Охотник: {}, Стрелок: {}, Снайпер: {} }
        },
        availablePoints: 35,
        spentPoints: 0
    };

    // Данные о талантах для каждого класса
    const classTalents = {
        warrior: [
            {
                name: 'Стойкость',
                description: 'Увеличивает запас здоровья и сопротивление критическому урону на 0.75%, а также блок на 0.5%.',
                talents: [
                    { id: 'stoikost_1', name: 'Сомкнуть Ряды', description: 'Увеличивает радиус действия ауры «Сомкнуть ряды» на 5 метров и добавляет к ауре прибавку к сопротивлению критическому урону на 800.', pointsRequired: 5, selectable: true },
                    { id: 'stoikost_2', name: 'Защитная Стойка', description: 'Умение дополнительно повышает маг/физ броню на 10%, парирование, уклонение, сопротивление магии, блок на 5%, сопротивление критическому урону на 7.5%, а количество зарядов на 2.', pointsRequired: 10, selectable: true },
                    { id: 'stoikost_3', name: 'Метнуть Оружие', description: 'Попадание увеличивает желание монстров атаковать именно воина и обездвиживает противника на 2 секунды.', pointsRequired: 15, selectable: true },
                    { id: 'stoikost_4', name: 'Второе Дыхание', description: 'Увеличивает максимальный запас здоровья на 30%, сопротивление критическому урону на 5000, а также исцеляет воина на 30% от максимального запаса здоровья. Умение можно применять, находясь под воздействием безмолвия.', pointsRequired: 20, selectable: true }
                ]
            },
            {
                name: 'Проворство',
                description: 'Увеличивает точность 0.5%, уклонения и скорость атаки 1%.',
                talents: [
                    { id: 'provorstvo_1', name: 'Сокрушительный Удар', description: 'Длительность оглушения увеличена на 1 сек.', pointsRequired: 5, selectable: true },
                    { id: 'provorstvo_2', name: 'Рывок', description: 'Получает невосприимчивость к обездвиживанию на время действия способности, а также ускорение увеличивается дополнительно на 10%.', pointsRequired: 10, selectable: true },
                    { id: 'provorstvo_3', name: 'Вертушка', description: 'Воин начинает вращаться, нанося урон всем рядом стоящим противникам. При применении этого умения воин снимает с себя 2 негативных эффекта.', pointsRequired: 15, selectable: true },
                    { id: 'provorstvo_4', name: 'Превосходство', description: 'При применении воин на некоторое время снижает у всех противников поблизости скорость передвижения на 20% и скорость атаки на 1750. За каждого поражённого умением противника скорость передвижения увеличивается на 10%, а скорость атаки на 575 - максимум 5 зарядов усиления, также за каждую поражённую цель воин исцеляется, а его успешные атаки под действием Превосходства исцеляют его, но не чаще 1 раза в 0.5 сек, отраженные атаки (срабатывание у врага парирования, блока, сопротивление магии, уклонения), исцеляют воина лишь с шансом 25%.', pointsRequired: 20, selectable: true }
                ]
            },
            {
                name: 'Ярость',
                description: 'Увеличен шанс критического урона 0.75%, сила атаки на 0.5% и сопротивление магии на 1%.',
                talents: [
                    { id: 'yarost_1', name: 'Берсерк', description: 'Затраты маны на умение снижаются на 10%, а перезарядка на 5 сек.', pointsRequired: 5, selectable: true },
                    { id: 'yarost_2', name: 'Сотрясти Землю', description: 'Увеличивает радиус действия на 2.5м вокруг каждой поражённой цели, урон умения на 10% и эффект замедления на 15%.', pointsRequired: 10, selectable: true },
                    { id: 'yarost_3', name: 'Боевой клич', description: 'На 15 сек. снижает силу атаки всех противников и увеличивает силу атаки союзников вокруг в радиусе 10 метров вокруг воина. Негативный и положительный эффекты умения также распространяются на все цели в радиусе 8 метров от поражённых целей. Умение накладывает на противников эффект безмолвия на 3.5 cек., и снимает с воина негативные эффекты в количеству равному поражённым негативным эффектом целям.', pointsRequired: 15, selectable: true },
                    { id: 'yarost_4', name: 'Адреналин', description: 'Получает периодическое исцеление, а атаки противников восстанавливают ему здоровье. При срабатывании восстановления здоровья от атак противников, воин наносит урон вокруг себя в радиусе 7.5-м и замедляет поражённые цели на 25% на 2 сек. Под действием умения воин получает 30% сопротивления замедлению. Длительность эффекта 12 сек.', pointsRequired: 20, selectable: true }
                ]
            }
        ],
        rogue: [
            {
                name: 'Приемы',
                description: 'Повышаются сопротивление критическому урону и точность на 0.75%, а также физ./маг. броня на 0.5% за каждый вложенный талант.',
                talents: [
                    { id: 'priemy_1', name: 'Град Ударов', description: 'Количество ударов в серии увеличивается до трех.', pointsRequired: 5, selectable: true },
                    { id: 'priemy_2', name: 'Спутать Карты', description: 'Скорость разбойника повышается на 10-30% (в зависимости от количества противников поблизости при применении) на время действия способности. Перезарядка снижается на 4 секунды.', pointsRequired: 10, selectable: true },
                    { id: 'priemy_3', name: 'Быстрые Ноги', description: 'В течение 10 сек. разбойник двигается на 40% быстрее, а его уклонение увеличивается на 12%.', pointsRequired: 15, selectable: true },
                    { id: 'priemy_4', name: 'Поднять Ставки', description: 'При применении повышается показатель критического урона на 45%, появляется 45% шанс применить умения без затрат маны и 15% шанс проигнорировать защиту целей (уклонение, парирование, блок, сопротивление) - длительность эффекта 12 сек, дополнительно при использовании умения Разбойник без затрат маны и ухода на перезарядку использует умение Быстрые Ноги. Использование умения сбрасывает перезарядку всех умений ветки (Быстрые ноги, Спутать карты, Град ударов).', pointsRequired: 20, selectable: true }
                ]
            },
            {
                name: 'Уловки',
                description: 'Повышает запас маны повышен на 0.5%, а показатели шанса критического урона и уклонения на 0.75% за каждый вложенный талант.',
                talents: [
                    { id: 'ulovki_1', name: 'Шипы', description: 'Длительность замедления увеличивается на 3 секунды.', pointsRequired: 5, selectable: true },
                    { id: 'ulovki_2', name: 'Тень', description: 'Время применения 1 сек. Можно использовать только в состоянии вне боя. При использовании разбойник получает невидимость и увеличение скорости передвижения на 20% на 18-22 сек. Любая полученная/нанесённая атака прерывает состояние невидимости. После выхода из невидимости сила атаки и показатель шанса критического урона разбойника понижены на 80% на 2 сек. При наличии таланта скорость передвижения разбойника во время действия умения увеличивается на 15%. ', pointsRequired: 10, selectable: true },
                    { id: 'ulovki_3', name: 'Дымовая Шашка', description: 'Едкий дым наносит урон и в течение 3.5 секунд не дает применять способности, а также замедляет всех противников, попавших в зону поражения, на 15%. Умение имеет 50% шанс проигнорировать защиту.', pointsRequired: 15, selectable: true },
                    { id: 'ulovki_4', name: 'Удавка', description: 'Разбойник атакует всех противников в конусе перед собой, атака наносит цели мгновенный урон и прерывает применение умений, а также в течение 10 сек. противник будет получать периодический урон и терять ману, восстанавливая её разбойнику. Умение игнорирует защиту цели, а также накладывает на разбойника эффект Стремительная Расправа - скорость передвижения увеличивается на 40% на 10 сек.', pointsRequired: 20, selectable: true }
                ]
            },
            {
                name: 'Удары',
                description: 'Повышены сила атаки и парирование на 0.75%, а также увеличен показатель критического урона на 0.5% за каждый вложенный талант.',
                talents: [
                    { id: 'udary_1', name: 'Подстроенный Удар', description: 'Атака наносит урон и снижает сопротивление критическому урону цели на 1400 на 8 секунд.', pointsRequired: 5, selectable: true },
                    { id: 'udary_2', name: 'Коварный Порез', description: 'Перезарядка снижается на 5 секунд, шанс срабатывания негативного эффекта повышается до 100%. Способность начинает игнорировать парирование цели.', pointsRequired: 10, selectable: true },
                    { id: 'udary_3', name: 'Парализующий Яд', description: 'Разбойник смазывает свое оружие ядом на 25 сек, который при атаках может на некоторое время вызывать у жертвы мышечный паралич, оглушая её на 1.25 сек. Паралич срабатывает не чаще 1 раза в 4 сек. Можно использовать в комбинации со Смертельным Ядом.', pointsRequired: 15, selectable: true },
                    { id: 'udary_4', name: 'Зияющая Рана', description: 'Разбойник оставляет на теле всех врагов в конусе перед собой кровоточащие порезы на 10 сек, которые наносят большой периодический урон. Дальность поражения умения 6 метров. Умение с шансом 50% игнорирует парирование цели. Если цель парировала умение, разбойник восстановит 100% от затраченной на умение маны.', pointsRequired: 20, selectable: true }
                ]
            }
        ],
        mage: [
            {
                name: 'Лед',
                description: 'Повышает физическую броню на 1% а также сопротивление критическому урону и точность на 0.75% за каждый вложенный талант.',
                talents: [
                    { id: 'led_1', name: 'Морозные Доспехи', description: 'Замедление усиливается дополнительно на 10%, а его длительность увеличивается на 1 сек.', pointsRequired: 5, selectable: true },
                    { id: 'led_2', name: 'Ледяная Тюрьма', description: 'Маг получает возможность использовать заклинание Ледяная Тюрьма на себя (после окончания заморозки на маге не будет эффекта замедления, длительность заморозки - 4 секунды).', pointsRequired: 10, selectable: true },
                    { id: 'led_3', name: 'Ледяные Осколки', description: 'Волна поражает противников в радиусе 7.5 метров, при попадании противники замедляются на 4%, а маг ускоряется на 4% на 8 сек. Оба эффекта складываются до 6 раз. Умение имеет 30% шанс проигнорировать уклонение цели.', pointsRequired: 15, selectable: true },
                    { id: 'led_4', name: 'Полярный Холод', description: 'На 4 секунды маг замедляет всех окружающих противников, после окончания замедления противники получают урон и оглушаются на 4 секунды.', pointsRequired: 20, selectable: true }
                ]
            },
            {
                name: 'Пламя',
                description: 'Увеличивает силу атаки и показатель критического урона на 0.75%, а также запас здоровья на 0.5% за каждый вложенный талант.',
                talents: [
                    { id: 'plamya_1', name: 'Воспламенение', description: 'Умение получает способность поджигать противников в радиусе 3 метров от цели.', pointsRequired: 5, selectable: true },
                    { id: 'plamya_2', name: 'Огненный Шар', description: 'Заклинание «Огненный Шар» получает способность на 7 сек. поджигать противников, а его зона поражения увеличена на 2 метра.', pointsRequired: 10, selectable: true },
                    { id: 'plamya_3', name: 'Испепеление', description: 'Волшебник копит внутренний огонь и выпускает его в выбранную цель, нанося урон ей и окружающим её противникам в радиусе 4 метров. Пораженные умением враги теряют 33% магической брони на 10 сек. Умение игнорирует сопротивление магии целей.', pointsRequired: 15, selectable: true },
                    { id: 'plamya_4', name: 'Пылающий Метеорит', description: 'Маг призывает с небес раскаленную каменную глыбу, которая приземляется спустя 3 сек. и при ударе о землю наносит огромный урон всем врагам в радиусе 5 метров, оглушает их на 4 секунды. При падении метеорит также замедляет все цели в радиусе 10 метров на 33% на 4 сек, эффект замедления игнорирует сопротивление магии цели.', pointsRequired: 20, selectable: true }
                ]
            },
            {
                name: 'Энергия',
                description: 'Увеличивает критического урона и уклонения на 0.75%, а также запаса маны на 0.5% за каждый вложенный талант.',
                talents: [
                    { id: 'energiya_1', name: 'Удар Молнии', description: 'Заклинание «Удар Молнии» оглушает цель вместо обездвиживания.', pointsRequired: 5, selectable: true },
                    { id: 'energiya_2', name: 'Энергетическая Волна', description: 'Увеличивает количество энергии, сжимаемой заклинанием «Энергетическая волна» на 20%. Заклинание получает способность снижать сопротивление магии противников на 20% на 8 сек.', pointsRequired: 10, selectable: true },
                    { id: 'energiya_3', name: 'Магическая Ловушка', description: 'Маг получает заклинание «Магическая ловушка». Маг ставит на землю ловушку, которая взрывается при попадании в неё противников, лишая возможности применять способности на 4 секунды.', pointsRequired: 15, selectable: true },
                    { id: 'energiya_4', name: 'Запредельный разряд', description: 'Маг выпускает мощный разряд, поражающий цель и противников в радиусе 6 метров вокруг неё. Обездвиживает противников и не имеют возможности использовать умения в течении 4 сек, а также их сила атаки снижена на 50% на 7 сек.', pointsRequired: 20, selectable: true }
                ]
            }
        ],
        priest: [
            {
                name: 'Опека',
                description: 'Увеличивается запас здоровья 0.75%, сопротивление критическому урону 0.75% и восстановления энергии 0.5% за каждый вложенный талант.',
                talents: [
                    { id: 'opeka_1', name: 'Божественный Щит', description: 'Превращает заклинание «Божественный щит» в ауру, действующую и на других игроков.', pointsRequired: 5, selectable: true },
                    { id: 'opeka_2', name: 'Молитва', description: 'Молитва получает возможность увеличивать силу атаки жреца и его союзников на 160-900 и дополнительно на 12-80 за каждого противника в радиусе 7.5м от жреца. Максимум 15 зарядов дополнительного усиления.', pointsRequired: 10, selectable: true },
                    { id: 'opeka_3', name: 'Кольцо веры', description: 'Жрец получает заклинание «Кольцо Веры». Жрец освящает землю в указанной точке. В течение 5 секунд все дружественные персонажи, попавшие под воздействие заклинания, игнорируют вражеские атаки.', pointsRequired: 15, selectable: true },
                    { id: 'opeka_4', name: 'Перевоплощение', description: 'Жрец получает заклинание «Перевоплощение», которое увеличивает показатели физ/маг брони на 6000-28000, силы атаки на 1000-4500 и здоровья на 3000-15000 на 20 сек. В этом состоянии атаки жреца провоцируют монстров атаковать его.', pointsRequired: 20, selectable: true }
                ]
            },
            {
                name: 'Отомщение',
                description: 'Увеличивает свои показатели максимального запаса маны на 0.5%, а силы атаки и шанса критического урона на 0.75%. за каждый вложенный талант.',
                talents: [
                    { id: 'otomshenie_1', name: 'Правосудие', description: 'Заклинание Правосудие получает способность давать жрецу и его спутникам невосприимчивость к эффектам обездвиживания на 5 сек.', pointsRequired: 5, selectable: true },
                    { id: 'otomshenie_2', name: 'Кара', description: 'Заклинание Кара получает способность оглушать противников 2.5 сек, а также снижать их магическую броню на 33% на это же время.', pointsRequired: 10, selectable: true },
                    { id: 'otomshenie_3', name: 'Благословение', description: 'Аура "Благословение" даёт жрецу и его союзникам в радиусе 25м положительный эффект, под действием которого, успешные атаки на 7 сек увеличивают скорость перемещения на 3-5% и скорость атаки на 50-360 единиц за каждый заряд эффекта.', pointsRequired: 15, selectable: true },
                    { id: 'otomshenie_4', name: 'Возмездие', description: 'Игнорирует защиту цели (сопротивление магии). Умение наносит урон только в PVE. Жрец обездвиживает цель на 4 сек, а также на 10-16 сек получает положительный эффект, увеличивающий атакующие характеристики на 10% и позволяющий его атакам обездвиживать цель на 1.5 сек', pointsRequired: 20, selectable: true }
                ]
            },
            {
                name: 'Вера',
                description: 'Укрепленный в вере жрец повышает показатели сопротивления магии на 1%, а также сопротивления критическому урону и блока на 0.5% за каждый вложенный талант.',
                talents: [
                    { id: 'vera_1', name: 'Божественное Сияние', description: 'Заклинание "Божественное Сияние" исцеляет дополнительно 20% от нанесённого им урона, а также частота срабатывания увеличивается на 20%.', pointsRequired: 5, selectable: true },
                    { id: 'vera_2', name: 'Небесный Cвет', description: 'Небесный Свет получает способность усиливать дружественным игрокам магическую броню на 750-10000 и рассеивать с них ещё 1 негативный эффект.', pointsRequired: 10, selectable: true },
                    { id: 'vera_3', name: 'Живительный поток', description: 'Наполняет себя и всех союзников в радиусе 15 метров силой света, повышая восстановление здоровья на 2000-10000 и восстановление энергии на 430-2000, а также увеличивая физическую и магическую броню на 20% в течение 15 секунд. ', pointsRequired: 15, selectable: true },
                    { id: 'vera_4', name: 'Воскрешение', description: 'Жрец воскрешает своего соратника, находящегося на расстоянии не более 7.5м. Длительность применения 3.3 сек. Один и тот же персонаж может быть воскрешён не чаще 1 раза в 80 сек.', pointsRequired: 20, selectable: true }
                ]
            }
        ],
        archer: [
            {
                name: 'Охотник',
                description: 'Увеличивает здоровье и сопротивление критическому урону на 0.75%, а также скорость атаки на 0.5% за каждое вложенное очко.',
                talents: [
                    { id: 'ohotnik_1', name: 'Тактическое Отступление', description: 'Применение усиленной способности снимает с лучника 3 негативных эффекта.', pointsRequired: 5, selectable: true },
                    { id: 'ohotnik_2', name: 'Сковывающий Выстрел', description: 'Усиленная талантом способность оглушает цель.', pointsRequired: 10, selectable: true },
                    { id: 'ohotnik_3', name: 'Ослепляющая Стрела', description: 'Стрела взрывается яркой вспышкой света, нанося цели небольшой магический урон и снижая её показатель точности на 90% на 4 сек. Умение игнорирует уклонение цели.', pointsRequired: 15, selectable: true },
                    { id: 'ohotnik_4', name: 'Жажда Крови', description: 'Лучник стреляет во всех противников перед собой заколдованными стрелами, которые при попадании наносят им урон и восстанавливают здоровье лучнику в размере 50% от нанесённого урона - умение игнорирует уклонение цели. Также лучнику становится доступно аналогичное умение по одиночной цели, которое восстанавливает здоровье в размере 17.5% от максимального запаса (35% при критическом срабатывании), а также похищает у цели 22.5% базового сопротивления критическому урону (не учитываются прибавки от гильдейских усилений, эликсиров и так далее) на 12 сек. Умения имеют общую перезарядку.', pointsRequired: 20, selectable: true }
                ]
            },
            {
                name: 'Стрелок',
                description: 'Увеличивает силу атаки и восстановление энергии на 0.75%, а также физ./маг. броню на 0.5% за каждое вложенное очко таланта.',
                talents: [
                    { id: 'strelok_1', name: 'Выстрел на Вскидку', description: 'Лишает возможности применять умения в течении 1.5 секунды, но перезарядка умения увеличивается на 5 сек.', pointsRequired: 5, selectable: true },
                    { id: 'strelok_2', name: 'Веерная Стрельба', description: 'Усиленная талантом способность с 20% шансом не потратит энергии.', pointsRequired: 10, selectable: true },
                    { id: 'strelok_3', name: 'Дождь из Стрел', description: 'Лучник выпускает в небо огромное количество стрел которые спустя 3 секунды обрушиваются на его противников в указанной области. Каждое попадание наносит урон и замедляет цели на 30% на 3 сек.', pointsRequired: 15, selectable: true },
                    { id: 'strelok_4', name: 'Расплавляющие Стрелы', description: 'Под действием этой способности в течение 14 сек. атаки лучника снижают физическую броню цели на 7%, а также наносят периодический урон - негативный эффект суммируется до 5 раз и длится 10 сек.', pointsRequired: 20, selectable: true }
                ]
            },
            {
                name: 'Снайпер',
                description: 'Увеличивает точность и уклонение на 0.75%, а также запас энергии на 0.5% за каждое вложенное очко таланта.',
                talents: [
                    { id: 'snaper_1', name: 'Меткость Снайпера', description: 'Талант увеличивает радиус поражения на 1 метр, сокращает перезарядку на 5 секунд и уменьшает стоимость в мане на 15%.', pointsRequired: 5, selectable: true },
                    { id: 'snaper_2', name: 'Аура Точности', description: 'Помимо точности аура начинает увеличивать ещё и шанс критического урона на аналогичное точности значение.', pointsRequired: 10, selectable: true },
                    { id: 'snaper_3', name: 'Взрывная Стрела', description: 'Лучник выпускает в цель стрелу со взрывчаткой которая взрывается через 4 секунды после попадания и наносит урон всем противникам в радиусе 4-м. Взрыв игнорирует сопротивление магии целей.', pointsRequired: 15, selectable: true },
                    { id: 'snaper_4', name: 'Уязвимые места', description: 'Успешные атаки будут наносить дополнительный урон и замедлять цель на 20% на 3 сек, также под действием эффекта умения повышается шанс лучника проигнорировать защиты цели (уклонение, сопротивление магии, блок) на 12.5%.', pointsRequired: 20, selectable: true }
                ]
            }
        ]
    };

    // Переменные состояния
    let currentClass = 'warrior';
    let availablePoints = window.talentSystemData.availablePoints;
    let spentPoints = window.talentSystemData.spentPoints;
    let talentPoints = window.talentSystemData.talentPoints;
    let selectedTalents = window.talentSystemData.selectedTalents;
    
    // Переменная для хранения текущей активной вкладки
    let currentActiveTab = '';

    // Элементы интерфейса
    const talentsSection = document.querySelector('.talents-section');
    const classButtons = document.querySelectorAll('.class-btn');

    // Инициализация системы талантов
    function initializeTalentSystem() {
        talentsSection.innerHTML = `
            <h2>Таланты <span id="points-counter">0/35</span></h2>
            <div class="talent-tree" id="talent-tree">
                <!-- Таланты будут загружены динамически -->
            </div>
            <div class="talent-controls">
                <button id="reset-talents" class="talent-btn">Сбросить таланты</button>
                <div class="points-info">
                    <span>Доступно очков: <span id="available-points">35</span></span>
                    <span>Потрачено очков: <span id="spent-points">0</span></span>
                </div>
            </div>
        `;

        loadTalentsForClass(currentClass);
        document.getElementById('reset-talents').addEventListener('click', resetTalents);

        classButtons.forEach(button => {
            button.addEventListener('click', function() {
                currentClass = this.getAttribute('data-class');
                resetTalentsOnClassChange();
                loadTalentsForClass(currentClass);
            });
        });
    }

    // Загрузка талантов для выбранного класса
    function loadTalentsForClass(characterClass) {
        const talentTree = document.getElementById('talent-tree');
        const talents = classTalents[characterClass];
        
        if (!talents) return;

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
                                        <span class="points-display">${talentPoints[characterClass][branch.name]}/20</span>
                                        <button class="add-point-btn" 
                                                data-branch="${branch.name}"
                                                ${availablePoints === 0 || talentPoints[characterClass][branch.name] >= 20 ? 'disabled' : ''}>
                                            +
                                        </button>
                                    </div>
                                </div>
                                <div class="talents-list">
                                    ${branch.talents.map((talent, talentIndex) => {
                                        const pointsInBranch = talentPoints[characterClass][branch.name];
                                        const isUnlocked = pointsInBranch >= talent.pointsRequired;
                                        const isSelected = selectedTalents[characterClass][branch.name] && 
                                                          selectedTalents[characterClass][branch.name][talent.pointsRequired] === talent.id;
                                        
                                        // Талант доступен для выбора, если:
                                        // 1. Достигнут порог (pointsInBranch >= talent.pointsRequired)
                                        // 2. Талант ещё не выбран
                                        // 3. Не превышен лимит очков (spentPoints <= 35)
                                        const canSelect = isUnlocked && !isSelected && spentPoints < 35;
                                        
                                        // Талант можно снять, если он выбран и есть доступные очки
                                        const canDeselect = isSelected && spentPoints <= 35;
                                        
                                        return `
                                            <div class="talent-item ${isUnlocked ? 'unlocked' : 'locked'} ${isSelected ? 'selected' : ''}" 
                                                data-branch="${branch.name}" 
                                                data-talent-id="${talent.id}"
                                                data-points-required="${talent.pointsRequired}">
                                                <div class="talent-points-required">${talent.pointsRequired}</div>
                                                <div class="talent-info">
                                                    <h4>${talent.name}</h4>
                                                    <p>${talent.description}</p>
                                                </div>
                                                <div class="talent-actions">
                                                    ${isUnlocked ? `
                                                        ${!isSelected ? `
                                                            <button class="talent-select-btn select-btn" 
                                                                    data-branch="${branch.name}"
                                                                    data-points="${talent.pointsRequired}"
                                                                    data-talent-id="${talent.id}"
                                                                    ${!canSelect ? 'disabled' : ''}>
                                                                Выбрать
                                                            </button>
                                                        ` : `
                                                            <button class="talent-select-btn deselect-btn" 
                                                                    data-branch="${branch.name}"
                                                                    data-points="${talent.pointsRequired}"
                                                                    data-talent-id="${talent.id}"
                                                                    ${!canDeselect ? 'disabled' : ''}>
                                                                Снять
                                                            </button>
                                                        `}
                                                    ` : `
                                                        <div class="talent-lock">🔒</div>
                                                    `}
                                                </div>
                                                <div class="talent-status">
                                                    ${isSelected ? '✓' : (isUnlocked ? '⚡' : '✗')}
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                                <div class="branch-info">
                                    ${getBranchInfo(branch, talentPoints[characterClass][branch.name], selectedTalents[characterClass][branch.name])}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Обработчики вкладок
        document.querySelectorAll('.talents-tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const branchName = this.getAttribute('data-branch');
                currentActiveTab = branchName;
                
                document.querySelectorAll('.talents-tab-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                document.querySelectorAll('.talents-tab-pane').forEach(pane => pane.classList.remove('active'));
                document.getElementById(`branch-${branchName}`).classList.add('active');
            });
        });

        // Обработчики кнопок "+"
        document.querySelectorAll('.add-point-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const branchName = this.getAttribute('data-branch');
                currentActiveTab = branchName;
                addPointToBranch(branchName);
            });
        });

        // Обработчики кнопок выбора/снятия талантов
        document.querySelectorAll('.talent-select-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const branchName = this.getAttribute('data-branch');
                const pointsRequired = this.getAttribute('data-points');
                const talentId = this.getAttribute('data-talent-id');
                const isSelect = this.classList.contains('select-btn');
                
                if (isSelect) {
                    selectTalent(branchName, pointsRequired, talentId);
                } else {
                    deselectTalent(branchName, pointsRequired, talentId);
                }
            });
        });

        updatePointsDisplay();
    }

    // Получение информации о ветке
    function getBranchInfo(branch, points, selected) {
        const thresholds = [5, 10, 15, 20];
        const nextThreshold = thresholds.find(t => t > points);
        
        let html = '<div class="branch-info-content">';
        
        if (points >= 20) {
            html += '<div class="branch-info-complete">✅ Ветка полностью прокачана!</div>';
        } else if (nextThreshold) {
            const pointsNeeded = nextThreshold - points;
            html += `<div class="branch-info-next">⚡ До следующего таланта нужно <strong>${pointsNeeded}</strong> очков (достигните ${nextThreshold})</div>`;
        }
        
        // Показываем выбранные таланты
        const selectedList = Object.entries(selected || {})
            .map(([points, id]) => {
                const talent = branch.talents.find(t => t.id === id);
                return talent ? `${talent.name} (${points} очков)` : null;
            })
            .filter(Boolean);
        
        if (selectedList.length > 0) {
            html += '<div class="branch-info-selected">📋 Выбраны:<ul>';
            selectedList.forEach(name => {
                html += `<li>${name}</li>`;
            });
            html += '</ul></div>';
        }
        
        html += '</div>';
        return html;
    }

    // Выбор таланта
    function selectTalent(branchName, pointsRequired, talentId) {
        const characterClass = currentClass;
        
        // Проверяем, не превышен ли лимит очков
        if (spentPoints >= 35) {
            alert('❌ Достигнут максимум очков талантов (35). Нельзя выбрать больше талантов.');
            return;
        }
        
        // Проверяем, достигнут ли порог
        if (talentPoints[characterClass][branchName] < pointsRequired) {
            alert(`❌ Нужно достичь ${pointsRequired} очков в ветке, чтобы выбрать этот талант.`);
            return;
        }
        
        // Инициализируем объект для ветки
        if (!selectedTalents[characterClass][branchName]) {
            selectedTalents[characterClass][branchName] = {};
        }
        
        // Проверяем, не выбран ли уже другой талант на этом уровне
        if (selectedTalents[characterClass][branchName][pointsRequired]) {
            alert(`❌ На уровне ${pointsRequired} очков уже выбран другой талант.`);
            return;
        }
        
        // Выбираем талант
        selectedTalents[characterClass][branchName][pointsRequired] = talentId;
        
        // Обновляем глобальные данные
        window.talentSystemData.selectedTalents = selectedTalents;
        
        console.log('✅ Выбран талант:', talentId, 'на уровне', pointsRequired);
        
        // Перезагружаем отображение
        loadTalentsForClass(characterClass);
        
        // Применяем таланты
        applyTalents();
    }

    // Снятие таланта
    function deselectTalent(branchName, pointsRequired, talentId) {
        const characterClass = currentClass;
        
        if (selectedTalents[characterClass][branchName] && 
            selectedTalents[characterClass][branchName][pointsRequired] === talentId) {
            
            delete selectedTalents[characterClass][branchName][pointsRequired];
            
            console.log('❌ Снят талант:', talentId, 'на уровне', pointsRequired);
            
            // Обновляем глобальные данные
            window.talentSystemData.selectedTalents = selectedTalents;
            
            // Перезагружаем отображение
            loadTalentsForClass(characterClass);
            
            // Применяем таланты
            applyTalents();
        }
    }

    // Добавление очка в ветку
    function addPointToBranch(branchName) {
        // Проверяем, не превышен ли лимит
        if (spentPoints >= 35) {
            alert('❌ Достигнут максимум очков талантов (35)');
            return;
        }
        
        if (availablePoints > 0 && talentPoints[currentClass][branchName] < 20) {
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
        document.getElementById('points-counter').textContent = `${spentPoints}/35`; // 0/35
        document.getElementById('available-points').textContent = availablePoints;
        document.getElementById('spent-points').textContent = spentPoints;
    }

    // Применение талантов
    function applyTalents() {
        if (!window.statCalculator) {
            console.warn('StatCalculator не доступен');
            return;
        }
        
        // Рассчитываем ауры от талантов
        const talentAuras = calculateTalentAuras(currentClass, talentPoints[currentClass], selectedTalents[currentClass]);
        
        // Передаем данные в statCalculator
        window.statCalculator.setTalentPoints(currentClass, talentPoints[currentClass]);
        window.statCalculator.setSelectedTalents(currentClass, selectedTalents[currentClass]);
        window.statCalculator.setTalentAuras(talentAuras);
        
        // Получаем и отображаем обновленные статы
        const newStats = window.statCalculator.calculateTotalStats();
        if (window.updateStatsDisplay) {
            window.updateStatsDisplay(newStats);
        }
        
        console.log('✅ Таланты применены. Потрачено очков:', spentPoints);
    }

    // Расчет активных аур от талантов
    function calculateTalentAuras(characterClass, talentPoints, selectedTalents) {
        const auras = {};
        
        const talentBuffEnabled = document.getElementById('talent-buff')?.checked;
        if (!talentBuffEnabled) return auras;
        
        if (characterClass === 'warrior') {
            if (selectedTalents && selectedTalents['Стойкость'] && selectedTalents['Стойкость']['6'] === 'stoikost_1') {
                auras['crit_damage_resistance'] = (auras['crit_damage_resistance'] || 0) + 800;
            }
        }
        
        if (characterClass === 'priest') {
            if (selectedTalents && selectedTalents['Отомщение'] && selectedTalents['Отомщение']['18'] === 'otomshenie_3') {
                auras['speed_percent'] = (auras['speed_percent'] || 0) + 5;
                auras['attack_speed_percent'] = (auras['attack_speed_percent'] || 0) + 5;
            }
        }
        
        if (characterClass === 'archer') {
            if (selectedTalents && selectedTalents['Снайпер'] && selectedTalents['Снайпер']['12'] === 'snaper_2') {
                auras['hit_percent'] = (auras['hit_percent'] || 0) + 5; 
                auras['crit_percent'] = (auras['crit_percent'] || 0) + 5; 
            }
        }
        
        return auras;
    }

    function resetTalentsOnClassChange() {
        availablePoints = window.talentSystemData.availablePoints;
        spentPoints = window.talentSystemData.spentPoints;
        currentActiveTab = '';
        updatePointsDisplay();
    }

    // Сброс талантов
    function resetTalents() {
        availablePoints = 35; // 35
        spentPoints = 0;
        
        Object.keys(talentPoints[currentClass]).forEach(branch => {
            talentPoints[currentClass][branch] = 0;
        });
        
        Object.keys(selectedTalents[currentClass]).forEach(branch => {
            selectedTalents[currentClass][branch] = {};
        });
        
        window.talentSystemData.availablePoints = availablePoints;
        window.talentSystemData.spentPoints = spentPoints;
        window.talentSystemData.talentPoints = talentPoints;
        window.talentSystemData.selectedTalents = selectedTalents;
        
        currentActiveTab = '';
        
        updatePointsDisplay();
        loadTalentsForClass(currentClass);
        
        if (window.statCalculator) {
            window.statCalculator.setTalentPoints(currentClass, talentPoints[currentClass]);
            window.statCalculator.setSelectedTalents(selectedTalents[currentClass]);
            const newStats = window.statCalculator.calculateTotalStats();
            if (window.updateStatsDisplay) {
                window.updateStatsDisplay(newStats);
            }
        }
    }
    
    window.applyTalents = applyTalents;

    window.talentSystem = {
        talentPoints: talentPoints,
        selectedTalents: selectedTalents,
        spentPoints: spentPoints,
        availablePoints: availablePoints,
        currentClass: currentClass,
        currentActiveTab: currentActiveTab,
        addPointToBranch: addPointToBranch,
        selectTalent: selectTalent,
        deselectTalent: deselectTalent,
        resetTalents: resetTalents,
        updatePointsDisplay: updatePointsDisplay,
        loadTalentsForClass: loadTalentsForClass,
        applyTalents: applyTalents,

        setCurrentClass: function(className) {
            currentClass = className;
            this.currentClass = className;
            currentActiveTab = '';
            this.currentActiveTab = '';
            
            if (this.loadTalentsForClass) {
                this.loadTalentsForClass(className);
            }
            
            console.log('✅ Система талантов: класс изменен на', className);
        }
    };
    
    // Обновляем функцию applyTalents для использования statCalculator
    window.applyTalents = function() {
        if (!window.statCalculator) {
            console.warn('Калькулятор статистик не доступен');
            return;
        }
        
        const talentAuras = calculateTalentAuras(currentClass, talentPoints[currentClass], selectedTalents[currentClass]);
        
        window.statCalculator.setTalentPoints(currentClass, talentPoints[currentClass]);
        window.statCalculator.setSelectedTalents(selectedTalents[currentClass]);
        window.statCalculator.setTalentAuras(talentAuras);
        
        const newStats = window.statCalculator.calculateTotalStats();
        
        if (window.updateStatsDisplay) {
            window.updateStatsDisplay(newStats);
        }
        
        console.log('✅ Таланты применены. Потрачено очков:', spentPoints);
        console.log('Выбранные таланты:', selectedTalents[currentClass]);
    };
    initializeTalentSystem();
});