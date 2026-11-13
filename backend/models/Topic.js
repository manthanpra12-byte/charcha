const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Topic title is required'],
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    description: {
      type: String,
      required: [true, 'Topic description is required'],
      trim: true,
      maxlength: 500,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    postCount: { type: Number, default: 0 }, 
  },
  { timestamps: true }
);


// Unique title, ignoring upper/lower case ("Gaming" and "gaming" count as the same)
topicSchema.index({ title: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

module.exports = mongoose.model('Topic', topicSchema);