
const express = require('express');

const app = express(express)

const port = process.env.POST || 5000

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const cors = require("cors")

app.use(cors())

app.use(express.json())

require("dotenv").config()

// payment related work

const SSLCommerzPayment = require('sslcommerz-lts')




const uri = "mongodb+srv://mkdir:mahedi777@cluster0.0co3h.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


// jwt require

const jwt = require("jsonwebtoken") // require the jwt 



// jwt verify  

function verifyjwt(req, res, next) {

    // form the client side 
    const authorization = req.headers.authorization
    console.log({ Authorization: authorization });
    // check the authorization here or not 
    if (!authorization) {
        return res.status(401).send({ err: "access denied" })
    }

    // split the token 
    const token = authorization.split(' ')[1]

    // verify the token token is valide or not 
    jwt.verify(token, process.env.JWT_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ err: "access not valid" })
        }

        // here is the email form the clint side 
        req.decoded = decoded

        // then go to the next step 
        next()
    })



}

// endsn of jwt       




// database





// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});



const store_id = process.env.S_ID;


const store_passwd = process.env.P_ID;


const is_live = false //true for live, false for sandbox


async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)

        // await client.connect();

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
        // All users 
        const user = client.db("Alluser").collection("user")

        // social all posts
        const socialdb = client.db("socialPostes").collection("postdata")
        // announcement related db
        const announcement = client.db("announcementdb").collection("announcement")

        // all databases ends

        const booksdb = client.db("booksdb").collection("booksdb")

        const blog = client.db("blogdb").collection("blog")

        // user save post data
        const comment = client.db("comment").collection("comment")

        // courses database

        const CoursesDb = client.db("courses").collection("course")
        // order
        const Order = client.db("Order").collection("Orderf")


        // order get ;

        const tran_id = new ObjectId().toString(); // for genarate new id 



        app.post('/payment/success/:tranId', async (req, res) => {
            const { name, phone } = req.body;
            const { tranId } = req.params;

            if (!name || !phone || !tranId) {
                return res.status(400).json({ message: 'All fields are required.' });
            }

            try {
                const result = await Order.insertOne({
                    name,
                    phone,
                    transactionId: tranId,
                    createdAt: new Date()
                });

                if (result.acknowledged) {
                    console.log('Order Inserted:', result);
                    res.status(200).json({ message: 'Payment successful!' });
                } else {
                    res.status(500).json({ message: 'Failed to process payment.' });
                }
            } catch (error) {
                console.error('Error inserting order:', error);
                res.status(500).json({ message: 'Server error.' });
            }
        });




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


