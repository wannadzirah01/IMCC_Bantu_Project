import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "../Modal.css";

Modal.setAppElement("#root");

function PackageFormModal({ isOpen, onRequestClose, packageId }) {
    const [details, setDetails] = useState([]);
    const [formData, setFormData] = useState({});
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNum, setPhoneNum] = useState("");
    const [gender, setGender] = useState("");
    const [country, setCountry] = useState("");
    const [language1, setLanguage1] = useState("");
    const [language2, setLanguage2] = useState("");
    const [matricNum, setMatricNum] = useState("");
    const [school, setSchool] = useState("");
    const [phoneError, setPhoneError] = useState(""); // Add phone number error state

    useEffect(() => {
        const fetchPackageDetails = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/getPackageDetails/${packageId}`
                );
                setDetails(response.data.package_details);
                setFormData(
                    response.data.package_details.reduce((acc, detail) => {
                        acc[detail.detail_name] = "";
                        return acc;
                    }, {})
                );
            } catch (error) {
                console.error("Error fetching package details:", error);
            }
        };

        if (packageId) {
            fetchPackageDetails();
        }
    }, [packageId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "name") {
            setName(value);
        } else if (name === "email") {
            setEmail(value);
        } else if (name === "gender") {
            setGender(value);
        } else if (name === "country") {
            setCountry(value);
        } else if (name === "language1") {
            setLanguage1(value);
        } else if (name === "language2") {
            setLanguage2(value);
        } else if (name === "matricNum") {
            setMatricNum(value);
        } else if (name === "school") {
            setSchool(value);
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Phone number validation handled by react-phone-number-input

        const formDataToSend = new FormData();
        formDataToSend.append("name", name);
        formDataToSend.append("email", email);
        formDataToSend.append("phone_num", phoneNum);
        formDataToSend.append("package_id", packageId);
        formDataToSend.append("gender", gender);
        formDataToSend.append("country", country);
        formDataToSend.append("language1", language1);
        formDataToSend.append("language2", language2);
        formDataToSend.append("matric_num", matricNum);
        formDataToSend.append("school", school);
        Object.entries(formData).forEach(([key, value]) => {
            formDataToSend.append(key, value);
        });

        try {
            const response = await axios.post(
                "http://localhost:5000/createNewTicket",
                formDataToSend,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: true,
                }
            );
            console.log("Form submitted successfully:", response.data);
            resetForm(); // Reset form after successful submission
            onRequestClose();
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    const resetForm = () => {
        setName("");
        setEmail("");
        setPhoneNum("");
        setGender("");
        setCountry("");
        setLanguage1("");
        setLanguage2("");
        setMatricNum("");
        setSchool("");
        setFormData({});
        setPhoneError("");
    };

    const handleRequestClose = () => {
        resetForm();
        onRequestClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={handleRequestClose}
            className="modal"
        >
            <h3>Package Details Form</h3>
            <form onSubmit={handleSubmit}>
                <div className="detail-row">
                    <label>Client Name: </label>
                    <input
                        type="text"
                        name="name"
                        value={name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="detail-row">
                    <label>Client Phone Number: </label>
                    <PhoneInput
                        international
                        defaultCountry="US"
                        value={phoneNum}
                        onChange={setPhoneNum}
                    />
                    {phoneError && <span className="error">{phoneError}</span>}
                </div>
                <div className="detail-row">
                    <label>Client Email: </label>
                    <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={handleChange}
                        required
                    />
                </div>
                {[1, 4, 5, 6].includes(packageId) && (
                    <>
                        <div className="detail-row">
                            <label>Matric Number: </label>
                            <input
                                type="text"
                                name="matricNum"
                                value={matricNum}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="detail-row">
                            <label>School: </label>
                            <select
                                name="school"
                                value={school}
                                onChange={handleChange}
                                required
                            >
                                <option value="" disabled>
                                    Select your school
                                </option>
                                <option value="School of Arts">
                                    School of Arts
                                </option>
                                <option value="School of Biology">
                                    School of Biology
                                </option>
                                <option value="School of Business">
                                    School of Business
                                </option>
                                <option value="School of Chemistry">
                                    School of Chemistry
                                </option>
                                <option value="School of Communication">
                                    School of Communication
                                </option>
                                <option value="School of Computer Sciences">
                                    School of Computer Sciences
                                </option>
                                <option value="School of Educational Studies">
                                    School of Educational Studies
                                </option>
                                <option value="School of Engineering">
                                    School of Engineering
                                </option>
                                <option value="School of Literature">
                                    School of Literature
                                </option>
                                <option value="School of Management">
                                    School of Management
                                </option>
                                <option value="School of Mathematics">
                                    School of Mathematics
                                </option>
                                <option value="School of Medical Sciences">
                                    School of Medical Sciences
                                </option>
                                <option value="School of Pharmacy">
                                    School of Pharmacy
                                </option>
                                <option value="School of Physics">
                                    School of Physics
                                </option>
                                <option value="School of Social Sciences">
                                    School of Social Sciences
                                </option>
                            </select>
                        </div>
                        <div className="detail-row">
                            <label>Gender: </label>
                            <select
                                name="gender"
                                value={gender}
                                onChange={handleChange}
                                required
                            >
                                <option value="" disabled>
                                    Select gender
                                </option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div className="detail-row">
                            <label>Country: </label>
                            <select
                                type="text"
                                name="country"
                                value={country}
                                onChange={handleChange}
                            >
                                <option value="" disabled>
                                    Select your origin country
                                </option>
                                <option value="Afghanistan">Afghanistan</option>
                                <option value="Albania">Albania</option>
                                <option value="Algeria">Algeria</option>
                                <option value="Andorra">Andorra</option>
                                <option value="Angola">Angola</option>
                                <option value="Antigua and Barbuda">
                                    Antigua and Barbuda
                                </option>
                                <option value="Argentina">Argentina</option>
                                <option value="Armenia">Armenia</option>
                                <option value="Australia">Australia</option>
                                <option value="Austria">Austria</option>
                                <option value="Azerbaijan">Azerbaijan</option>
                                <option value="The Bahamas">The Bahamas</option>
                                <option value="Bahrain">Bahrain</option>
                                <option value="Bangladesh">Bangladesh</option>
                                <option value="Barbados">Barbados</option>
                                <option value="Belarus">Belarus</option>
                                <option value="Belgium">Belgium</option>
                                <option value="Belize">Belize</option>
                                <option value="Benin">Benin</option>
                                <option value="Bhutan">Bhutan</option>
                                <option value="Bolivia">Bolivia</option>
                                <option value="Bosnia and Herzegovina">
                                    Bosnia and Herzegovina
                                </option>
                                <option value="Botswana">Botswana</option>
                                <option value="Brazil">Brazil</option>
                                <option value="Brunei">Brunei</option>
                                <option value="Bulgaria">Bulgaria</option>
                                <option value="Burkina Faso">
                                    Burkina Faso
                                </option>
                                <option value="Burundi">Burundi</option>
                                <option value="Cabo Verde">Cabo Verde</option>
                                <option value="Cambodia">Cambodia</option>
                                <option value="Cameroon">Cameroon</option>
                                <option value="Canada">Canada</option>
                                <option value="Central African Republic">
                                    Central African Republic
                                </option>
                                <option value="Chad">Chad</option>
                                <option value="Chile">Chile</option>
                                <option value="China">China</option>
                                <option value="Colombia">Colombia</option>
                                <option value="Comoros">Comoros</option>
                                <option value="Congo, Democratic Republic of the">
                                    Congo, Democratic Republic of the
                                </option>
                                <option value="Congo, Republic of the">
                                    Congo, Republic of the
                                </option>
                                <option value="Costa Rica">Costa Rica</option>
                                <option value="Côte d’Ivoire">
                                    Côte d’Ivoire
                                </option>
                                <option value="Croatia">Croatia</option>
                                <option value="Cuba">Cuba</option>
                                <option value="Cyprus">Cyprus</option>
                                <option value="Czech Republic">
                                    Czech Republic
                                </option>
                                <option value="Denmark">Denmark</option>
                                <option value="Djibouti">Djibouti</option>
                                <option value="Dominica">Dominica</option>
                                <option value="Dominican Republic">
                                    Dominican Republic
                                </option>
                                <option value="East Timor (Timor-Leste)">
                                    East Timor (Timor-Leste)
                                </option>
                                <option value="Ecuador">Ecuador</option>
                                <option value="Egypt">Egypt</option>
                                <option value="El Salvador">El Salvador</option>
                                <option value="Equatorial Guinea">
                                    Equatorial Guinea
                                </option>
                                <option value="Eritrea">Eritrea</option>
                                <option value="Estonia">Estonia</option>
                                <option value="Eswatini">Eswatini</option>
                                <option value="Ethiopia">Ethiopia</option>
                                <option value="Fiji">Fiji</option>
                                <option value="Finland">Finland</option>
                                <option value="France">France</option>
                                <option value="Gabon">Gabon</option>
                                <option value="The Gambia">The Gambia</option>
                                <option value="Georgia">Georgia</option>
                                <option value="Germany">Germany</option>
                                <option value="Ghana">Ghana</option>
                                <option value="Greece">Greece</option>
                                <option value="Grenada">Grenada</option>
                                <option value="Guatemala">Guatemala</option>
                                <option value="Guinea">Guinea</option>
                                <option value="Guinea-Bissau">
                                    Guinea-Bissau
                                </option>
                                <option value="Guyana">Guyana</option>
                                <option value="Haiti">Haiti</option>
                                <option value="Honduras">Honduras</option>
                                <option value="Hungary">Hungary</option>
                                <option value="Iceland">Iceland</option>
                                <option value="India">India</option>
                                <option value="Indonesia">Indonesia</option>
                                <option value="Iran">Iran</option>
                                <option value="Iraq">Iraq</option>
                                <option value="Ireland">Ireland</option>
                                <option value="Italy">Italy</option>
                                <option value="Jamaica">Jamaica</option>
                                <option value="Japan">Japan</option>
                                <option value="Jordan">Jordan</option>
                                <option value="Kazakhstan">Kazakhstan</option>
                                <option value="Kenya">Kenya</option>
                                <option value="Kiribati">Kiribati</option>
                                <option value="Korea, North">
                                    Korea, North
                                </option>
                                <option value="Korea, South">
                                    Korea, South
                                </option>
                                <option value="Kosovo">Kosovo</option>
                                <option value="Kuwait">Kuwait</option>
                                <option value="Kyrgyzstan">Kyrgyzstan</option>
                                <option value="Laos">Laos</option>
                                <option value="Latvia">Latvia</option>
                                <option value="Lebanon">Lebanon</option>
                                <option value="Lesotho">Lesotho</option>
                                <option value="Liberia">Liberia</option>
                                <option value="Libya">Libya</option>
                                <option value="Liechtenstein">
                                    Liechtenstein
                                </option>
                                <option value="Lithuania">Lithuania</option>
                                <option value="Luxembourg">Luxembourg</option>
                                <option value="Madagascar">Madagascar</option>
                                <option value="Malawi">Malawi</option>
                                <option value="Malaysia">Malaysia</option>
                                <option value="Maldives">Maldives</option>
                                <option value="Mali">Mali</option>
                                <option value="Malta">Malta</option>
                                <option value="Marshall Islands">
                                    Marshall Islands
                                </option>
                                <option value="Mauritania">Mauritania</option>
                                <option value="Mauritius">Mauritius</option>
                                <option value="Mexico">Mexico</option>
                                <option value="Micronesia, Federated States of">
                                    Micronesia, Federated States of
                                </option>
                                <option value="Moldova">Moldova</option>
                                <option value="Monaco">Monaco</option>
                                <option value="Mongolia">Mongolia</option>
                                <option value="Montenegro">Montenegro</option>
                                <option value="Morocco">Morocco</option>
                                <option value="Mozambique">Mozambique</option>
                                <option value="Myanmar (Burma)">
                                    Myanmar (Burma)
                                </option>
                                <option value="Namibia">Namibia</option>
                                <option value="Nauru">Nauru</option>
                                <option value="Nepal">Nepal</option>
                                <option value="Netherlands">Netherlands</option>
                                <option value="New Zealand">New Zealand</option>
                                <option value="Nicaragua">Nicaragua</option>
                                <option value="Niger">Niger</option>
                                <option value="Nigeria">Nigeria</option>
                                <option value="North Macedonia">
                                    North Macedonia
                                </option>
                                <option value="Norway">Norway</option>
                                <option value="Oman">Oman</option>
                                <option value="Pakistan">Pakistan</option>
                                <option value="Palau">Palau</option>
                                <option value="Palestine">Palestine</option>
                                <option value="Panama">Panama</option>
                                <option value="Papua New Guinea">
                                    Papua New Guinea
                                </option>
                                <option value="Paraguay">Paraguay</option>
                                <option value="Peru">Peru</option>
                                <option value="Philippines">Philippines</option>
                                <option value="Poland">Poland</option>
                                <option value="Portugal">Portugal</option>
                                <option value="Qatar">Qatar</option>
                                <option value="Romania">Romania</option>
                                <option value="Russia">Russia</option>
                                <option value="Rwanda">Rwanda</option>
                                <option value="Saint Kitts and Nevis">
                                    Saint Kitts and Nevis
                                </option>
                                <option value="Saint Lucia">Saint Lucia</option>
                                <option value="Saint Vincent and the Grenadines">
                                    Saint Vincent and the Grenadines
                                </option>
                                <option value="Samoa">Samoa</option>
                                <option value="San Marino">San Marino</option>
                                <option value="Sao Tome and Principe">
                                    Sao Tome and Principe
                                </option>
                                <option value="Saudi Arabia">
                                    Saudi Arabia
                                </option>
                                <option value="Senegal">Senegal</option>
                                <option value="Serbia">Serbia</option>
                                <option value="Seychelles">Seychelles</option>
                                <option value="Sierra Leone">
                                    Sierra Leone
                                </option>
                                <option value="Singapore">Singapore</option>
                                <option value="Slovakia">Slovakia</option>
                                <option value="Slovenia">Slovenia</option>
                                <option value="Solomon Islands">
                                    Solomon Islands
                                </option>
                                <option value="Somalia">Somalia</option>
                                <option value="South Africa">
                                    South Africa
                                </option>
                                <option value="Spain">Spain</option>
                                <option value="Sri Lanka">Sri Lanka</option>
                                <option value="Sudan">Sudan</option>
                                <option value="South Sudan">South Sudan</option>
                                <option value="Suriname">Suriname</option>
                                <option value="Sweden">Sweden</option>
                                <option value="Switzerland">Switzerland</option>
                                <option value="Syria">Syria</option>
                                <option value="Taiwan">Taiwan</option>
                                <option value="Tajikistan">Tajikistan</option>
                                <option value="Tanzania">Tanzania</option>
                                <option value="Thailand">Thailand</option>
                                <option value="Togo">Togo</option>
                                <option value="Tonga">Tonga</option>
                                <option value="Trinidad and Tobago">
                                    Trinidad and Tobago
                                </option>
                                <option value="Tunisia">Tunisia</option>
                                <option value="Turkey">Turkey</option>
                                <option value="Turkmenistan">
                                    Turkmenistan
                                </option>
                                <option value="Tuvalu">Tuvalu</option>
                                <option value="Uganda">Uganda</option>
                                <option value="Ukraine">Ukraine</option>
                                <option value="United Arab Emirates">
                                    United Arab Emirates
                                </option>
                                <option value="United Kingdom">
                                    United Kingdom
                                </option>
                                <option value="United States">
                                    United States
                                </option>
                                <option value="Uruguay">Uruguay</option>
                                <option value="Uzbekistan">Uzbekistan</option>
                                <option value="Vanuatu">Vanuatu</option>
                                <option value="Vatican City">
                                    Vatican City
                                </option>
                                <option value="Venezuela">Venezuela</option>
                                <option value="Vietnam">Vietnam</option>
                                <option value="Yemen">Yemen</option>
                                <option value="Zambia">Zambia</option>
                                <option value="Zimbabwe">Zimbabwe</option>
                            </select>
                        </div>
                        <div className="detail-row">
                            <label>Language 1: </label>
                            <select
                                type="text"
                                name="language1"
                                value={language1}
                                onChange={handleChange}
                            >
                                <option value="" disabled>
                                    Select your primary language
                                </option>
                                <option value="Arabic">Arabic</option>
                                <option value="Bengali">Bengali</option>
                                <option value="Bulgarian">Bulgarian</option>
                                <option value="Chinese">Chinese</option>
                                <option value="Croatian">Croatian</option>
                                <option value="Czech">Czech</option>
                                <option value="Danish">Danish</option>
                                <option value="Dutch">Dutch</option>
                                <option value="English">English</option>
                                <option value="Estonian">Estonian</option>
                                <option value="Finnish">Finnish</option>
                                <option value="French">French</option>
                                <option value="Georgian">Georgian</option>
                                <option value="German">German</option>
                                <option value="Greek">Greek</option>
                                <option value="Hebrew">Hebrew</option>
                                <option value="Hindi">Hindi</option>
                                <option value="Hungarian">Hungarian</option>
                                <option value="Icelandic">Icelandic</option>
                                <option value="Indonesian">Indonesian</option>
                                <option value="Italian">Italian</option>
                                <option value="Japanese">Japanese</option>
                                <option value="Korean">Korean</option>
                                <option value="Latvian">Latvian</option>
                                <option value="Lithuanian">Lithuanian</option>
                                <option value="Macedonian">Macedonian</option>
                                <option value="Malay">Malay</option>
                                <option value="Maltese">Maltese</option>
                                <option value="Norwegian">Norwegian</option>
                                <option value="Polish">Polish</option>
                                <option value="Portuguese">Portuguese</option>
                                <option value="Romanian">Romanian</option>
                                <option value="Russian">Russian</option>
                                <option value="Serbian">Serbian</option>
                                <option value="Slovak">Slovak</option>
                                <option value="Slovenian">Slovenian</option>
                                <option value="Spanish">Spanish</option>
                                <option value="Swahili">Swahili</option>
                                <option value="Swedish">Swedish</option>
                                <option value="Tamil">Tamil</option>
                                <option value="Telugu">Telugu</option>
                                <option value="Thai">Thai</option>
                                <option value="Turkish">Turkish</option>
                                <option value="Ukrainian">Ukrainian</option>
                                <option value="Urdu">Urdu</option>
                                <option value="Vietnamese">Vietnamese</option>
                            </select>
                        </div>
                        <div className="detail-row">
                            <label>Language 2: </label>
                            <select
                                type="text"
                                name="language2"
                                value={language2}
                                onChange={handleChange}
                            >
                                <option value="" disabled>
                                    Select your secondary language
                                </option>
                                <option value="Arabic">Arabic</option>
                                <option value="Bengali">Bengali</option>
                                <option value="Bulgarian">Bulgarian</option>
                                <option value="Chinese">Chinese</option>
                                <option value="Croatian">Croatian</option>
                                <option value="Czech">Czech</option>
                                <option value="Danish">Danish</option>
                                <option value="Dutch">Dutch</option>
                                <option value="English">English</option>
                                <option value="Estonian">Estonian</option>
                                <option value="Finnish">Finnish</option>
                                <option value="French">French</option>
                                <option value="Georgian">Georgian</option>
                                <option value="German">German</option>
                                <option value="Greek">Greek</option>
                                <option value="Hebrew">Hebrew</option>
                                <option value="Hindi">Hindi</option>
                                <option value="Hungarian">Hungarian</option>
                                <option value="Icelandic">Icelandic</option>
                                <option value="Indonesian">Indonesian</option>
                                <option value="Italian">Italian</option>
                                <option value="Japanese">Japanese</option>
                                <option value="Korean">Korean</option>
                                <option value="Latvian">Latvian</option>
                                <option value="Lithuanian">Lithuanian</option>
                                <option value="Macedonian">Macedonian</option>
                                <option value="Malay">Malay</option>
                                <option value="Maltese">Maltese</option>
                                <option value="Norwegian">Norwegian</option>
                                <option value="Polish">Polish</option>
                                <option value="Portuguese">Portuguese</option>
                                <option value="Romanian">Romanian</option>
                                <option value="Russian">Russian</option>
                                <option value="Serbian">Serbian</option>
                                <option value="Slovak">Slovak</option>
                                <option value="Slovenian">Slovenian</option>
                                <option value="Spanish">Spanish</option>
                                <option value="Swahili">Swahili</option>
                                <option value="Swedish">Swedish</option>
                                <option value="Tamil">Tamil</option>
                                <option value="Telugu">Telugu</option>
                                <option value="Thai">Thai</option>
                                <option value="Turkish">Turkish</option>
                                <option value="Ukrainian">Ukrainian</option>
                                <option value="Urdu">Urdu</option>
                                <option value="Vietnamese">Vietnamese</option>
                            </select>
                        </div>
                    </>
                )}
                {details.map((detail) => (
                    <div className="detail-row" key={detail.detail_name}>
                        <label>{detail.detail_name}: </label>
                        <input
                            type={detail.detail_type}
                            name={detail.detail_name}
                            value={formData[detail.detail_name]}
                            onChange={handleChange}
                            required
                        />
                    </div>
                ))}
                <button type="submit">Submit</button>
                <button type="button" onClick={handleRequestClose}>
                    Cancel
                </button>
            </form>
        </Modal>
    );
}

export default PackageFormModal;
