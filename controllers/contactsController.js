const contactsService = require('../models/contacts')
const { HttpError } = require('../helpers');
const Joi = require('joi');
const { ctrlWrapper } = require('../decorators')

const addSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
})


const getAllContacts = async (req, res, next) => {
    const result = await contactsService.listContacts();
    res.status(200).json(result);
};

const getContactById = async (req, res, next) => {
    const { contactId } = req.params;
    const result = await contactsService.getContactById(contactId);

    if (!result) {
        throw HttpError(404);
    }

    res.status(200).json(result);
};

const addContact = async (req, res, next) => {
    if (!('name' in req.body && 'email' in req.body && 'phone' in req.body)) {
        throw HttpError(400, 'Missing required name field');
    }

    const { error } = addSchema.validate(req.body);

    if (error) {
        throw HttpError(400, error.message);
    }

    const result = await contactsService.addContact(req.body);
    res.status(201).json(result);
};

const deleteContactById = async (req, res, next) => {
    const { contactId } = req.params;
    const result = await contactsService.removeContact(contactId);

    if (!result) {
        throw HttpError(404);
    }
    
    res.status(200).json({
        message: 'Contact deleted',
    });
};

const updateContactById = async (req, res, next) => {
    const { contactId } = req.params;
    const { error } = addSchema.validate(req.body);

    if (error) {
        throw HttpError(400, error.message);
    }

    const result = await contactsService.updateContact(contactId, req.body);

    if (!result) {
        throw HttpError(404, `Movie with ${contactId} not found`);
    }

    res.json(result);
};

module.exports = {
    getAllContacts: ctrlWrapper(getAllContacts),
    getContactById: ctrlWrapper(getContactById),
    addContact: ctrlWrapper(addContact),
    deleteContactById: ctrlWrapper(deleteContactById),
    updateContactById: ctrlWrapper(updateContactById),
}