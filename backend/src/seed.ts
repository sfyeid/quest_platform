import { prisma } from './config/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Seeding database...');

  // Users
  const orgHash = await bcrypt.hash('password123', 12);
  const organizer = await prisma.user.upsert({
    where: { email: 'organizer@quest.ru' },
    update: {},
    create: {
      email: 'organizer@quest.ru',
      passwordHash: orgHash,
      name: 'Иван Организатор',
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
      name: 'Мария Игрок',
      role: 'PLAYER',
    },
  });

  // Quest
  const quest = await prisma.quest.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Исторический центр Москвы',
      description: 'Увлекательное путешествие по достопримечательностям исторического центра столицы. Вас ждут загадки, тайны и открытия!',
      category: 'История',
      difficulty: 'MEDIUM',
      status: 'PUBLISHED',
      creatorId: organizer.id,
    },
  });

  // Tasks
  const tasks = [
    {
      id: '00000000-0000-0000-0000-000000000010',
      orderIndex: 0,
      description: 'Перед вами знаменитая площадь. Как называется башня с курантами на её главной башне?',
      answer: 'Спасская',
      taskType: 'TEXT' as const,
      hint: 'Она смотрит на Красную площадь',
      latitude: 55.7522,
      longitude: 37.6176,
    },
    {
      id: '00000000-0000-0000-0000-000000000011',
      orderIndex: 1,
      description: 'Вы у главного театра страны. В каком году было построено нынешнее здание Большого театра?',
      answer: '1825',
      taskType: 'NUMBER' as const,
      hint: 'В первой половине XIX века',
      latitude: 55.7601,
      longitude: 37.6186,
    },
    {
      id: '00000000-0000-0000-0000-000000000012',
      orderIndex: 2,
      description: 'Найдите знаменитый торговый пассаж напротив Кремля. Как он называется?',
      answer: 'ГУМ',
      taskType: 'TEXT' as const,
      hint: 'Три буквы, аббревиатура',
      latitude: 55.7541,
      longitude: 37.6215,
    },
  ];

  for (const task of tasks) {
    await prisma.task.upsert({
      where: { id: task.id },
      update: {},
      create: { ...task, questId: quest.id },
    });
  }

  console.log('✅ Seed completed!');
  console.log('   Organizer: organizer@quest.ru / password123');
  console.log('   Player:    player@quest.ru / password123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
