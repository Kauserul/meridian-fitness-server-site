const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;
require('dotenv').config()

app.use(cors())
app.use(express.json())


// const uri = 'mongodb://localhost:27017'
const uri = `mongodb+srv://cookupsDbUser:KUG9o2icJfN9hrOx@cluster0.mcdvihz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const serviceCollection = client.db('cookups').collection('services')
        const reviewCollection = client.db('cookups').collection('reviews')

        app.get('/services', async(req, res) =>{
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


        // review api
        app.get('/myReview', async(req, res) =>{
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

        app.get('/review', async(req, res) =>{
            const query = {}
            const cursor = reviewCollection.find(query)
            const review = await cursor.toArray()
            res.send(review)
        })

        app.post('/review', async(req, res) =>{
            const review = req.body
            const result = await reviewCollection.insertOne(review)
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