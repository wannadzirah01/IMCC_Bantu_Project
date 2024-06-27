import bcrypt
from flask import Flask, jsonify, request, session
from models import db, Packages, Details, PackageDetails, Tickets, TicketDetails, Clients, Users, Mentor, Admins
from config import ApplicationConfig
from flask_login import login_user, LoginManager, login_required, logout_user, current_user
from flask_cors import CORS
from flask_session import Session
from werkzeug.utils import secure_filename
import os
from flask_bcrypt import Bcrypt

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

with app.app_context():
    db.create_all()

login_manager = LoginManager()
login_manager.init_app(app)


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

    # Create a new client
    new_client = Clients(
        client_name=client_name,
        client_email=client_email,
        client_phone_num=client_phone_num,
        gender=gender,
        country=country,
        language1=language1,
        language2=language2
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
        if detail_name not in ['name', 'email', 'phone_num', 'package_id', 'gender', 'country', 'language1', 'language2']:
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


if __name__ == "__main__":
    app.run(debug=True)
