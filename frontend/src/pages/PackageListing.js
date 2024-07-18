import React, { useState, useEffect } from "react";
import axios from "axios";
import PackageFormModal from "../components/PackageFormModal";

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
        <div>
            <h2>Bantu 1-to-1 Packages</h2>
            <h5 className="info-bantu">
                Welcome to the Bantu 1-to-1 Service Ticketing! To get started,
                please select the package you purchased. For a specific package,
                kindly submit your receipt along with the required details. All
                updates regarding your submitted ticket will be sent via email.
            </h5>
            {packages.map((packageItem) => (
                <div key={packageItem.id} className="package-container">
                    <div className="package-info">
                        <h4>{packageItem.title}</h4>
                        <p>{packageItem.description}</p>
                        <p>Price: RM {packageItem.price}</p>
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
