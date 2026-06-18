// models/User.js

import { Schema, model, models } from 'mongoose';


const UsersSchema = new Schema({
  name: {
    type: String,
    maxLength: 50
  },
  email:  {
    type: String,
    maxLength: 150
  },
}, {
    minimize: false,
    timestamps: { createdAt: 'created', updatedAt: 'modified' }
})

const Users = models.Users || model('Users', UsersSchema)

export default Users;