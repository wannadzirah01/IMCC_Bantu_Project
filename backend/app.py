from flask import Flask, jsonify
from models import db, Packages
from config import ApplicationConfig
from flask_cors import CORS

app = Flask(__name__)
app.config.from_object(ApplicationConfig)

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

if __name__ == "__main__":
    app.run(debug=True)