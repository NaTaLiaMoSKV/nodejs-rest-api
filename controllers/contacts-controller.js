const { HttpError } = require('../helpers');
const { ctrlWrapper } = require('../helpers');
const { Contact } = require('../models/contact');

const getAllContacts = async (req, res, next) => {
    const { _id: owner } = req.user;
    const { page = 1, limit = 10, favorite } = req.query;
    const skip = (page - 1) * limit;
    const result = await Contact.find({ owner, favorite }, "", { skip, limit });

    res.status(200).json(result);
};

const getContactById = async (req, res, next) => {
    const { contactId } = req.params;
    const result = await Contact.findById(contactId);

    if (!result) {
        throw HttpError(404);
    }

    res.status(200).json(result);
};

const addContact = async (req, res, next) => {
    const { _id: owner } = req.user;
    const result = await Contact.create({...req.body, owner});
    res.status(201).json(result);
};

const deleteContactById = async (req, res, next) => {
    const { contactId } = req.params;
    const result = await Contact.findByIdAndRemove(contactId);

    if (!result) {
        throw HttpError(404);
    }

    res.status(200).json({
        message: 'contact deleted',
    });
};

const updateContactById = async (req, res, next) => {
    const { contactId } = req.params;
    const result = await Contact.findByIdAndUpdate(contactId, req.body, { new: true });

    if (!result) {
        throw HttpError(404, `contact with ${contactId} not found`);
    }

    res.status(200).json(result);
};

const updateStatusContact = async (req, res, next) => {
    const { contactId } = req.params;

    if (!req.body) {
        throw HttpError(400, 'missing field favorite');
    }

    const result = await Contact.findByIdAndUpdate(contactId, req.body, { new: true });

    if (!result) {
        throw HttpError(404);
    }

    res.status(200).json(result);
};

module.exports = {
    getAllContacts: ctrlWrapper(getAllContacts),
    getContactById: ctrlWrapper(getContactById),
    addContact: ctrlWrapper(addContact),
    deleteContactById: ctrlWrapper(deleteContactById),
    updateContactById: ctrlWrapper(updateContactById),
    updateStatusContact: ctrlWrapper(updateStatusContact),
}