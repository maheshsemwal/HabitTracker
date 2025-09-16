import { PrismaClient } from '../generated/prisma'
import { readFileSync } from 'fs'
import { join } from 'path'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

// Load JSON data
const loadJsonData = (filename: string) => {
  const filePath = join(__dirname, '..', 'data', filename)
  const jsonData = readFileSync(filePath, 'utf-8')
  return JSON.parse(jsonData)
}

async function main() {
  console.log('Starting database seed...')

  const usersData = loadJsonData('users.json')
  const habitsData = loadJsonData('habits.json')
  const followsData = loadJsonData('follows.json')
  const completedHabitsData = loadJsonData('completedHabits.json')
  const feedData = loadJsonData('feed.json')

  console.log('Loaded JSON data files')

  await prisma.completedHabit.deleteMany()
  await prisma.feed.deleteMany()
  await prisma.follow.deleteMany()
  await prisma.habit.deleteMany()
  await prisma.user.deleteMany()
  console.log('🗑️ Cleared existing data')

  const userMap = new Map()
  for (const userData of usersData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        overallStreak: userData.overallStreak,
        longestOverallStreak: userData.longestOverallStreak,
      },
    })
    userMap.set(userData.id, user.id)
    console.log(`Created user: ${user.name}`)
  }

  // Create habits
  const habitMap = new Map()
  for (const habitData of habitsData) {
    const habit = await prisma.habit.create({
      data: {
        name: habitData.name,
        description: habitData.description,
        category: habitData.category,
        frequency: habitData.frequency,
        userId: userMap.get(habitData.userId),
        currentStreak: habitData.currentStreak,
        longestStreak: habitData.longestStreak,
      },
    })
    habitMap.set(habitData.id, habit.id)
    console.log(`Created habit: ${habit.name}`)
  }

  // Create follows
  for (const followData of followsData) {
    await prisma.follow.create({
      data: {
        userId: userMap.get(followData.followingId),
        followerId: userMap.get(followData.followerId),
        status: 'ACCEPTED',
      },
    })
  }
  console.log('Created follow relationships')

  // Create completed habits
  for (const completedData of completedHabitsData) {
    await prisma.completedHabit.create({
      data: {
        habitId: habitMap.get(completedData.habitId),
        date: new Date(completedData.completedAt),
      },
    })
  }
  console.log('Created completed habits')

  // Create feed entries
  for (const feedEntry of feedData) {
    await prisma.feed.create({
      data: {
        userId: userMap.get(feedEntry.userId),
        habitId: habitMap.get(feedEntry.habitId),
        type: feedEntry.type,
        message: feedEntry.message,
        createdAt: new Date(feedEntry.createdAt),
      },
    })
  }
  console.log('Created feed entries')

  console.log('Database seeded successfully!')
  console.log(`Seeded: ${usersData.length} users, ${habitsData.length} habits, ${followsData.length} follows, ${completedHabitsData.length} completions, ${feedData.length} feed entries`)
}

// Run the seed function
main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })