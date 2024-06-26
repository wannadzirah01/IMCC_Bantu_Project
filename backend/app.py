from flask import Flask, jsonify, request
from models import db, Packages, Details, PackageDetails, Tickets, TicketDetails, Clients
from config import ApplicationConfig
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os

app = Flask(__name__)
app.config.from_object(ApplicationConfig)
app.config['UPLOAD_FOLDER'] = 'C:\\Users\\wanna\\IMCC_Bantu_Project\\upload'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB max size

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

db.init_app(app)

with app.app_context():
    db.create_all()

CORS(app, origins="http://localhost:3000", supports_credentials=True)


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
