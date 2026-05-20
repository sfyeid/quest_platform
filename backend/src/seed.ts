import { prisma } from './config/prisma';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  console.log('Seeding database...');

  const orgHash = await bcrypt.hash('password123', 12);
  const organizer = await prisma.user.upsert({
    where: { email: 'organizer@quest.ru' },
    update: {},
    create: {
      email: 'organizer@quest.ru',
      passwordHash: orgHash,
      name: 'Иван Смирнов',
      role: 'ORGANIZER',
    },
  });

  const playerHash = await bcrypt.hash('password123', 12);
  await prisma.user.upsert({
    where: { email: 'player@quest.ru' },
    update: {},
    create: {
      email: 'player@quest.ru',
      passwordHash: playerHash,
      name: 'Мария Иванова',
      role: 'PLAYER',
    },
  });

  // Quest 1 — Moscow history
  const q1 = await prisma.quest.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Исторический центр Москвы',
      description: 'Путешествие по главным достопримечательностям столицы. Узнайте историю Красной площади, Большого театра и Александровского сада.',
      category: 'История',
      difficulty: 'MEDIUM',
      status: 'PUBLISHED',
      creatorId: organizer.id,
    },
  });

  for (const t of [
    { id: '00000000-0000-0000-0000-000000000010', orderIndex: 0, description: 'Как называется башня Кремля с курантами, выходящая на Красную площадь?', answer: 'Спасская', taskType: 'TEXT' as const, hint: 'Башня выходит прямо на Красную площадь', latitude: 55.7522, longitude: 37.6176 },
    { id: '00000000-0000-0000-0000-000000000011', orderIndex: 1, description: 'В каком году было открыто нынешнее здание Большого театра?', answer: '1825', taskType: 'NUMBER' as const, hint: 'Первая четверть XIX века', latitude: 55.7601, longitude: 37.6186 },
    { id: '00000000-0000-0000-0000-000000000012', orderIndex: 2, description: 'Знаменитый торговый пассаж напротив Кремля. Введите его аббревиатуру.', answer: 'ГУМ', taskType: 'TEXT' as const, hint: 'Три буквы — Главный Универсальный Магазин', latitude: 55.7541, longitude: 37.6215 },
    { id: '00000000-0000-0000-0000-000000000013', orderIndex: 3, description: 'Как называется мемориал с вечным огнём в Александровском саду?', answer: 'Могила Неизвестного Солдата', taskType: 'TEXT' as const, hint: 'Мемориал открыт в 1967 году', latitude: 55.7520, longitude: 37.6125 },
  ]) {
    await prisma.task.upsert({ where: { id: t.id }, update: {}, create: { ...t, questId: q1.id } });
  }

  // Quest 2 — Saint Petersburg
  const q2 = await prisma.quest.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      title: 'Петербург: город на Неве',
      description: 'Исследуйте Северную столицу — от Дворцовой площади до Петропавловской крепости. Ключевые исторические места города.',
      category: 'История',
      difficulty: 'EASY',
      status: 'PUBLISHED',
      creatorId: organizer.id,
    },
  });

  for (const t of [
    { id: '00000000-0000-0000-0000-000000000020', orderIndex: 0, description: 'Какой архитектор спроектировал здание Главного штаба с триумфальной аркой на Дворцовой площади?', answer: 'Росси', taskType: 'TEXT' as const, hint: 'Итальянец по происхождению, работал в России', latitude: 59.9390, longitude: 30.3157 },
    { id: '00000000-0000-0000-0000-000000000021', orderIndex: 1, description: 'Какова высота Александровской колонны в метрах?', answer: '47', taskType: 'NUMBER' as const, hint: 'Самая высокая монолитная колонна в мире', latitude: 59.9395, longitude: 30.3160 },
    { id: '00000000-0000-0000-0000-000000000022', orderIndex: 2, description: 'Как называется собор внутри Петропавловской крепости?', answer: 'Петропавловский', taskType: 'TEXT' as const, hint: 'Назван в честь двух апостолов', latitude: 59.9500, longitude: 30.3167 },
  ]) {
    await prisma.task.upsert({ where: { id: t.id }, update: {}, create: { ...t, questId: q2.id } });
  }

  // Quest 3 — Stalinist skyscrapers
  const q3 = await prisma.quest.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      title: 'Сталинские высотки',
      description: 'Квест по семи знаменитым высотным зданиям советской эпохи. Архитектура, история, факты.',
      category: 'Архитектура',
      difficulty: 'HARD',
      status: 'PUBLISHED',
      creatorId: organizer.id,
    },
  });

  for (const t of [
    { id: '00000000-0000-0000-0000-000000000030', orderIndex: 0, description: 'Сколько этажей в центральной башне МГУ?', answer: '36', taskType: 'NUMBER' as const, hint: 'Вместе со шпилем высота 240 метров', latitude: 55.7030, longitude: 37.5300 },
    { id: '00000000-0000-0000-0000-000000000031', orderIndex: 1, description: 'В каком году был завершён комплекс сталинских небоскрёбов?', answer: '1957', taskType: 'NUMBER' as const, hint: 'Последней достроена гостиница Украина', latitude: 55.7467, longitude: 37.5797 },
    { id: '00000000-0000-0000-0000-000000000032', orderIndex: 2, description: 'Как называется архитектурный стиль этих зданий?', answer: 'Сталинский ампир', taskType: 'TEXT' as const, hint: 'Стиль назван в честь лидера страны', latitude: 55.7480, longitude: 37.6435 },
  ]) {
    await prisma.task.upsert({ where: { id: t.id }, update: {}, create: { ...t, questId: q3.id } });
  }

  // Quest 4 — Arbat
  const q4 = await prisma.quest.upsert({
    where: { id: '00000000-0000-0000-0000-000000000004' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000004',
      title: 'Арбат: богемная улица',
      description: 'Прогулка по Старому Арбату — самой известной пешеходной улице Москвы. Поэты, художники, история.',
      category: 'Культура',
      difficulty: 'EASY',
      status: 'PUBLISHED',
      creatorId: organizer.id,
    },
  });

  for (const t of [
    { id: '00000000-0000-0000-0000-000000000040', orderIndex: 0, description: 'Как называется театр в начале Арбата, основанный в 1946 году?', answer: 'Театр Вахтангова', taskType: 'TEXT' as const, hint: 'Назван в честь режиссёра Евгения Вахтангова', latitude: 55.7497, longitude: 37.5948 },
    { id: '00000000-0000-0000-0000-000000000041', orderIndex: 1, description: 'На Арбате есть дом-музей великого русского поэта. Назовите его фамилию.', answer: 'Пушкин', taskType: 'TEXT' as const, hint: 'Автор Евгения Онегина жил здесь после свадьбы', latitude: 55.7485, longitude: 37.5887 },
    { id: '00000000-0000-0000-0000-000000000042', orderIndex: 2, description: 'В конце Арбата стоит памятник певцу, написавшему Кони привередливые. Назовите его.', answer: 'Высоцкий', taskType: 'TEXT' as const, hint: 'Автор и исполнитель бардовских песен', latitude: 55.7462, longitude: 37.5820 },
  ]) {
    await prisma.task.upsert({ where: { id: t.id }, update: {}, create: { ...t, questId: q4.id } });
  }

  console.log('Seed completed: 2 users, 4 quests, 13 tasks');
}
