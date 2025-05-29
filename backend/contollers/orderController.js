import Address from "../models/addressModel.js";

// Create a new address
export const createAddress = async (req, res) => {
    try {
        const address = new Address(req.body);
        const savedAddress = await address.save();
        res.status(201).json(savedAddress);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all addresses
export const getAllAddresses = async (req, res) => {
    try {
        const addresses = await Address.find();
        res.status(200).json(addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single address by ID
export const getAddressById = async (req, res) => {
    try {
        const { id } = req.params;
        const address = await Address.findById(id);
        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }
        res.status(200).json(address);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update an address by ID
export const updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedAddress = await Address.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!updatedAddress) {
            return res.status(404).json({ message: "Address not found" });
        }
        res.status(200).json(updatedAddress);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete an address by ID
export const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAddress = await Address.findByIdAndDelete(id);
        if (!deletedAddress) {
            return res.status(404).json({ message: "Address not found" });
        }
        res.status(200).json({ message: "Address deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};