const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;
require('dotenv').config()

app.use(cors())
app.use(express.json())


// const uri = 'mongodb://localhost:27017'
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.mcdvihz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function veryflyJWT(req, res, next){
    const authHeader = req.headers.authorization
    
    if(!authHeader){
        return res.status(401).send({message : "unauthorized access"})
    }

    const token = authHeader.split(' ')[1]

    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
        if(err){
            return res.status(403).send({message : "Forbidden access"})
        }
        req.decoded = decoded
        next()
    })
}

async function run(){
    try{
        const serviceCollection = client.db('cookups').collection('services')
        const reviewCollection = client.db('cookups').collection('reviews')

        app.post('/jwt', async(req, res) =>{
            const user = req.body;
            const token= jwt.sign(user, process.env.ACCESS_TOKEN, {expiresIn : '1d'})
            res.send({token})
        })

        app.get('/services', async(req, res) =>{
            const query = {}
            const cursor = serviceCollection.find(query)
            const result = await cursor.limit(3).toArray()
            res.send(result)
        })

        app.get('/servicesAll', async(req, res) =>{
            const query = {}
            const cursor = serviceCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/services/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id : ObjectId(id)}
            const service = await serviceCollection.findOne(query)
            res.send(service)
        })

        app.post('/services', async(req, res) =>{
            const food = req.body
            // console.log(food)
            const result = await serviceCollection.insertOne(food)
            res.send(result)
        })


        // review api
        app.get('/myReview', veryflyJWT, async(req, res) =>{
            const decoded = req.decoded
            if(decoded.email !== req.query.email){
                return res.status(401).send({message : "unauthorized access"})
            }
            let query = {}
            if(req.query.email){
                query = {
                    email : req.query.email
                }
            }
            const cursor = reviewCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)

        })

        app.get('/review/:id', async(req, res) =>{
            const id = req.params.id
            // console.log(id)
            const query = {serviceId :(id)}
            const cursor = reviewCollection.find(query)
            const review = await cursor.toArray()
            res.send(review)
        })

        app.post('/review', async(req, res) =>{
            const review = req.body
            const result = await reviewCollection.insertOne(review)
            res.send(result)
        })

        app.delete('/review/:id', async(req,res) =>{
            const id = req.params.id
            // console.log(id)
            const query = {_id : ObjectId(id)}
            const result = await reviewCollection.deleteOne(query)
            res.send(result)
        })


    }
    finally{

    }
}

run().catch(console.dir)


app.get('/', (req, res) =>{
    res.send('API Running...')
})

app.listen(port, () =>{
    console.log(`server running on port ${port}`)
})