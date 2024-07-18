from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError
from flask import Flask, request, jsonify, url_for
import bcrypt
import json
from flask import Flask, jsonify, request, session, url_for, send_from_directory, render_template
from models import db, Packages, Details, PackageDetails, Tickets, TicketDetails, Clients, Users, Mentor, Admins, Matching
from config import ApplicationConfig
from flask_login import login_user, LoginManager, login_required, logout_user, current_user
from flask_cors import CORS
from flask_session import Session
from werkzeug.utils import secure_filename
import os
from flask_bcrypt import Bcrypt
from functools import wraps
import pandas as pd
import numpy as np
from sklearn.preprocessing import OneHotEncoder
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import aliased
from flask_mail import Mail, Message
from datetime import timedelta, datetime
import pytz
from sqlalchemy.orm import joinedload
import logging
from flask_mail import Message
from werkzeug.datastructures import FileStorage

logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)


malaysia_timezone = pytz.timezone('Asia/Kuala_Lumpur')

app = Flask(__name__)
app.config.from_object(ApplicationConfig)
app.config['UPLOAD_FOLDER'] = 'C:\\Users\\wanna\\IMCC_Bantu_Project\\upload'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
Session(app)

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

bcrypt = Bcrypt(app)
CORS(app, origins="http://localhost:3000", supports_credentials=True)
server_session = Session(app)
db.init_app(app)


# Mail configuration
app.config.update(
    MAIL_SERVER='smtp.gmail.com',
    MAIL_PORT=587,
    MAIL_USE_TLS=True,
    MAIL_USERNAME='wannadzirahimccfyp@gmail.com',
    MAIL_PASSWORD='qminnnawxfzotlcx',
    MAIL_DEFAULT_SENDER='imccbantu@usm.my'
)

mail = Mail(app)


def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify({"error": "Unauthorized!"}), 401
        if not isinstance(current_user, Admins):
            return jsonify({"error": "Forbidden"}), 403
        return f(*args, **kwargs)
    return decorated_function


login_manager = LoginManager()
login_manager.init_app(app)


def send_email(to, subject, body):
    msg = Message(subject, recipients=[to], html=body)
    mail.send(msg)


@login_manager.user_loader
def load_user(user_id):
    return Users.query.get(user_id)


@app.route('/register', methods=['POST'])
@login_required
@admin_required
def register_user():
    try:
        data = request.json
        email = data["email"]
        password = data["password"]
        name = data["name"]
        phone_number = data["phoneNumber"]

        # Check if the current user is the initial admin or another admin
        if current_user.email != "imccbantu@usm.my":
            return jsonify({"error": "Unauthorized to register new admins"}), 403

        if Users.query.filter_by(email=email).first():
            return jsonify({"error": "User already exists"}), 400

        hashed_password = bcrypt.generate_password_hash(
            password).decode('utf-8')

        new_user = Admins(
            email=email,
            password=hashed_password,
            name=name,
            phone_number=phone_number,
            user_role="admin"
        )

        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            "id": new_user.id,
            "email": new_user.email,
            "name": new_user.name,
            "phone_number": new_user.phone_number,
            "role": "admin"
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route('/login', methods=['POST'])
def login_user_route():
    try:
        data = request.json
        email = data["email"]
        password = data["password"]

        user = Users.query.filter_by(email=email).first()
        if not user or not bcrypt.check_password_hash(user.password, password):
            return jsonify({"error": "Invalid credentials"}), 401

        login_user(user)

        return jsonify({
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "phone_number": user.phone_number
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/changePassword', methods=['POST'])
@login_required
def change_password():
    try:
        data = request.json
        current_password = data["currentPassword"]
        new_password = data["newPassword"]

        if not bcrypt.check_password_hash(current_user.password, current_password):
            return jsonify({"error": "Invalid current password"}), 401

        hashed_password = bcrypt.generate_password_hash(
            new_password).decode('utf-8')
        current_user.password = hashed_password
        db.session.commit()

        return jsonify({"message": "Password changed successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route('/getAdmins', methods=['GET'])
@login_required
@admin_required
def get_admins():
    admins = Admins.query.all()
    admin_list = [{
        "id": admin.id,
        "name": admin.name,
        "email": admin.email,
        "phone_number": admin.phone_number
    } for admin in admins]
    return jsonify(admin_list), 200


@app.route('/getUserRole', methods=['GET'])
@login_required
def get_user_role():
    user = current_user
    user_role = user.user_role
    return jsonify({"role": user_role})


@app.route('/@me')
@login_required
def get_current_user():
    user = current_user
    if isinstance(user, Admins):
        return jsonify({
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "phone_number": user.phone_number
        })
    elif isinstance(user, Mentor):
        return jsonify({
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "matric_number": user.matric_num,
            "gender": user.gender,
            "phone_number": user.phone_number,
            "school": user.school,
            "country": user.country,
            "language1": user.language_1,
            "language2": user.language_2
        })
    else:
        return jsonify({"error": "Unknown user type"}), 400


@app.route("/logout", methods=["POST"])
@login_required
def logout_user_route():
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200


@app.route('/packageListing', methods=['GET'])
def get_package_listing():
    packages = Packages.query.all()
    package_list = [{
        "id": package.id,
        "title": package.title,
        "description": package.description,
        "price": package.price
    } for package in packages]

    return jsonify(package_list)


@app.route('/getPackageDetails/<int:package_id>', methods=['GET'])
def get_package_details(package_id):
    package_details = PackageDetails.query.filter_by(
        package_id=package_id).all()
    details = [{"detail_name": pd.detail.detail_name,
                "detail_type": pd.detail.detail_type} for pd in package_details]

    return jsonify({"package_details": details})


@app.route('/createNewTicket', methods=['POST'])
def create_new_ticket():
    # if 'file' not in request.files:
    #     return jsonify({'error': 'No file part in the request'}), 400

    # file = request.files['file']
    # if file.filename == '':
    #     return jsonify({'error': 'No selected file'}), 400

    # if file:
    #     filename = secure_filename(file.filename)
    #     file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    #     file.save(file_path)

    data = request.form.to_dict()
    package_id = data.get('package_id')
    client_name = data.get('name')
    client_email = data.get('email')
    client_phone_num = data.get('phone_num')
    gender = data.get('gender', None)
    country = data.get('country', None)
    language1 = data.get('language1', None)
    language2 = data.get('language2', None)
    matric_num = data.get("matric_num", None)
    school = data.get("school", None)

    # Ensure package_id exists in the Packages table
    package = Packages.query.get(package_id)
    if not package:
        return jsonify({'error': 'Invalid package ID'}), 400

    # Create a new client
    new_client = Clients(
        client_name=client_name,
        client_email=client_email,
        client_phone_num=client_phone_num,
        gender=gender,
        country=country,
        language1=language1,
        language2=language2,
        matric_num=matric_num,
        school=school,
        is_available=True
    )
    db.session.add(new_client)
    db.session.commit()

    new_ticket = Tickets(
        package_id=package_id,
        client_id=new_client.client_id,
        # receipt_file_path=filename,
        ticket_status='Pending Approval'
    )
    db.session.add(new_ticket)
    db.session.commit()

    # Save the dynamic details
    for detail_name, detail_value in data.items():
        if detail_name not in ['name', 'email', 'phone_num', 'package_id', 'gender', 'country', 'language1', 'language2', 'school', matric_num]:
            detail_entry = Details.query.filter_by(
                detail_name=detail_name).first()
            if detail_entry:
                ticket_detail = TicketDetails(
                    ticket_id=new_ticket.ticket_id,
                    detail_id=detail_entry.detail_id,
                    value=detail_value
                )
                db.session.add(ticket_detail)

    db.session.commit()
    return jsonify({'message': 'Form submitted successfully'})


# @app.route('/uploads/<filename>', methods=['GET'])
# def serve_file(filename):
#     return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route('/getAllTickets', methods=['GET'])
@login_required
@admin_required
def get_all_tickets():
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        offset = (page - 1) * limit
        status_filter = request.args.getlist('status')

        # Status mapping
        status_mapping = {
            "Pending": ["Pending Approval", "Pending Client Response"],
            "Active": ["Active"],
            "Completed": ["Completed"]
        }

        if status_filter and status_filter[0] != "All":
            db_statuses = [
                status for s in status_filter for status in status_mapping.get(s, [])]
            query = Tickets.query.filter(
                Tickets.ticket_status.in_(db_statuses))
        else:
            query = Tickets.query

        # Eager load related data
        total_tickets = query.count()
        tickets = query.options(
            joinedload(Tickets.package),
            joinedload(Tickets.client),
            joinedload(Tickets.ticket_details).joinedload(TicketDetails.detail)
        ).order_by(Tickets.updated_datetime.desc()).offset(offset).limit(limit).all()

        if not tickets:
            return jsonify({"ticket_list": [], "total_tickets": total_tickets}), 200

        ticket_list = []
        for ticket in tickets:
            created_datetime = ticket.created_datetime.astimezone(
                malaysia_timezone)

            updated_datetime = ticket.updated_datetime.astimezone(
                malaysia_timezone)

            ticket_list.append({
                "ticket_id": ticket.ticket_id,
                "ticket_status": ticket.ticket_status,
                "package": ticket.package.title,
                "user_name": ticket.client.client_name,
                "created_datetime": created_datetime.strftime('%Y-%m-%d %H:%M:%S'),
                "updated_datetime": updated_datetime.strftime('%Y-%m-%d %H:%M:%S'),
                # "file_name": ticket.receipt_file_path,
                "email": ticket.client.client_email,
                "details": [{"detail_name": detail.detail.detail_name, "detail_type": detail.detail.detail_type, "value": detail.value}
                            for detail in ticket.ticket_details]
            })

        return jsonify({'ticket_list': ticket_list, 'total_tickets': total_tickets})

    except Exception as e:
        app.logger.error(f"Error occurred: {str(e)}")
        return jsonify({"error": "An error occurred while fetching tickets."}), 500


@app.route('/getTicketDetails/<int:ticket_id>', methods=['GET'])
def get_ticket_details(ticket_id):
    try:
        ticket = Tickets.query.filter_by(ticket_id=ticket_id).first()

        if not ticket:
            return jsonify({"message": "Ticket not found"}), 404

        # Fetch details for the ticket
        details = TicketDetails.query.filter_by(ticket_id=ticket_id).all()

        # Format details into a list of dictionaries
        details_list = [{
            "detail_name": detail.detail.detail_name,
            "detail_type": detail.detail.detail_type,
            "value": detail.value
        } for detail in details]

        # Prepare response
        response = {
            "ticket_id": ticket.ticket_id,
            "ticket_status": ticket.ticket_status,
            "package": ticket.package.title,
            "user_name": ticket.client.client_name,
            "created_datetime": ticket.created_datetime.strftime('%Y-%m-%d %H:%M:%S'),
            "updated_datetime": ticket.updated_datetime.strftime('%Y-%m-%d %H:%M:%S'),
            # "file_name": ticket.receipt_file_path,
            "email": ticket.client.client_email,
            "details": details_list
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/activateTicket/<int:ticket_id>', methods=['POST'])
def activate_ticket(ticket_id):
    # Logic to change the ticket status to 'Active'
    try:
        ticket = Tickets.query.get(ticket_id)
        if ticket:
            ticket.ticket_status = 'Active'
            db.session.commit()
            return jsonify({"message": "Ticket activated successfully"}), 200
        else:
            return jsonify({"error": "Ticket not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def generate_email_body(ticket, status_comment=None):
    body = f"Dear {ticket.client.client_name},\n\n"
    body += f"""Your ticket with ID {ticket.ticket_id} for Package: {
        ticket.package.title} has been approved. Here are the details:\n\n"""

    ticket_details = TicketDetails.query.filter_by(
        ticket_id=ticket.ticket_id).all()
    for detail in ticket_details:
        detail_name = Details.query.filter_by(
            detail_id=detail.detail_id).first().detail_name
        body += f"{detail_name}: {detail.value}\n"

    if status_comment:
        body += f"Remarks: {status_comment}\n\n"
    else:
        body += "\n"

    body += "Please proceed to pay for the package to be subscribed using the QR code attached below. After that, kindly reply this email with the receipt that you received after completing the payment process.\n\n"
    body += "Thank you,\nIMCC Admin"
    return body


# @app.route('/approveTicket/<int:ticket_id>', methods=['POST'])
# @login_required
# @admin_required
# def review_ticket(ticket_id):
#     data = request.form
#     remarks = data.get('remarks')
#     email_message = data.get('emailMessage')
#     file = request.files.get('file')
#     if file:
#         print(f"Received file: {file.filename}")
#     else:
#         print("No file received")

#     ticket = Tickets.query.get(ticket_id)
#     if not ticket:
#         return jsonify({"error": "Ticket not found"}), 404

#     ticket.ticket_status = 'Pending Payment'
#     ticket.status_comment = remarks
#     db.session.commit()

#     send_approval_email(ticket, email_message, file, remarks)

#     try:
#         db.session.commit()
#         return jsonify({"message": "Ticket approved successfully"}), 200
#     except Exception as e:
#         db.session.rollback()
#         return jsonify({"error": f"Error: {str(e)}"}), 500


@app.route('/approveTicket/<int:ticket_id>', methods=['POST'])
@login_required
@admin_required
def review_ticket(ticket_id):
    data = request.form
    remarks = data.get('remarks')
    email_message = data.get('emailMessage')
    file = request.files.get('file')
    updated_details = data.get("updatedDetails")

    if file:
        print(f"Received file: {file.filename}")
    else:
        print("No file received")

    ticket = Tickets.query.get(ticket_id)
    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404

    if updated_details:
        details = json.loads(updated_details)
        TicketDetails.query.filter_by(ticket_id=ticket_id).delete()
        for detail in details:
            detail_record = Details.query.filter_by(
                detail_name=detail['detail_name']).first()
            if not detail_record:
                detail_record = Details(
                    detail_name=detail['detail_name'], detail_type="VarChar(255)")
                db.session.add(detail_record)
                db.session.flush()
            new_ticket_detail = TicketDetails(
                ticket_id=ticket_id,
                detail_id=detail_record.detail_id,
                value=detail['value']
            )
            db.session.add(new_ticket_detail)

    ticket.ticket_status = 'Pending Payment'
    ticket.status_comment = remarks
    db.session.commit()

    send_approval_email(ticket, email_message, file, remarks)

    try:
        db.session.commit()
        return jsonify({"message": "Ticket approved successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Error: {str(e)}"}), 500


def send_approval_email(ticket, custom_message, file, status_comment):
    client_email = ticket.client.client_email
    subject = "IMCC Bantu 1-to-1 Notification"

    body = custom_message if custom_message else generate_email_body(
        ticket, status_comment)

    msg = Message(
        subject=subject,
        recipients=[client_email],
        body=body
    )

    if file and isinstance(file, FileStorage):
        print(f"Attaching file: {file.filename}")
        msg.attach(file.filename, file.content_type, file.read())

    try:
        mail.send(msg)
        print("Email sent successfully")
    except Exception as e:
        print(f"Failed to send email: {str(e)}")


@app.route('/getEmailTemplate/<int:ticket_id>', methods=['GET'])
@login_required
@admin_required
def get_email_template(ticket_id):
    ticket = Tickets.query.get(ticket_id)
    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404

    email_template = generate_email_body(ticket)
    return jsonify({"emailTemplate": email_template}), 200


@app.route('/updateTicket/<int:ticket_id>', methods=['PUT'])
@login_required
@admin_required
def edit_ticket_details(ticket_id):
    data = request.get_json()
    details = data.get('details')

    if not details:
        return jsonify({"error": "No details provided"}), 400

    ticket = Tickets.query.get(ticket_id)
    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404

    ticket.ticket_status = 'Active'

    TicketDetails.query.filter_by(ticket_id=ticket_id).delete()

    for detail in details:
        detail_record = Details.query.filter_by(
            detail_name=detail['detail_name']).first()
        if not detail_record:
            detail_record = Details(
                detail_name=detail['detail_name'], detail_type="VarChar(255)")
            db.session.add(detail_record)
            db.session.flush()  # Get the new detail_id immediately

        new_ticket_detail = TicketDetails(
            ticket_id=ticket_id,
            detail_id=detail_record.detail_id,
            value=detail['value']
        )
        db.session.add(new_ticket_detail)

    ticket.updated_datetime = datetime.now(malaysia_timezone)
    db.session.commit()

    return jsonify({"message": "Ticket rejected successfully"}), 200


def generate_completion_email_body(ticket, status_comment=None):
    body = f"Dear {ticket.client.client_name},\n\n"
    body += f"""Your ticket with ID {ticket.ticket_id} for Package: {
        ticket.package.title} has been successfully completed. Here are the details:\n\n"""

    ticket_details = TicketDetails.query.filter_by(
        ticket_id=ticket.ticket_id).all()
    for detail in ticket_details:
        detail_name = Details.query.filter_by(
            detail_id=detail.detail_id).first().detail_name
        body += f"{detail_name}: {detail.value}\n"

    if status_comment:
        body += f"Remarks: {status_comment}\n\n"
    else:
        body += "\n"

    body += "Should you have any feedbacks regarding the service, please reply to this email.\n\n"
    body += "Thank you,\nIMCC Admin"
    return body


@app.route('/completeTicket/<int:ticket_id>', methods=['POST'])
@login_required
@admin_required
def complete_ticket(ticket_id):
    data = request.form
    # remarks = data.get('remarks')
    email_message = data.get('emailMessage')
    file = request.files.get('file')
    if file:
        print(f"Received file: {file.filename}")
    else:
        print("No file received")

    ticket = Tickets.query.get(ticket_id)
    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404

    ticket.ticket_status = 'Completed'
    # ticket.status_comment = remarks
    db.session.commit()

    send_completion_email(ticket, email_message, file)

    try:
        db.session.commit()
        return jsonify({"message": "Ticket completed successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Error: {str(e)}"}), 500


def send_completion_email(ticket, custom_message, file):
    client_email = ticket.client.client_email
    subject = "IMCC Bantu 1-to-1 Notification"

    body = custom_message if custom_message else generate_email_body(
        ticket)

    msg = Message(
        subject=subject,
        recipients=[client_email],
        body=body
    )

    if file and isinstance(file, FileStorage):
        print(f"Attaching file: {file.filename}")
        msg.attach(file.filename, file.content_type, file.read())

    try:
        mail.send(msg)
        print("Email sent successfully")
    except Exception as e:
        print(f"Failed to send email: {str(e)}")


@app.route('/getCompletionEmailTemplate/<int:ticket_id>', methods=['GET'])
@login_required
@admin_required
def get_completion_email_template(ticket_id):
    ticket = Tickets.query.get(ticket_id)
    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404

    email_template = generate_completion_email_body(ticket)
    return jsonify({"emailTemplate": email_template}), 200


@app.route('/getRejectionEmailTemplate/<int:ticket_id>', methods=['GET'])
@login_required
@admin_required
def get_rejection_email_template(ticket_id):
    ticket = Tickets.query.get(ticket_id)
    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404

    email_template = generate_rejection_email_body(ticket)
    return jsonify({"emailTemplate": email_template}), 200


def generate_rejection_email_body(ticket):
    body = f"Dear {ticket.client.client_name},\n\n"
    body += f"""Your ticket with ID {ticket.ticket_id} for Package: {
        ticket.package.title} has been updated with the following details:\n\n"""

    ticket_details = TicketDetails.query.filter_by(
        ticket_id=ticket.ticket_id).all()
    for detail in ticket_details:
        detail_name = Details.query.filter_by(
            detail_id=detail.detail_id).first().detail_name
        body += f"{detail_name}: {detail.value}\n"

    body += "\nIf you agree with the new details, please proceed to pay for the package to be subscribed using the QR code attached below. After that, kindly reply to this email with the receipt that you received after completing the payment process. Else, please reply to this email whether you would like to suggest new details or cancel the Bantu 1-to-1 subscription.\n\n"
    body += "Thank you,\nIMCC Admin"
    return body


@app.route('/rejectTicket/<int:ticket_id>', methods=['PUT'])
@login_required
@admin_required
def reject_ticket(ticket_id):
    try:
        # Parse JSON part of the multipart form data
        details = json.loads(request.form['details'])
        email_template = request.form.get('emailTemplate')

        ticket = Tickets.query.get(ticket_id)
        if not ticket:
            return jsonify({"error": "Ticket not found"}), 404

        # Update ticket status to "Pending Client Response"
        ticket.ticket_status = 'Pending Client Response'

        # Delete old ticket details
        TicketDetails.query.filter_by(ticket_id=ticket_id).delete()

        # Add new ticket details
        for detail in details:
            # Find or create the detail_id based on detail_name
            detail_record = Details.query.filter_by(
                detail_name=detail['detail_name']).first()
            if not detail_record:
                detail_record = Details(
                    detail_name=detail['detail_name'], detail_type="VarChar(255)")
                db.session.add(detail_record)
                db.session.flush()  # Get the new detail_id immediately

            new_ticket_detail = TicketDetails(
                ticket_id=ticket_id,
                detail_id=detail_record.detail_id,
                value=detail['value']
            )
            db.session.add(new_ticket_detail)

        # Update the ticket's updated_datetime
        ticket.updated_datetime = datetime.now(malaysia_timezone)

        # Handle file upload
        file = request.files.get('file')
        db.session.commit()

        send_rejection_email(ticket, details, file, email_template)

        return jsonify({"message": "Ticket rejected successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Error: {str(e)}"}), 500


def send_rejection_email(ticket, updated_details, file, email_template):
    client_email = ticket.client.client_email
    subject = "IMCC Bantu 1-to-1 Ticket Update Notification"

    body = email_template if email_template else generate_email_body(
        ticket)
    # body = generate_rejection_email_body(ticket)

    msg = Message(
        subject=subject,
        recipients=[client_email],
        body=body
    )

    if file and isinstance(file, FileStorage):
        msg.attach(file.filename, file.content_type, file.read())

    try:
        mail.send(msg)
        print("Email sent successfully")
    except Exception as e:
        print(f"Failed to send email: {str(e)}")


@app.route('/cancelTicket/<int:ticket_id>', methods=['POST'])
@login_required
@admin_required
def cancel_ticket(ticket_id):
    ticket = Tickets.query.get(ticket_id)
    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404

    ticket.ticket_status = 'Cancelled'
    # ticket.status_comment = remarks
    db.session.commit()

    try:
        db.session.commit()
        return jsonify({"message": "Ticket cancelled successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Error: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True)
