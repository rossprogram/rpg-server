import { model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema({
  // the email is also the username
  email: {
    type: String,
    trim: true,
    unique: true,
    sparse: true,
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
  
  domains: {
    type: [String],
  },

  ipAddresses: {
    type: [String],
  },
  
  location: { x: Number, y: Number },
  
  photograph: { data: Buffer, contentType: String },
  
  password: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

// because we permit user look-ups based on email
UserSchema.index({ email: 1 }, {unique: true, sparse: true});

// because we permit census-taking
UserSchema.index({ domains: 1 });

UserSchema.methods.canView = function (anotherUser) {
  if (this.isSuperuser) return true;

  // You can view someone if they're in the same domain
  const matches = this.domains.filter(domain => anotherUser.domains.includes(domain));
  if (matches.length > 0) return true;

  return false;
};

UserSchema.methods.canViewDomain = function (domain) {
  if (this.isSuperuser) return true;

  // We can view any domain we are in
  if (this.domains.includes(domain)) return true;

  return false;
};
UserSchema.methods.canViewDomainUsers = UserSchema.methods.canViewDomain;

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
    const saltRounds = 10;
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
