import { model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema({
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,  // the email is also the username
  },

  isSuperuser: {
    type: Boolean,
    default: false,
  },

  ipAddresses: {
    type: [String],
  },

  displayName: {
    type: String,
    trim: true,
    required: true,
  },

  avatar: {
    type: String,
    trim: true,
    required: true,
  },  

  linkedIn: {
    type: String,
    trim: true,
  },

  twitter: {
    type: String,
    trim: true,
  },
  
  realms: {
    type: [Schema.Types.ObjectId],
    ref: 'Realm',
  },

  currentRealm: {
    type: Schema.Types.ObjectId,
    ref: 'Realm',
  },

  location: { x: Number, y: Number },
  
  photograph: { data: Buffer, contentType: String },
  
  password: {
    type: String,
    trim: true,
    required: true,
  },
}, { timestamps: true });

// because we permit user look-ups based on email
UserSchema.index({ email: 1 });

UserSchema.index({ currentRealm: 1 });

// because we permit census-taking
UserSchema.index({ realms: 1 });

UserSchema.methods.canView = function (anotherUser) {
  if (this.isSuperuser) return true;

  // You can view someone if they're in the same realm
  const matches = this.realms.filter(realm => anotherUser.realms.includes(realm));
  if (matches.length > 0) return true;

  return false;
};

UserSchema.methods.canViewRealm = function (realm) {
  if (this.isSuperuser) return true;

  // We can view any realm we are in
  if (this.realms.includes(realm)) return true;

  return false;
};
UserSchema.methods.canViewRealmUsers = UserSchema.methods.canViewRealm;

UserSchema.methods.canEdit = function (anotherUser) {
  if (this.isSuperuser) return true;
  if (this._id.equals(anotherUser._id)) return true;

  return false;
};

// hash user password before database save
UserSchema.pre('save', function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  if (this.password) {
    this.password = bcrypt.hashSync(this.password, saltRounds);
  }

  return next();
});

const { API_BASE } = process.env;

UserSchema.set('toJSON', {
  transform(doc, ret, options) {
    ret.id = ret._id;
    ret.url = `${API_BASE}users/${ret.id}`;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
  },
});

export default model('User', UserSchema);
