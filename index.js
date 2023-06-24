const express = require('express');

const app = express(express)

const port = process.env.POST || 5000


const cors = require("cors")

app.use(cors())

app.use(express.json())

require("dotenv").config()

// jwt require

const jwt = require("jsonwebtoken") // require the jwt 



// jwt verify  

function verifyjwt(req, res, next) {

    // form the client side 
    const authorization = req.headers.authorization
    // check the authorization here or not 
    if (!authorization) {
        return res.status(401).send({ err: "accesss denied" })
    }

    // split the token 
    const token = authorization.split(' ')[1]

    // verify the token token is valide or not 
    jwt.verify(token, process.env.JWT_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ err: "access not valide" })
        }

        // here is the email form the clint side 
        req.decoded = decoded

        // then go to the next step 
        next()
    })



}

// endsn of jwt 




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

        // all databases
        const classes = client.db("classes").collection("class")

        // teachers db
        const teachers = client.db("teacherspack").collection("class")

        // event db
        const event = client.db("events").collection("event")

        // food collection
        const food = client.db("foods").collection("food")

        // user cart collection
        const cart = client.db("carts").collection("cart")

        // all databases ends


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
        app.get("/carts", verifyjwt, async (req, res) => {

            const email = req.query.email
            // console.log(email);

            if (!email) {
                res.send([])

            }

            const authorization = req.decoded.email

            if (email !== authorization) {
                return res.status(403).send({ err: "access not valide" })
            }


            const query = { email: email }

            const result = await cart.find(query).toArray()

            res.send(result)
        })
        // here is teh cart system

        // delete method to delete added cart item
        app.delete('/cartDelete/:id', async (req, res) => {
            const id = req.params.id

            const filter = { _id: new ObjectId(id) }

            const result = await cart.deleteOne(filter)

            // here we pass the result
            res.send(result)

        })
        // delete method to delete added cart item ends



        // jwt token create
        app.post('/jwt', (req, res) => {
            const data = req.body

            const token = jwt.sign(data, process.env.JWT_TOKEN, {
                expiresIn: "1d"
            })
            res.send({ token })
        })
        // ends


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


