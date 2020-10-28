const db = require('_helpers/db');
const positionService = require('position/positions.server')
const BlockIo = require('block_io');
const btc_block_io = new BlockIo('c9e7-26f8-8637-6fe6');
const dgc_block_io = new BlockIo('f870-70f6-52c4-4049');
const ltc_block_io = new BlockIo('1d51-cfe4-b7e1-46a6');


module.exports = {
    withdrawCoin,
    getCoinBalance,
    getPositionCount
}

async function getCoinBalance(req, res) {
     try {
        // print the account balance
        let balance = await block_io.get_balance();
        console.log(balance);
  
        // print all addresses on this account
        let addresses = await block_io.get_my_addresses();
        console.log(addresses);
  
    } catch (error) {
        console.log("Error:", error.message);
    }
}

async function getPositionCount(req, res) {
    const id = req.params.id
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
    // withdrawal; we specify the PIN here
    var block_io;
    var address;
    const price_perposition = await positionService._getPositionPrice();
    const { amounts, id, cointype } = req.body
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

    let withdraw = await block_io.withdraw({
        pin: '2Wsxzaq16599X',
        from_labels: 'default',
        to_address: address,
        amount: price_perposition * amounts
    });
    console.log(withdraw);
    if (withdraw.status == 'success') {
        console.log('here success')
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
