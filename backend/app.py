from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError
from flask import Flask, request, jsonify, url_for
import bcrypt
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
    MAIL_DEFAULT_SENDER='IMCC-Bantu@usm.my'
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


def get_student_data():
    with app.app_context():
        students = Mentor.query.filter_by(is_available=True).with_entities(
            Mentor.id,
            Mentor.name,
            Mentor.matric_num,
            Mentor.gender,
            Mentor.country,
            Mentor.school,
            Mentor.language_1,
            Mentor.language_2
        ).all()

    print("Retrieved Students:", students)

    student_df = pd.DataFrame(students, columns=[
                              'id', 'name', 'matric_no', 'gender', 'country', 'school', 'language_1', 'language_2'])
    return student_df


def find_top_matches(input_data, n=3):
    # Get the student data
    student_df = get_student_data()

    # Select the columns to compare
    columns_to_compare = ['gender', 'country',
                          'school', 'language_1', 'language_2']

    # One-hot encode the selected columns with handle_unknown='ignore'
    encoder = OneHotEncoder(handle_unknown='ignore')
    encoded_data = encoder.fit_transform(
        student_df[columns_to_compare]).toarray()

    # One-hot encode the input data
    input_encoded = encoder.transform([input_data]).toarray()

    # Calculate cosine similarity between the input data and the dataset
    similarities = cosine_similarity(input_encoded, encoded_data).flatten()

    # Get the indices of the top n most similar people
    top_indices = np.argsort(similarities)[-n:][::-1]

    # Get the top n most similar people from the dataframe
    top_matches = student_df.iloc[top_indices].copy()
    top_matches['Similarity'] = similarities[top_indices] * 100

    return top_matches[['id', 'name', 'matric_no', 'gender', 'country', 'school', 'language_1', 'language_2', 'Similarity']]


@login_manager.user_loader
def load_user(user_id):
    return Users.query.get(user_id)


@app.route('/register', methods=['POST'])
def register_user():
    try:
        data = request.json
        email = data["email"]
        password = data["password"]
        name = data["name"]
        matric_number = data.get("matricNumber")
        phone_number = data["phoneNumber"]
        school = data["school"]
        is_available = data.get("isAvailable", True)
        gender = data.get("gender")
        country = data.get("country")
        language_1 = data.get("language1")
        language_2 = data.get("language2")

        if email.endswith("@usm.my"):
            role = "admin"
        else:
            role = "mentor"

        if Users.query.filter_by(email=email).first():
            return jsonify({"error": "User already exists"}), 400

        hashed_password = bcrypt.generate_password_hash(
            password).decode('utf-8')

        if role == "admin":
            new_user = Admins(
                email=email,
                password=hashed_password,
                name=name,
                phone_number=phone_number,
                user_role=role
            )
        else:
            new_user = Mentor(
                email=email,
                password=hashed_password,
                name=name,
                phone_number=phone_number,
                user_role=role,
                matric_num=matric_number,
                school=school,
                is_available=is_available,
                gender=gender,
                country=country,
                language_1=language_1,
                language_2=language_2
            )

        db.session.add(new_user)
        db.session.commit()

        session["user_id"] = new_user.id

        return jsonify({
            "id": new_user.id,
            "email": new_user.email,
            "name": new_user.name,
            "matric_number": getattr(new_user, 'matric_num', None),
            "phone_number": new_user.phone_number,
            "school": getattr(new_user, 'school', None),
            "is_available": getattr(new_user, 'is_available', None),
            "gender": getattr(new_user, 'gender', None),
            "country": getattr(new_user, 'country', None),
            "language1": getattr(new_user, 'language_1', None),
            "language2": getattr(new_user, 'language_2', None),
            "role": role
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
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

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
        receipt_file_path=file_path,
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


@app.route('/uploads/<path:filename>')
def serve_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


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
            "Pending": ["Pending Approval", "Pending Client Approval"],
            "Active": ["Approved"],
            "Completed": ["Completed"]
        }

        if status_filter and status_filter[0] != "All":
            db_statuses = [status for s in status_filter for status in status_mapping.get(s, [])]
            query = Tickets.query.filter(Tickets.ticket_status.in_(db_statuses))
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
            malaysia_time = ticket.updated_datetime.astimezone(malaysia_timezone)
            
            ticket_list.append({
                "ticket_id": ticket.ticket_id,
                "ticket_status": ticket.ticket_status,
                "package": ticket.package.title,
                "user_name": ticket.client.client_name,
                "created_datetime": malaysia_time.strftime('%Y-%m-%d %H:%M:%S'),
                "file_name": ticket.receipt_file_path,
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
            "file_name": ticket.receipt_file_path,
            "email": ticket.client.client_email,
            "details": details_list
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/approveTicket/<int:ticket_id>', methods=['POST'])
@login_required
@admin_required
def review_ticket(ticket_id):
    data = request.get_json()
    action = data.get('action')

    if not action:
        return jsonify({"error": "No action provided"}), 400

    # Find the ticket
    ticket = Tickets.query.get(ticket_id)
    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404

    if action == 'approve':
        ticket.ticket_status = 'Approved'
        # Send email notification
        send_approval_email(ticket)

    try:
        db.session.commit()
        return jsonify({"message": f"Ticket {action}d successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Error: {str(e)}"}), 500


def send_approval_email(ticket):
    # Prepare email content
    client_email = ticket.client.client_email
    subject = "Your Ticket Has Been Approved"
    body = f"""
    <p>Dear {ticket.client.client_name},</p>
    <p>Your ticket with ID {ticket.ticket_id} has been approved. Here are the details:</p>
    <ul>
    """
    # Fetch ticket details
    ticket_details = TicketDetails.query.filter_by(ticket_id=ticket.ticket_id).all()
    for detail in ticket_details:
        detail_name = Details.query.filter_by(
            detail_id=detail.detail_id).first().detail_name
        body += f"<li><strong>{detail_name}:</strong> {detail.value}</li>"
    body += """
    </ul>
    <p>Thank you,</p>
    <p>IMCC Admin</p>
    """

    # Send the email
    msg = Message(
        subject=subject,
        recipients=[client_email],
        html=body
    )
    mail.send(msg)


@app.route('/rejectTicket/<int:ticket_id>', methods=['PUT'])
@login_required
@admin_required
def update_ticket_details(ticket_id):
    data = request.get_json()
    details = data.get('details')

    if not details:
        return jsonify({"error": "No details provided"}), 400

    try:
        ticket = Tickets.query.get(ticket_id)
        if not ticket:
            return jsonify({"error": "Ticket not found"}), 404

        # Update ticket status to "Rejected"
        ticket.ticket_status = 'Pending Client Approval'

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
        db.session.commit()

        # Prepare email content
        client_email = ticket.client.client_email
        subject = "IMCC Bantu 1-to-1 Ticket Update"
        body = f"""
        <p>Dear {ticket.client.client_name},</p>
        <p>Your ticket details has been rejected. Please review the new details below:</p>
        <ul>
        """
        for detail in details:
            body += f"<li><strong>{detail['detail_name']
                                   }:</strong> {detail['value']}</li>"
        body += f"""
        </ul>
        <p>Please <a href="{url_for('approve_ticket_page', ticket_id=ticket_id, _external=True)}">approve</a> or <a href="{url_for('reject_ticket_page', ticket_id=ticket_id, _external=True)}">reject</a> the new counteroffer.</p>
        <p>Thank you,</p>
        <p>IMCC Admin</p>
        """

        # Send the email
        try:
            send_email(client_email, subject, body)
        except Exception as email_error:
            return jsonify({"error": f"Failed to send email: {email_error}"}), 500

        return jsonify({"message": "Ticket details updated successfully and status set to Rejected"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route('/clientApproval', methods=['GET'])
def approve_ticket():
    ticket_id = request.args.get('ticket_id')
    if not ticket_id:
        return jsonify({"error": "No ticket ID provided"}), 400

    try:
        ticket = Tickets.query.get(ticket_id)
        if not ticket:
            return jsonify({"error": "Ticket not found"}), 404

        # Update the ticket status to approved
        ticket.ticket_status = 'Approved'
        db.session.commit()

        return render_template('response.html', message="Ticket approved successfully")
    except Exception as e:
        db.session.rollback()
        return render_template('response.html', message=f"Error: {str(e)}")


@app.route('/clientRejection', methods=['GET', 'POST'])
def reject_ticket():
    ticket_id = request.args.get('ticket_id')
    if not ticket_id:
        return jsonify({"error": "No ticket ID provided"}), 400

    try:
        ticket = Tickets.query.get(ticket_id)
        if not ticket:
            return jsonify({"error": "Ticket not found"}), 404

        if request.method == 'POST':
            # Process new counteroffer details
            data = request.get_json()
            details = data.get('details')
            if not details:
                return jsonify({"error": "No details provided"}), 400

            try:
                # Delete old ticket details
                TicketDetails.query.filter_by(ticket_id=ticket_id).delete()

                # Add new ticket details
                for detail in details:
                    # Find or create the detail_id based on detail_name
                    detail_record = Details.query.filter_by(
                        detail_name=detail['detail_name']).first()
                    if not detail_record:
                        detail_record = Details(
                            detail_name=detail['detail_name'],
                            detail_type="VarChar(255)"
                        )
                        db.session.add(detail_record)
                        db.session.flush()  # Get the new detail_id immediately

                    new_ticket_detail = TicketDetails(
                        ticket_id=ticket_id,
                        detail_id=detail_record.detail_id,
                        value=detail['value']
                    )
                    db.session.add(new_ticket_detail)

                # Update the ticket's updated_datetime and status
                ticket.updated_datetime = datetime.now(malaysia_timezone)
                ticket.ticket_status = 'Pending Approval'
                db.session.commit()

                return jsonify({"message": "New counteroffer submitted successfully"})
            except Exception as e:
                db.session.rollback()
                return jsonify({"error": str(e)}), 500

        # Fetch required details for the package
        package_details = PackageDetails.query.filter_by(
            package_id=ticket.package_id).all()
        details_list = [{'detail_name': pd.detail.detail_name,
                         'detail_type': pd.detail.detail_type} for pd in package_details]

        # Render the form for new counteroffer details with required details
        return render_template('new_counteroffer_form.html', ticket_id=ticket_id, details_list=details_list)
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route('/approve_page', methods=['GET'])
def approve_ticket_page():
    ticket_id = request.args.get('ticket_id')
    return render_template('approve_reject.html', action='approve', ticket_id=ticket_id)


@app.route('/reject_page', methods=['GET'])
def reject_ticket_page():
    ticket_id = request.args.get('ticket_id')
    return render_template('approve_reject.html', action='reject', ticket_id=ticket_id)


@app.route('/match', methods=['POST'])
@login_required
@admin_required
def match():
    data = request.json
    input_data = [
        data['gender'],
        data['country'],
        data['school'],
        data['language_1'],
        data['language_2']
    ]

    top_matches = find_top_matches(input_data)
    top_matches_list = top_matches.to_dict(orient='records')

    return jsonify(top_matches_list)


@app.route('/get-clients', methods=['GET'])
@login_required
@admin_required
def get_clients():
    package_ids = [1, 4, 5, 6]
    clients = db.session.query(Clients).join(Tickets).filter(
        Tickets.package_id.in_(package_ids), Clients.is_available == True).all()
    client_list = [{"id": client.client_id, "name": client.client_name,
                    "matric_no": client.matric_num} for client in clients]
    return jsonify(client_list)


@app.route('/get-client-details/<int:client_id>', methods=['GET'])
@login_required
@admin_required
def get_client_details(client_id):
    client = Clients.query.filter_by(client_id=client_id).first()
    if client:
        client_details = {
            "gender": client.gender,
            "country": client.country,
            "school": client.school,
            "language_1": client.language1,
            "language_2": client.language2
        }
        return jsonify(client_details)
    return jsonify({"error": "Client not found"}), 404


@app.route('/insert-match', methods=['POST'])
@login_required
@admin_required
def insert_match():
    try:
        user = current_user

        client_id = request.json["client_id"]
        mentor_id = request.json["mentor_id"]

        matching = Matching(client_id=client_id, mentor_id=mentor_id)
        db.session.add(matching)
        db.session.commit()

        # Retrieve the matching ID
        matching_id = matching.matching_id

        # Update the availability of the client and mentor
        db.session.query(Clients).filter(Clients.client_id ==
                                         client_id).update({Clients.is_available: False})
        db.session.query(Mentor).filter(Mentor.id == mentor_id).update(
            {Mentor.is_available: False})

        # Update the tickets for the specified client with the new matching ID
        db.session.query(Tickets).filter(Tickets.client_id == client_id).update(
            {Tickets.matching_id: matching_id})

        db.session.commit()

        return 'New match has been created successfully!', 201
    except Exception as e:
        print(f"Error: {e}")
        return str(e), 500


if __name__ == "__main__":
    app.run(debug=True)
