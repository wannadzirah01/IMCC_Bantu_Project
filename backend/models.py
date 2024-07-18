from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from datetime import datetime
import pytz
from flask_login import UserMixin

db = SQLAlchemy()
ma = Marshmallow()

malaysia_timezone = pytz.timezone('Asia/Kuala_Lumpur')


class Users(db.Model, UserMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    phone_number = db.Column(db.String(20), nullable=True)
    user_role = db.Column(db.String(50), nullable=False)

    __mapper_args__ = {
        'polymorphic_on': user_role,
        'polymorphic_identity': 'user'
    }


class Admins(Users):
    __tablename__ = 'admins'
    id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)

    __mapper_args__ = {
        'polymorphic_identity': 'admin'
    }


class Mentor(Users):
    __tablename__ = 'mentor'
    id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    matric_num = db.Column(db.String(255), nullable=True)
    school = db.Column(db.String(255), nullable=True)
    is_available = db.Column(db.Boolean, default=True)
    gender = db.Column(db.String(50), nullable=True)
    country = db.Column(db.String(100), nullable=True)
    language_1 = db.Column(db.String(100), nullable=True)
    language_2 = db.Column(db.String(100), nullable=True)

    __mapper_args__ = {
        'polymorphic_identity': 'mentor'
    }


class Packages(db.Model):
    __tablename__ = 'packages'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(345), nullable=False)
    description = db.Column(db.String(500), nullable=True)
    price = db.Column(db.Float, nullable=True)


class Details(db.Model):
    __tablename__ = 'detail'
    detail_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    detail_name = db.Column(db.String(255), nullable=False)
    detail_type = db.Column(db.String(50), nullable=False)


class PackageDetails(db.Model):
    __tablename__ = 'package_detail'
    package_detail_id = db.Column(
        db.Integer, primary_key=True, autoincrement=True)
    package_id = db.Column(db.Integer, db.ForeignKey(
        'packages.id'), nullable=False)
    detail_id = db.Column(db.Integer, db.ForeignKey(
        'detail.detail_id'), nullable=False)
    detail = db.relationship('Details', backref='package_details')
    package = db.relationship('Packages', backref='package_details')


class Clients(db.Model):
    __tablename__ = 'clients'
    client_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    client_name = db.Column(db.String(100), nullable=False)
    client_email = db.Column(db.String(255), nullable=False)
    client_phone_num = db.Column(db.String(20), nullable=True)
    gender = db.Column(db.String(255), nullable=True)
    country = db.Column(db.String(255), nullable=True)
    language1 = db.Column(db.String(255), nullable=True)
    language2 = db.Column(db.String(255), nullable=True)
    school = db.Column(db.String(255), nullable=True)
    matric_num = db.Column(db.String(255), nullable=True)
    is_available = db.Column(db.Boolean, default=True)


class Tickets(db.Model):
    __tablename__ = 'tickets'
    ticket_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    package_id = db.Column(db.Integer, db.ForeignKey(
        'packages.id'), nullable=False)
    client_id = db.Column(db.Integer, db.ForeignKey(
        'clients.client_id'), nullable=False)
    receipt_file_path = db.Column(db.String(255), nullable=True)
    ticket_status = db.Column(db.String(255))
    status_comment = db.Column(db.String(500), nullable=True)
    created_datetime = db.Column(
        db.DateTime, default=lambda: datetime.now(malaysia_timezone))
    updated_datetime = db.Column(
        db.DateTime, default=lambda: datetime.now(malaysia_timezone))
    matching_id = db.Column(db.Integer, db.ForeignKey('matching.matching_id'), nullable=True)

    package = db.relationship('Packages', backref='tickets')
    client = db.relationship('Clients', backref='tickets')
    matching = db.relationship('Matching', backref="tickets")


class TicketDetails(db.Model):
    __tablename__ = 'ticket_detail'
    ticket_detail_id = db.Column(
        db.Integer, primary_key=True, autoincrement=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey(
        'tickets.ticket_id'), nullable=False)
    detail_id = db.Column(db.Integer, db.ForeignKey(
        'detail.detail_id'), nullable=False)
    value = db.Column(db.String(255))

    detail = db.relationship('Details', backref='ticket_details')
    ticket = db.relationship('Tickets', backref='ticket_details')


class Matching(db.Model):
    __tablename__ = 'matching'
    matching_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    mentor_id = db.Column(db.Integer, db.ForeignKey(
        'mentor.id'), nullable=False)
    client_id = db.Column(db.Integer, db.ForeignKey(
        'clients.client_id'), nullable=False)
    matching_date = db.Column(db.DateTime, default=datetime.utcnow)
    matching_status = db.Column(db.String(255))

    mentor = db.relationship('Mentor', backref='matchings')
    client = db.relationship('Clients', backref='matchings')


class Feedback(db.Model):
    __tablename__ = 'feedback'
    feedback_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    feedback_desc = db.Column(db.String(500), nullable=True)
    feedback_date = db.Column(db.DateTime, default=datetime.utcnow)
    matching_status = db.Column(db.String(255), nullable=True)
    accessibility_rating = db.Column(db.Integer, nullable=True)
    initiation_rating = db.Column(db.Integer, nullable=True)
    communication_rating = db.Column(db.Integer, nullable=True)
    knowledge_rating = db.Column(db.Integer, nullable=True)
    behaviour_rating = db.Column(db.Integer, nullable=True)
    friendliness_rating = db.Column(db.Integer, nullable=True)
    effort_rating = db.Column(db.Integer, nullable=True)
    overall_rating = db.Column(db.Integer, nullable=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey(
        'tickets.ticket_id'), nullable=False)

    ticket = db.relationship('Tickets', backref='feedbacks')
