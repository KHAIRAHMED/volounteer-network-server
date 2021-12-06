// jwt token 
// import { initializeApp ,getAuth} from 'firebase-admin/app';
const { initializeApp ,getAuth } = require('firebase-admin/app');
var admin = require("firebase-admin");
var serviceAccount = require("./volounter-network-firebase-adminsdk-4abo6-d7b8e6d8a0.json");






const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

require('dotenv').config()


// mongodb 

const { MongoClient, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_PROJECT_NAME}:${process.env.DB_USER_PASS}@cluster0.pyyra.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



// initilize app 

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false })) //for from

const port = process.env.PORT || 5600


// jwt token 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})



// mongo db 

client.connect(err => {
  const productCollection = client.db("Voloundeer-Network").collection("products");
  const resisterCollection = client.db("Voloundeer-Network").collection("resister");

  // post data
  app.post("/addEvent", (req, res) => {
    const data = req.body
    productCollection.insertOne(data)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })
  // get data 


  app.get("/events", (req, res) => {
    productCollection.find()
      .toArray((err, docs) => {
        res.send(docs)
      })
  })

  // delete 

  app.delete("/delete/:id", (req, res) => {
    productCollection.deleteOne({ _id: ObjectId(req.params.id) })
      .then(res => {
        console.log(res)
      })
  })

  // find single data info 
  app.get("/event/:id", (req, res) => {
    // console.log(req.params.id);
    productCollection.find({ _id: ObjectId(req.params.id) })
      .toArray((err, doc) => {
        res.send(doc[0])
      })
  })

  // authenticate data 
  app.get("/authenticateData", (req, res) => {
    const bearer = req.headers.authorization
    const queryEmail = req.query.email
    if (bearer && bearer.startsWith("Bearer ")) {
      const idToken = bearer.split(" ")[1]
      admin.auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const jwtTokenEmail = decodedToken.email
          // console.log(jwtTokenEmail , queryEmail)
          // console.log(jwtTokenEmail === queryEmail)
          if(queryEmail === jwtTokenEmail){
            productCollection.find({email : req.query.email})
            .toArray((err , doc)=>{
              res.send(doc)
            })
          }
          else{
            res.status(401).send("Un-Authorized User")
          }
         
        })
        .catch((error) => {
          res.status(401).send("Un-Authorized User")
          console.log(error)
        });
    }
    else {
      res.status(401).send("Un-Authorized User")
    }

  })







  // resister add 

  // post data for resister from

  app.post("/resister", (req, res) => {
    console.log(req.body);

    resisterCollection.insertOne(req.body)
      .then(result => {
      })
  })

  // get data for resister from
  app.get("/resisterData", (req, res) => {
    resisterCollection.find()
      .toArray((err, docs) => {
        res.send(docs)
      })
  })

  // delete a single data from resister 
  app.delete("/delete/:id", (req, res) => {
    resisterCollection.deleteOne({ _id: ObjectId(req.params.id) })
      .then(result => {
        res.send(result.deletedCount > 0)
      })
  })

});





app.listen(port)