const db = require('_helpers/db');
const userService = require('users/user.service');

module.exports = {
    _getPositionPrice,
    getPositionPrice,
    updatePositionPrice,
}

async function _getPositionPrice(req, res) {
    const positionprice = await db.Admin.findOne({ where: { id: 1 } });
    const price = positionprice.position_price;
    const convert_coin = {
        origin_price: price,
        btc_price: price * 0.000072,
        dgc_price: price * 350.39,
        ltc_price: price * 0.017
    }
    return convert_coin;
}

async function getPositionPrice(req, res) {
    const price_perposition = await _getPositionPrice();
    return res.send(price_perposition);
    // return res.status(200).send(price_perposition);
}

async function updatePositionPrice(req, res) {
    const position_price = req.params.price;
    console.log('req uesr', req.user.id)
    if (req.user.id == 1) {
        await db.Admin.update({ position_price: position_price }, { where: { id: 1 } });
        return res.send(position_price.toString());
    } else {
        return res.status(400).send('update failed');
    }
}