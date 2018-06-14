const mongoose = require('mongoose')

const Job = mongoose.Schema({
    city: { type: String },
    company: { type: String },
    country: { type: String },
    cover_letter: { type: String },
    due_date: { type: String },
    created_on: { type: String },
    link: { type: String },
    modified_on: { type: String },
    notes: { type: String },
    position: { type: String },
    priority: { type: Boolean },
    salary: { type: Number },
    salary_currency: { type: String },
    skills: [ { type: String }],
    status: { type: String, default: 'None', enum: ['None', 'Interested', 'Application Sent', 'Interviewing', 'Accepted', 'Rejected'] },
    user_id: { type: String }
})

module.exports = mongoose.model('Job', Job)
