import { model, Schema } from 'mongoose';

const RealmSchema = new Schema({
  name: {
    type: String,
    trim: true,
  },

  users: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
  },

}, { timestamps: true });

const { API_BASE } = process.env;

RealmSchema.set('toJSON', {
  transform(doc, ret, options) {
    ret.id = ret._id;
    ret.url = `${API_BASE}realms/${ret.id}`;
    delete ret._id;
    delete ret.__v;
  },
});

export default model('Realm', RealmSchema);
