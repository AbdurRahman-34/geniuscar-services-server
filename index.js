const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleWare use :::
app.use(cors());
app.use(express.json());



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
