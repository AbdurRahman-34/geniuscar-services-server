const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const jwt = require('jsonwebtoken');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleWare use :::
app.use(cors());
app.use(express.json());


// JWt verify token check ::::
function verifyJwt (req, res, next){
  console.log('this is token', req.headers.authorization);
  const authHeader = req.headers.authorization;
  if(!authHeader){
      return res.status(403).send('unathorized')
  };
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACSESS_TOKEN_SECRET, function(err, decoded){
      if(err){
          return res.status(403).send({message: 'unautorized aceess'})
      }
      console.log(decoded)
      req.decoded = decoded;
      next();
  })
}


// Database connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ixd0oqi.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});


async function run(){

  try{

    await client.connect();
    const serviceCollection = client.db('geniusCar').collection('service');
    const orderCollection = client.db('geniusCar').collection('order')
    

    // Auth / JWT
   app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
    })





    //Servicess API:::::::
    app.get('/service', async(req, res) => {
      const query = {}
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services)
    });

   app.get('/service/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const service = await serviceCollection.findOne(query);
      res.send(service)
   })


   // Post publish data
   app.post('/service', async(req, res) => {
    const newService = req.body;
     const result = await serviceCollection.insertOne(newService)
     res.send(result)
   })


   // Delete 
   app.delete('/service/:id', async(req, res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)};
    const result = await serviceCollection.deleteOne(query)
    res.send(result)
   })




   // order Collection Api :::
    app.get('/order', verifyJwt, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = orderCollection.find(query);
                const orders = await cursor.toArray();
                res.send(orders);
            }
            else{
                res.status(403).send({message: 'forbidden access'})
            }
        })


   app.post('/order', async(req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order)
      res.send(result)
   })

  }
  finally{

  }
}

run().catch(console.dir)





app.get("/", (req, res) => {
  res.send("Runing Genius Car Server.................!!");
});

app.listen(port, () => {
  console.log("Port Number, : ", port);
});
