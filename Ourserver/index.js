const express = require('express');

const app = express();


app.use(express.json());

const axios = require('axios');




axios.get("http://185.211.4.99:3000/tablelist").then((res)=>{
    console.log(res.data,"resss")

})



axios.get("http://185.211.4.99:3000/tabledata/teen42").then((res)=>{
    console.log(res.data,"resss")

})








app.listen(6000,() => {console.log("listinng port 6000")})