import nodemailer from 'nodemailer';
import ses from 'nodemailer-ses-transport';

import { smtp, admins } from '../config';

var transporter;
if (smtp.service) {
	transporter = nodemailer.createTransport(smtp);
} else {
	transporter = nodemailer.createTransport(ses(smtp));
}

var mailOptions = {
  from: 'Eric B <dcmdb.webmaster@gmail.com>',
  subject: 'Neurosnap Error Alert',
  to: 'neurosnap@gmail.com'
};

module.exports = { transporter, mailOptions };