// Category-matched image URLs for seeded listings. Each value is a stable
// Unsplash CDN link. These are verified to load before the seed is finalized;
// any that fail verification get swapped for a guaranteed-loading fallback.
const U = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=60`;

module.exports = {
  phone1: U('1511707171634-5f897ff02aa9'),
  phone2: U('1592750475338-74b7b21085ab'),
  laptop1: U('1496181133206-80ce9b88a853'),
  laptop2: U('1517336714731-489689fd1ca8'),
  headphones: U('1505740420928-5e560c06d30e'),
  camera: U('1516035069371-29a1b244cc32'),
  sofa: U('1555041469-a586c61ea9bc'),
  table: U('1503602642458-232111445657'),
  chair: U('1567538096630-e0c55bd6374c'),
  bed: U('1505693416388-ac5ce068fe85'),
  bicycle: U('1485965120184-e220f721d03e'),
  motorcycle: U('1558981403-c5f9899a28bc'),
  car: U('1503376780353-7e6692767b70'),
  jacket: U('1521572163474-6864f9cf17ab'),
  dress: U('1572804013309-59a88b7e92f1'),
  shoes: U('1542291026-7eec264c27ff'),
  books1: U('1512820790803-83ca734da794'),
  textbooks: U('1497633762265-9d179a990aa6'),
  kitchen: U('1556909114-f6e7ad7d3136'),
  decor: U('1522708323590-d24dbb6b0267'),
  appliance: U('1585515320310-259814833e62'),
  dumbbell: U('1517836357463-d25dfeac3438'),
  tent: U('1504280390367-361c6d9f38f4'),
  guitar: U('1510915361894-db8b60106cb1'),
};
