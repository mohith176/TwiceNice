require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Category = require('./models/Category');
const Listing = require('./models/Listing');
const Favorite = require('./models/Favorite');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const IMG = require('./data/seedImages');

const FRESH = process.argv.includes('--fresh');
const PASSWORD = 'Password@123';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@twicenice.com';

// 2-level category tree: top-level -> [subcategories]
const CATEGORY_TREE = {
  Electronics: ['Phones', 'Laptops', 'Audio', 'Cameras'],
  Furniture: ['Sofas', 'Tables', 'Chairs', 'Beds'],
  Vehicles: ['Bicycles', 'Motorcycles', 'Cars'],
  Fashion: ['Jackets', 'Dresses', 'Footwear'],
  Books: ['Fiction', 'Textbooks'],
  Home: ['Kitchen', 'Decor', 'Appliances'],
  Sports: ['Fitness', 'Outdoor'],
  'Musical Instruments': ['Guitars'],
};

// Demo users (besides the admin). All share PASSWORD.
const USERS = [
  { name: 'Alice Verma', email: 'alice@twicenice.com', location: 'Hyderabad', phone: '9000000001' },
  { name: 'Bob Nair', email: 'bob@twicenice.com', location: 'Bangalore', phone: '9000000002' },
  { name: 'Carol Mehta', email: 'carol@twicenice.com', location: 'Mumbai', phone: '' },
  { name: 'Dave Khan', email: 'dave@twicenice.com', location: 'Delhi', phone: '9000000004' },
  { name: 'Eve DSouza', email: 'eve@twicenice.com', location: 'Pune', phone: '' },
];

// Listings. seller = index into USERS (round-robin). img = key in seedImages.
const LISTINGS = [
  { title: 'iPhone 12 (128GB)', sub: 'Phones', price: 32000, cond: 'Like New', loc: 'Hyderabad', img: 'phone1', tags: ['apple', 'smartphone'], neg: true },
  { title: 'Samsung Galaxy S21', sub: 'Phones', price: 28000, cond: 'Good', loc: 'Bangalore', img: 'phone2', tags: ['samsung', 'android'] },
  { title: 'MacBook Air M1', sub: 'Laptops', price: 65000, cond: 'Like New', loc: 'Mumbai', img: 'laptop1', tags: ['apple', 'laptop', 'ultrabook'] },
  { title: 'Dell XPS 13', sub: 'Laptops', price: 48000, cond: 'Good', loc: 'Delhi', img: 'laptop2', tags: ['dell', 'laptop'], sold: true },
  { title: 'Sony WH-1000XM4 Headphones', sub: 'Audio', price: 15000, cond: 'Good', loc: 'Pune', img: 'headphones', tags: ['sony', 'headphones', 'noise-cancelling'], neg: true },
  { title: 'Canon EOS 200D DSLR', sub: 'Cameras', price: 27000, cond: 'Good', loc: 'Hyderabad', img: 'camera', tags: ['canon', 'camera', 'dslr'] },
  { title: '3-Seater Fabric Sofa', sub: 'Sofas', price: 12000, cond: 'Fair', loc: 'Bangalore', img: 'sofa', tags: ['sofa', 'living room'], neg: true },
  { title: 'Wooden Study Desk', sub: 'Tables', price: 4000, cond: 'Good', loc: 'Mumbai', img: 'table', tags: ['desk', 'wood', 'study'] },
  { title: 'Ergonomic Office Chair', sub: 'Chairs', price: 5500, cond: 'Like New', loc: 'Delhi', img: 'chair', tags: ['chair', 'office'] },
  { title: 'Queen Size Bed Frame', sub: 'Beds', price: 9000, cond: 'Good', loc: 'Pune', img: 'bed', tags: ['bed', 'furniture'], sold: true },
  { title: 'Hero Sprint Hybrid Cycle', sub: 'Bicycles', price: 6000, cond: 'Good', loc: 'Hyderabad', img: 'bicycle', tags: ['cycle', 'bicycle'] },
  { title: 'Royal Enfield Classic 350', sub: 'Motorcycles', price: 120000, cond: 'Good', loc: 'Bangalore', img: 'motorcycle', tags: ['bike', 'motorcycle', 'royal enfield'], neg: true },
  { title: 'Maruti Swift VDi (2015)', sub: 'Cars', price: 380000, cond: 'Fair', loc: 'Mumbai', img: 'car', tags: ['car', 'maruti', 'diesel'], neg: true },
  { title: 'Genuine Leather Jacket', sub: 'Jackets', price: 2500, cond: 'Like New', loc: 'Delhi', img: 'jacket', tags: ['jacket', 'leather', 'men'] },
  { title: 'Floral Summer Dress', sub: 'Dresses', price: 1200, cond: 'New', loc: 'Pune', img: 'dress', tags: ['dress', 'women', 'summer'] },
  { title: 'Nike Running Shoes (UK 9)', sub: 'Footwear', price: 3000, cond: 'Good', loc: 'Hyderabad', img: 'shoes', tags: ['nike', 'shoes', 'running'], sold: true },
  { title: 'Used Novel Bundle (10 books)', sub: 'Fiction', price: 0, cond: 'Good', loc: 'Bangalore', img: 'books1', tags: ['books', 'novels'], free: true },
  { title: 'Engineering Textbooks Set', sub: 'Textbooks', price: 1500, cond: 'Fair', loc: 'Mumbai', img: 'textbooks', tags: ['textbooks', 'engineering'] },
  { title: 'Mixer Grinder (750W)', sub: 'Kitchen', price: 2200, cond: 'Good', loc: 'Delhi', img: 'kitchen', tags: ['kitchen', 'mixer', 'appliance'] },
  { title: 'Boho Wall Decor Set', sub: 'Decor', price: 800, cond: 'New', loc: 'Pune', img: 'decor', tags: ['decor', 'wall', 'home'] },
  { title: 'Solo Microwave Oven 20L', sub: 'Appliances', price: 4500, cond: 'Good', loc: 'Hyderabad', img: 'appliance', tags: ['microwave', 'appliance'] },
  { title: 'Adjustable Dumbbells (20kg)', sub: 'Fitness', price: 3500, cond: 'Good', loc: 'Bangalore', img: 'dumbbell', tags: ['fitness', 'dumbbell', 'gym'], neg: true, sold: true },
  { title: '4-Person Camping Tent', sub: 'Outdoor', price: 4000, cond: 'Like New', loc: 'Mumbai', img: 'tent', tags: ['camping', 'tent', 'outdoor'] },
  { title: 'Yamaha Acoustic Guitar', sub: 'Guitars', price: 5000, cond: 'Good', loc: 'Delhi', img: 'guitar', tags: ['guitar', 'yamaha', 'music'] },
];

async function wipe() {
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Listing.deleteMany({}),
    Favorite.deleteMany({}),
    Conversation.deleteMany({}),
    Message.deleteMany({}),
  ]);
  console.log('Wiped all collections.');
}

async function seed() {
  await connectDB();

  const alreadySeeded = await User.exists({ email: ADMIN_EMAIL });
  if (alreadySeeded && !FRESH) {
    console.log(`Already seeded (admin ${ADMIN_EMAIL} exists). Run "npm run seed -- --fresh" to reset.`);
    await mongoose.disconnect();
    return;
  }

  if (FRESH) {
    console.log('--fresh: wiping existing data...');
    await wipe();
  }

  const passwordHash = await User.hashPassword(PASSWORD);

  // --- Users ---
  const admin = await User.create({
    name: 'TwiceNice Admin',
    email: ADMIN_EMAIL,
    passwordHash,
    location: 'Hyderabad',
    phone: '9000000000',
    isAdmin: true,
  });
  const users = await User.create(USERS.map((u) => ({ ...u, passwordHash })));
  console.log(`Created ${users.length + 1} users (incl. admin ${ADMIN_EMAIL}).`);

  // --- Categories (2-level) ---
  const subId = {}; // subcategory name -> id
  for (const [topName, subs] of Object.entries(CATEGORY_TREE)) {
    const top = await Category.create({ name: topName, parent: null });
    for (const subName of subs) {
      const sub = await Category.create({ name: subName, parent: top._id });
      subId[subName] = sub._id;
    }
  }
  console.log(`Created ${Object.keys(CATEGORY_TREE).length} top-level categories with subcategories.`);

  // --- Listings ---
  const listingDocs = LISTINGS.map((l, i) => ({
    title: l.title,
    description: `${l.title} in ${l.cond.toLowerCase()} condition. Genuine item, reason for selling: upgrading. Price ${l.free ? 'free to a good home' : 'is ' + (l.neg ? 'negotiable' : 'firm')}.`,
    price: l.free ? 0 : l.price,
    isFree: !!l.free,
    negotiable: !!l.neg,
    category: subId[l.sub],
    condition: l.cond,
    location: l.loc,
    quantity: 1,
    tags: l.tags,
    images: [IMG[l.img]],
    status: l.sold ? 'sold' : 'active',
    seller: users[i % users.length]._id,
  }));
  const listings = await Listing.insertMany(listingDocs);
  const soldCount = listingDocs.filter((l) => l.status === 'sold').length;
  console.log(`Created ${listings.length} listings (${soldCount} sold, 1 free).`);

  // --- A sample conversation: Alice asks Bob about his Samsung (listing index 1) ---
  const samsung = listings[1]; // seller = users[1] = Bob
  const buyer = users[0]; // Alice
  const conversation = await Conversation.create({
    listing: samsung._id,
    buyer: buyer._id,
    seller: samsung.seller,
  });
  const thread = [
    { sender: buyer._id, body: 'Hi! Is the Galaxy S21 still available?', read: true },
    { sender: samsung.seller, body: 'Yes, it is. Battery health is great.', read: true },
    { sender: buyer._id, body: 'Would you take 26000 for it?', read: false },
  ];
  let last;
  for (const m of thread) {
    last = await Message.create({ conversation: conversation._id, ...m });
  }
  conversation.lastMessage = last.body;
  conversation.lastMessageAt = last.createdAt;
  await conversation.save();
  console.log('Created 1 sample conversation with 3 messages.');

  // --- A couple of favorites for Alice ---
  await Favorite.insertMany([
    { user: buyer._id, listing: listings[2]._id }, // MacBook
    { user: buyer._id, listing: listings[10]._id }, // Cycle
  ]);
  console.log('Created 2 sample favorites.');

  console.log('\nSeed complete. Demo credentials:');
  console.log(`  Admin: ${ADMIN_EMAIL} / ${PASSWORD}`);
  console.log(`  Users: alice@twicenice.com, bob@twicenice.com, ... / ${PASSWORD}`);

  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
