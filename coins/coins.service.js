const db = require('_helpers/db');
const positionService = require('position/positions.server')
const BlockIo = require('block_io');
const btc_block_io = new BlockIo('c9e7-26f8-8637-6fe6');
const dgc_block_io = new BlockIo('f870-70f6-52c4-4049');
const ltc_block_io = new BlockIo('1d51-cfe4-b7e1-46a6');
const QRCode = require('qrcode');

module.exports = {
    withdrawCoin,
    getCoinBalance,
    getPositionCount,
    genQrCode
}

async function getCoinBalance(req, res) {
    try {
        let balance = await block_io.get_balance();
        console.log(balance);

        let addresses = await block_io.get_my_addresses();
        console.log(addresses);
    } catch (error) {
        console.log("Error:", error.message);
    };
}

async function genQrCode(req, res) {
    var price_perposition = await positionService._getPositionPrice();
    var position_price;
    var coin_amount;
    const { amounts, cointype, id } = req.body;
    var coin_address;
    console.log(price_perposition);
    var coin_api;
    switch (cointype) {
        case 'btc':
            position_price = price_perposition.btc_price;
            coin_address = await btc_block_io.get_new_address();
            coin_api = btc_block_io;
            break;
        case 'dgc':
            position_price = price_perposition.dgc_price;
            coin_address = await dgc_block_io.get_new_address();
            coin_api = dgc_block_io;
            console.log(coin_address);
            break;
        case 'ltc':
            position_price = price_perposition.ltc_price;
            coin_address = await ltc_block_io.get_new_address();
            coin_api = ltc_block_io;
            break;
    };
    coin_address = coin_address.data.address;
    console.log('coin address', coin_address);
    console.log('price_per', position_price);
    coin_amount = position_price * amounts;
    const coin_data = cointype + ':' + coin_address + '?' + 'amount=' + coin_amount;
    console.log(coin_data);
    QRCode.toDataURL(coin_data, async (err, dataURL) => {
        const data = {
            "dataUrl": dataURL.toString(),
            "cointype": cointype,
            "coinaddress": coin_address,
            "amount": coin_amount,
            "data": coin_data,
        };
        console.log(data);
        res.status(200).send(data);
    });
    var expired_count = 0;
    var x = setInterval(async () => {
        var coin_balance = await coin_api.get_address_balance({ address: coin_address });
        console.log('coin_balance', coin_balance);
        console.log('balance', coin_balance.data.pending_received_balance);
        console.log('coin_amount', coin_amount);
        if (coin_balance.data.pending_received_balance >= coin_amount) {
            await db.Position.create({ user_id: id, position_count: amounts, coin_type: cointype, coin_address: coin_address, coin_amount: coin_amount });
            clearInterval(x);
        };
        expired_count++;
        console.log('expired count', expired_count);
        if (expired_count >= 96) {
            expired_count == 0;
            coin_api.archive_addresses({ address: coin_address });
        };
    }, 900000);
}
async function getPositionCount(req, res) {
    const id = req.params.id;
    const position = await db.Position.findAll(
        { where: { user_id: id } }
    )
    var total_amount = 0;
    position.forEach(function (obj) {
        total_amount += obj.position_count;
        console.log(obj.position_count);
    });
    console.log(total_amount);
    return res.status(200).send(total_amount.toString());
}
async function withdrawCoin(req, res) {
    var block_io;
    var address;
    var price_perposition = await positionService._getPositionPrice();
    const { amounts, id, cointype } = req.body;
    console.log(price_perposition.btc_price);
    switch (cointype) {
        case 'btc':
            block_io = btc_block_io;
            address = '37zuyXgebg3qjvXL38UhjZrng8aeMn3yYq';
            price_perposition = price_perposition.btc_price;
            break;
        case 'dgc':
            block_io = dgc_block_io;
            address = '9yLLgL8gX2Ve3vWcUuXLp3M27YxkBb1g9z';
            price_perposition = price_perposition.dgc_price;
            break;
        case 'ltc':
            block_io = ltc_block_io;
            address = 'MAXqPvsqMgZZBiN4cRVGGSxhkjPoEKuLPg';
            price_perposition = price_perposition.ltc_price;
            break;
    }
    console.log('amount', price_perposition, amounts);
    let withdraw = await block_io.withdraw({
        pin: '2Wsxzaq16599X',
        from_labels: 'default',
        to_address: address,
        amount: price_perposition * amounts,
    });
    console.log(withdraw);
    if (withdraw.status == 'success') {
        console.log('here success');
        await db.Position.create({ user_id: id, position_count: amounts, coin_type: cointype })
        const position = await db.Position.findAll(
            { where: { user_id: id } }
        )
        var total_amount = 0;
        position.forEach(function (obj) {
            total_amount += obj.position_count;
            console.log(obj.position_count);
        });
        console.log(total_amount);
        return res.status(200).send(total_amount.toString());
    } else {
        return res.status(400).send('failed');
    }
}
