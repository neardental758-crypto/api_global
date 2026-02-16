const costomHeader = (req, res, next) => {
    try {
        const apikey = req.headers.api_key;
        if (apikey === 'prueba') {
            next();
        }else{
            res.status(403)
            res.send({ errors : "la api key no son iguales"});
        }
    } catch (error) {
        res.status(403)
        res.send({ errors : "Algo_malo_sucidio_con_el_customheader"})
    }
    
}

module.exports = costomHeader;