const express = require('express');

const app = express(express)

const port = process.env.POST || 5000


const cors = require("cors")

app.use(cors())

app.use(express.json())

require("dotenv").config()



// database

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_EMAIL}:${process.env.DB_PASS}@cluster0.qw6mpdr.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const classes = client.db("classes").collection("class")


        // here is the cursor for the classes for show

        app.get('/class', async (req, res) => {
            const cursor = await classes.find().toArray()
            res.send(cursor)
        })

        // here is the cursor for the classes for show ends


        // here is teh post method of teh classes
        app.post("/class", async (req, res) => {
            const data = req.body

            const result = await classes.insertOne(data)

            res.send(result)

        })
        // ends


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log(" school client is connected Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

// database ends




// here is the server basic response
app.get('/', (req, res) => {
    res.send("server is running")
})

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
})


