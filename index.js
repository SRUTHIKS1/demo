require('dotenv').config()
const express=require('express')
const cors=require('cors')
const router=require('./Routes/route')



const app=express()
require('./database/connection')
const PORT=3000;

app.use('/uploads',express.static("uploads"))
app.use("/uploadsAds", express.static("uploadsAds"));

app.use(express.json());
app.use(cors())
app.use(router)
// or whatever your route file is


app.post('/post', (req, res)=>{
    
    console.log("data",req.body) 
    const name=req.body.name
    res.status(200)
    res.send(`Welcome ${name}`)
})
// app.post("/login", (req, res) => {
//     console.log("inside login controler")
//     const user = req.body;
//     console.log("Received user data:", user);
//     res.status(200).send("Value received");
// });



app.get('/get', (req, res)=>{
    res.status(200);
    res.send("Welcome to root URL of Server");
});
app.post('/add',(req,res)=>{
    const x=req.body.a
    const y=req.body.b
    const sum=x+y
    console.log(sum)
    res.status(200)
    res.send("Sum of the number")
})


app.listen(PORT,(error)=>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port "+ PORT)
    else 
        console.log("Error occurred, server can't start", error);
    }
);

