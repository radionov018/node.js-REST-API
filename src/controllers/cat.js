const { v4: uuid } = require("uuid");
const { errorsHandler } = require("../utils/errorsHandler");
const catModel = require("../models/cat");
const userModel = require("../models/user");
const { parseJsonBody } = require("../utils/jsonHelpers");
const { createCache } = require("../utils/cache");

const cache = createCache();

exports.getCats = async (res) => {
  const { cats } = await catModel.fetchAllCats();

  if (!cats.length) {
    return errorsHandler(res);
  }

  return cats;
};

exports.getCatById = async (res, catId) => {
  const cat = await cache(catId, catModel.fetchCatById, res);

  if (!cat) {
    return errorsHandler(res);
  }

  return cat;
};

exports.createCat = async (req, res) => {
  const catData = await parseJsonBody(req);

  if (catData.ownerId) {
    const usersDb = await userModel.fetchAllUsers();
    const userIndex = usersDb.users.findIndex(
      (user) => user.id === catData.ownerId
    );

    if (userIndex === -1) {
      return errorsHandler(res);
    }
  }

  catData.id = uuid();
  await catModel.addNewCat(catData);

  return { catData };
};

exports.updateCatById = async (req, res, catId) => {
  const updateData = await parseJsonBody(req);

  if (updateData.ownerId) {
    const usersDb = await userModel.fetchAllUsers();
    const userIndex = usersDb.users.findIndex(
      (user) => user.id === updateData.ownerId
    );

    if (userIndex === -1) {
      return errorsHandler(res);
    }
  }

  const cat = await catModel.fetchCatById(catId);
  const updatedCat = { ...cat, ...updateData };
  const updateResult = await catModel.update(updatedCat);

  if (!updateResult) {
    return errorsHandler(res);
  }

  return updatedCat;
};

exports.deleteCatById = async (res, catId) => {
  const updateResult = await catModel.delete(catId);

  if (!updateResult) {
    return errorsHandler(res);
  }

  return { id: catId };
};
