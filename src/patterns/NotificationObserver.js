const pool = require('../config/db');
const { sendMail } = require('../utils/mailer');

class NotificationSubject {
  constructor() {
    this.observers = [];
  }

  subscribe(observer) {
    this.observers.push(observer);
  }

  async notify(event) {
    for (const observer of this.observers) {
      await observer.update(event);
    }
  }
}

class EmailNewsObserver {
  async update(event) {
    if (event.type !== 'NEWS_CREATED') return;

    const users = await pool.query("SELECT email FROM users WHERE role <> 'admin'");
    for (const user of users.rows) {
      await sendMail({
        to: user.email,
        subject: `Nueva noticia: ${event.payload.title}`,
        text: event.payload.content
      });
    }
  }
}

const notificationSubject = new NotificationSubject();
notificationSubject.subscribe(new EmailNewsObserver());

module.exports = notificationSubject;
