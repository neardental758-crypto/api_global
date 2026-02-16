const { storageModels } = require('../models')
const PUBLIC_URL = process.env.PUBLIC_URL;
const getItems = async (req, res) => {
    const data = await storageModels.find({});
    //const data = ["hola ", "mundillo"];

    res.send({data});
};

const getItem = async (req, res) => {

};

const createItem = async (req, res) => {
    const { body, file } = req
    const fileData = {
        filename: file.filename,
        url: `${PUBLIC_URL}/${file.filename}`
    }
    const data = await storageModels.create(file)
    res.send({data})
};

const updateItem = (req, res) => {};
const deleteItem = (req, res) => {};

module.exports = {
    getItems, getItem, createItem, updateItem, deleteItem
}
