import { Schema, model, models } from 'mongoose';

const AccountSchema = new Schema({
    name: Schema.Types.Mixed,
    provider: {
        type: String,
        enums: ['ms'],
        required: true
    },
    createdAt: Date,
    modifiedAt: Date,
    expiresAt: Date,
    userId: Schema.Types.ObjectId,
    oauthData: {
        token_type: String,
        scope: String,
        expires_in: Number,
        ext_expires_in: Number,
        access_token: String,
        refresh_token: String,
        id_token: String
    },
    company: String,
    permissions: [{
        email: String,
        role: String,
        readEmail: Boolean,
        writeEmail: Boolean,
        readCalendar: Boolean,
        writeCalendar: Boolean
    }],
    enabled: Boolean,
    status: Schema.Types.Mixed
})

const ServicesSchema = new Schema({    
    type: {
        type: String,        
    },
    key: {
        type: Number,        
    },
    enabled: {
        type: Boolean,
        default: false
    },
    connectors: [Schema.Types.ObjectId],
    params: [{
        "type": { 
            type: String, 
            enums: ['config'],
            required: true
        },
        accounts: [AccountSchema]
    }]
}, {
    minimize: false,
    timestamps: { createdAt: 'created', updatedAt: 'modified' },
    discriminatorKey: 'type'
})




const Services = models.Services || model('Services', ServicesSchema)

export default Services;