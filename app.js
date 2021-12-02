const http = require("http");
const util = require('util')
const url = require('url');
const request = require("request");

const hostname = "127.0.0.1";

    const server = http.createServer(async (req, res) => {

    const requestPromise = util.promisify(request);
    const queryObject = url.parse(req.url,true)

    if (req.method === "GET" && queryObject.pathname === "/items/") {
        const {id, tradable} = queryObject.query

        const response = await requestPromise(`https://steamcommunity.com/inventory/${id}/730/2?l=en`);

        if (response.body === 'null'){
            res.writeHead(404, { 'Content-Type': 'application/text' });
            res.write( "NOT FOUND" );
            res.end();
        }

        const {descriptions} = JSON.parse(response.body)

        let items = descriptions.map(item =>{
            return {
                market_hash_name:  item.market_hash_name,
                tradable: item.tradable
            }
        })
        .sort((a, b) => (a.market_hash_name > b.market_hash_name ) ? 1 : ((b.market_hash_name > a.market_hash_name ) ? -1 : 0));

        if(tradable === 'true')  items = items.filter(item => !!item.tradable)

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write( JSON.stringify(items) );
        res.end();
        } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.write( JSON.stringify({ err: "NOT FOUND" }) );
        res.end();
        }
    });

    server.listen(4002, hostname, () => {
        console.log("Server start");
    });
