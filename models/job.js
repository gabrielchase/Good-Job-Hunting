const mongoose = require('mongoose')

const Job = mongoose.Schema({
    city: { type: String },
    company: { type: String },
    country: { type: String },
    cover_letter: { type: String },
    due_date: { type: String },
    link: { type: String },
    notes: { type: String },
    position: { type: String },
    priority: { type: Boolean },
    salary: { type: Number },
    skills: [ { type: String }],
    status: { type: String, default: 'None', enum: ['None', 'Interested', 'Application Sent', 'Interviewing', 'Accepted', 'Rejected'] },
    user_id: { type: String }
})

module.exports = mongoose.model('Job', Job)
