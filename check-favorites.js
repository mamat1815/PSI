import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkFavorites() {
  try {
    console.log('Checking favorite events...');
    
    const favorites = await prisma.favoriteEvent.findMany({
      include: {
        event: {
          select: { title: true, date: true }
        },
        user: {
          select: { name: true, email: true }
        }
      }
    });
    
    console.log('Total favorite events:', favorites.length);
    favorites.forEach(fav => {
      console.log(`- User: ${fav.user.name} (${fav.user.email})`);
      console.log(`  Event: ${fav.event.title}`);
      console.log(`  Date: ${fav.event.date}`);
      console.log('---');
    });

    // Cek user yang login untuk debugging
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true }
    });
    
    console.log('\nUsers in system:');
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkFavorites();
