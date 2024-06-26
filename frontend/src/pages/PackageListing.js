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
                Please upload the receipt for the Bantu 1-to-1 package that you
                have purchased. Once uploaded you can monitor their status in
                the service status section. After the receipt has been approved,
                you can provide the necessary details for the Bantu 1-to-1
                service. Your cooperation is much appreciated. Thank you.
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