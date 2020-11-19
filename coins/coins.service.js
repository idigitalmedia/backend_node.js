const db = require('_helpers/db');
const positionService = require('position/positions.server')
const BlockIo = require('block_io');
const btc_block_io = new BlockIo('c9e7-26f8-8637-6fe6');
const doge_block_io = new BlockIo('f870-70f6-52c4-4049');
const ltc_block_io = new BlockIo('1d51-cfe4-b7e1-46a6');
const QRCode = require('qrcode');
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey("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");

module.exports = {
    withdrawCoin,
    getCoinBalance,
    getPositionCount,
    genQrCode,
    notificationStatus,
    getPaymentStatus,
}

async function getPaymentStatus(req, res) {

    const user_id = req.body.user_id;
    console.log('user id', user_id);
    var positionInfo = await db.Position.findAll({
        where: {
            user_id: user_id
        }
    });

    if (positionInfo != undefined) {
        res.status(200).send(positionInfo);
        return;
    }

    res.status(400).send('Payment not paid');
}
async function notificationStatus(req, res) {
    var confirmed_number;
    var coin_api;

    res.status(200).send('success');
    console.log('notification data', req.body.data);

    if (req.body.data) {

        const {
            network,
            address,
            balance_change,
            amount_received,
            txid,
            confirmations
        } = req.body.data;

        switch (network) {
            case 'BTC':
                coin_api = btc_block_io;
                break;
            case 'DOGE':
                coin_api = doge_block_io;
                break;
            case 'LTC':
                coin_api = ltc_block_io;
                break;
        }
        const positionInfo = await db.BuyPosition.findOne({
            where: {
                coin_address: address
            }
        });

        if (balance_change != 0 && confirmations == 0) {
            await db.Position.create({
                user_id: positionInfo.user_id,
                position_count: positionInfo.position_count,
                coin_type: network,
                coin_address: address,
                coin_amount: positionInfo.coin_amount,
                confirmation_number: confirmations,
                coin_balance: balance_change,
                txid: txid,
            });
        } else if (confirmations != 0) {
            await db.Position.update({
                confirmation_number: confirmations
            }, {
                where: {
                    txid: txid
                }
            });
            // if (confirmations == 3 || confirmations == 5 || confirmations == 10) {
            //     setTimeout(async () => {
            //         await db.Position.delete({ txid: txid });
            //     }, 15000);
            // }
            if (confirmations == 3 || confirmations == 10 || confirmations == 5) {
                setTimeout(async () => {
                    await db.Position.update({
                        confirmation_number: confirmations + 1
                    }, {
                        where: {
                            txid: txid
                        }
                    });
                }, 15000);
                const paymentInfo = await db.Position.findAll({
                    where: {
                        coin_address: address
                    }
                });
                var sum = 0;
                for (var i = 0; i < paymentInfo.length; i++) {
                    sum += paymentInfo[i].dataValues.coin_balance;
                }
                console.log('sum, coin amount', sum, positionInfo.coin_amount);
                if (sum < positionInfo.coin_amount) {
                    var calcDif = positionInfo.coin_amount - sum;
                    console.log('calc dif', calcDif);
                    const user = await db.User.findByPk(positionInfo.user_id);
                    const username = user.username;
                    if (!user) throw 'User not found';
                    const emailTemplate = {
                        subject: "Please confirm your Email account",
                        html: `
                        <p>Hello ${username},</p>
                        <p>Buying position failed</p>
                        <div>
                        <strong>wallet address: ${address}</strong>
                        <strong>you need to pay ${calcDif} more</strong>
                        </div>`,
                        from: "system@share2riches.com",
                        to: username
                    };
                    const sendEmail = async () => {
                        try {
                            console.log('email template', emailTemplate);
                            const info = await sgMail.send(emailTemplate);
                            // const info = await transporter.sendMail(emailTemplate);
                            console.log("email sent", emailTemplate);
                            return res.status(200).send("Email sent");
                        } catch (err) {
                            console.log(err);
                            return res.status(500).send("Email sending error");
                        };
                    };
                    sendEmail();
                } else if (sum >= positionInfo.coin_amount) {
                    const positionprice = await db.Admin.findOne({
                        where: {
                            id: 1
                        }
                    });
                    const positionInfo = await db.BuyPosition.findOne({
                        where: {
                            coin_address: address
                        }
                    });
                    var funds = positionInfo.position_count * positionprice.position_price;
                    for (var i = 1; i <= positionInfo.position_count; i++) {
                        await ApprovedPositionFunds.create({
                            user_id: positionInfo.user_id,
                            funds: positionprice.position_price * ((100 - positionInfo.to_admin - positionInfo.to_affiliates)/100)          
                        })
                    }
                    await db.Funds.create({
                        user_id: positionInfo.user_id,
                        admin_funds: funds * (positionInfo.to_admin / 100),
                        affiliates_funds: funds * (positionInfo.to_affiliates / 100),
                        rest_funds: funds * (1 - (positionInfo.to_admin / 100) - (positionInfo.to_affiliates / 100)),
                        position_counts: positionInfo.position_count
                    });
                }
            }
        } else {
            return;
        }
    }
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
    const {
        amounts,
        cointype,
        id
    } = req.body;
    var coin_api;
    var coin_address;
    var coin_amount;
    var position_price;
    console.log(price_perposition);

    switch (cointype) {
        case 'btc':
            position_price = price_perposition.btc_price;
            coin_address = await btc_block_io.get_new_address();
            coin_api = btc_block_io;
            break;
        case 'doge':
            position_price = price_perposition.doge_price;
            coin_address = await doge_block_io.get_new_address();
            coin_api = doge_block_io;
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
    const buyPosition = await db.BuyPosition.create({
        user_id: id,
        position_count: amounts,
        coin_type: cointype,
        coin_address: coin_address,
        coin_amount: coin_amount,
    });
    console.log('buy position', buyPosition);
    coin_api.create_notification({
        type: 'address',
        address: coin_address,
        url: 'http://share2riches.com:4000/coins/notification'
    });
}
async function getPositionCount(req, res) {
    const id = req.params.id;
    const position = await db.Position.findAll({
        where: {
            user_id: id
        }
    })
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
    const {
        amounts,
        id,
        cointype
    } = req.body;
    console.log(price_perposition.btc_price);
    switch (cointype) {
        case 'btc':
            block_io = btc_block_io;
            address = '37zuyXgebg3qjvXL38UhjZrng8aeMn3yYq';
            price_perposition = price_perposition.btc_price;
            break;
        case 'doge':
            block_io = doge_block_io;
            address = '9yLLgL8gX2Ve3vWcUuXLp3M27YxkBb1g9z';
            price_perposition = price_perposition.doge_price;
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
        await db.Position.create({
            user_id: id,
            position_count: amounts,
            coin_type: cointype
        })
        const position = await db.Position.findAll({
            where: {
                user_id: id
            }
        })
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