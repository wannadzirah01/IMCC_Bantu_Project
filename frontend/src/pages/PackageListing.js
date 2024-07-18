import React, { useState, useEffect } from "react";
import axios from "axios";
import PackageFormModal from "../components/PackageFormModal";
import "../PackageList.css"; // Ensure the path is correct

function PackageList() {
    const [packages, setPackages] = useState([]);
    const [selectedPackageId, setSelectedPackageId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:5000/packageListing",
                    { withCredentials: true }
                );
                setPackages(response.data);
            } catch (error) {
                console.error("Error fetching packages:", error);
            }
        };

        fetchPackages();
    }, []);

    const handleTicket = (packageId) => {
        setSelectedPackageId(packageId);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPackageId(null);
    };

    return (
        <div className="container">
            <h2>Bantu 1-to-1 Packages</h2>
            <h5 className="info-bantu">
                <p>
                    Welcome to Bantu 1-to-1 Service Ticketing! To get started,
                    please select the package you wish to subscribe to. For each
                    package, kindly submit the required details to complete your
                    registration. We will keep you updated via email regarding
                    your ticket, so please make sure to check your inbox
                    regularly. Your cooperation is essential for ensuring a
                    smooth and timely delivery of our Bantu 1-to-1 service.
                    Thank you for choosing us!
                </p>
            </h5>

            {packages.map((packageItem) => (
                <div key={packageItem.id} className="package-container">
                    <div className="package-info">
                        <h4>{packageItem.title}</h4>
                        <p>{packageItem.description}</p>
                        <p className="price">Price: RM {packageItem.price}</p>
                    </div>
                    <div className="button-container">
                        <button onClick={() => handleTicket(packageItem.id)}>
                            Package Form
                        </button>
                    </div>
                </div>
            ))}
            <PackageFormModal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                packageId={selectedPackageId}
            />
        </div>
    );
}

export default PackageList;
