const httpError = (res, message= 'algo salio mal' , code=500)=>{
    res.status(code);
    res.send(message);
}

module.exports = { httpError }