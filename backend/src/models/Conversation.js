const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Denormalized preview fields so the inbox doesn't query messages for each row.
    lastMessage: { type: String, default: '' },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One thread per (listing, buyer) — the seller is implied by the listing.
conversationSchema.index({ listing: 1, buyer: 1 }, { unique: true });

module.exports = mongoose.model('Conversation', conversationSchema);
