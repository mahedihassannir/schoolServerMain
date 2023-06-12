const express = require('express');

const app = express(express)

const port = process.env.POST || 5000


const cors = require("cors")

app.use(cors())

app.use(express.json())

require("dotenv").config()



// database

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

        const teachers = client.db("teacherspack").collection("class")

        const event = client.db("events").collection("event")

        const food = client.db("foods").collection("food")
        const cart = client.db("carts").collection("cart")

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


        // teachers section 

        app.post("/teacher", async (req, res) => {
            const data = req.body

            const result = await teachers.insertOne(data)

            res.send(result)

        })

        // ends

        // teacher get  
        app.get('/uteacher', async (req, res) => {
            const cursor = await teachers.find().toArray()
            res.send(cursor)
        })
        // ends


        // event page
        app.post('/event', async (req, res) => {
            const data = req.body
            console.log(data);

            const result = await event.insertOne(data)

            res.send(result)
        })
        // ends

        // event cursor

        app.get('/event', async (req, res) => {

            const cursor = await event.find().toArray()
            res.send(cursor)


        })

        // ends

        // food part
        app.post("/food", async (req, res) => {
            const data = req.body

            const result = await food.insertOne(data)

            res.send(result)
        })
        // ends

        // food cursor and valide user can access tehre data
        app.get("/food", async (req, res) => {

            const cursor = food.find()

            const result = await cursor.toArray()
            
            res.send(result)

        })
        // ends

        // this is the food route pages 
        app.get('/foodDeTailes/:id', async (req, res) => {
            const id = req.params.id
            console.log(id);

            const filter = { _id: new ObjectId(id) }

            // make teh result
            const result = await food.findOne(filter)

            res.send(result)

        })
        // here is teh cartpost
        app.post("/carts", async (req, res) => {
            const data = req.body
            console.log(data);

            const result = await cart.insertOne(data)



            res.send(result)

        })

        // ends
        app.get("/carts", async (req, res) => {

            const email = req.query.email
            console.log(email);

            if (!email) {
                res.send([])

            }
            const query = { email: email }

            const result = await cart.find(query).toArray()

            res.send(result)
        })
        // here is teh cart system


        // here is the end of teh req and respones and teh end of apis 

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


