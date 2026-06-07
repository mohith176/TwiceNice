const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Listing = require('../models/Listing');
const asyncHandler = require('../utils/asyncHandler');

// Normalizes a ref to its id string, whether it's an ObjectId or a populated doc.
function idOf(ref) {
  return String(ref && ref._id ? ref._id : ref);
}

function isParticipant(conversation, userId) {
  return idOf(conversation.buyer) === String(userId) || idOf(conversation.seller) === String(userId);
}

// POST /api/conversations  { listingId, body }  (protected)
// A buyer opens (or continues) the thread for a listing and posts a message.
exports.start = asyncHandler(async (req, res) => {
  const { listingId, body } = req.body;

  const listing = await Listing.findById(listingId);
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }
  if (String(listing.seller) === String(req.user._id)) {
    return res.status(400).json({ error: 'You cannot message your own listing' });
  }

  // Reuse the existing thread for this (listing, buyer) if there is one.
  let conversation = await Conversation.findOne({ listing: listing._id, buyer: req.user._id });
  if (!conversation) {
    conversation = await Conversation.create({
      listing: listing._id,
      buyer: req.user._id,
      seller: listing.seller,
    });
  }

  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    body,
  });

  conversation.lastMessage = body;
  conversation.lastMessageAt = message.createdAt;
  await conversation.save();

  res.status(201).json({ conversation, message });
});

// GET /api/conversations  (protected) — my inbox, newest activity first.
exports.inbox = asyncHandler(async (req, res) => {
  const me = req.user._id;

  const conversations = await Conversation.find({ $or: [{ buyer: me }, { seller: me }] })
    .sort({ lastMessageAt: -1 })
    .populate('listing', 'title images status')
    .populate('buyer', 'name')
    .populate('seller', 'name')
    .lean();

  // Per-conversation unread counts (messages addressed to me, still unread).
  const ids = conversations.map((c) => c._id);
  const unreadAgg = await Message.aggregate([
    { $match: { conversation: { $in: ids }, sender: { $ne: me }, read: false } },
    { $group: { _id: '$conversation', count: { $sum: 1 } } },
  ]);
  const unreadMap = {};
  unreadAgg.forEach((u) => { unreadMap[String(u._id)] = u.count; });

  const items = conversations.map((c) => ({
    ...c,
    otherParty: String(c.buyer._id) === String(me) ? c.seller : c.buyer,
    unread: unreadMap[String(c._id)] || 0,
  }));

  res.json({ items });
});

// GET /api/conversations/unread-count  (protected) — number of conversations
// that have unread messages addressed to me (the navbar badge).
exports.unreadCount = asyncHandler(async (req, res) => {
  const me = req.user._id;
  const myConvs = await Conversation.find({ $or: [{ buyer: me }, { seller: me }] }).select('_id');
  const ids = myConvs.map((c) => c._id);
  const withUnread = await Message.distinct('conversation', {
    conversation: { $in: ids },
    sender: { $ne: me },
    read: false,
  });
  res.json({ count: withUnread.length });
});

// GET /api/conversations/:id/messages  (protected, participant) — list messages
// and mark the other party's messages as read (viewing == reading).
exports.messages = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id)
    .populate('listing', 'title images status')
    .populate('buyer', 'name')
    .populate('seller', 'name');

  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  if (!isParticipant(conversation, req.user._id)) {
    return res.status(403).json({ error: 'This is not your conversation' });
  }

  await Message.updateMany(
    { conversation: conversation._id, sender: { $ne: req.user._id }, read: false },
    { read: true }
  );

  const messages = await Message.find({ conversation: conversation._id })
    .sort({ createdAt: 1 })
    .populate('sender', 'name');

  res.json({ conversation, messages });
});

// POST /api/conversations/:id/messages  { body }  (protected, participant)
exports.sendMessage = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  if (!isParticipant(conversation, req.user._id)) {
    return res.status(403).json({ error: 'This is not your conversation' });
  }

  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    body: req.body.body,
  });

  conversation.lastMessage = req.body.body;
  conversation.lastMessageAt = message.createdAt;
  await conversation.save();

  res.status(201).json({ message });
});
