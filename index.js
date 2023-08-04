
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




const uri = `mongodb+srv://${process.env.DB_EMAIL}:${process.env.DB_Pass}@cluster0.qw6mpdr.mongodb.net/?retryWrites=true&w=majority`;


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

        app.post("/order", async (req, res) => {


            const product = await CoursesDb.findOne({ _id: new ObjectId(req.body.productID) })


            const order = req.body

            const data = {
                total_amount: product.Fee,
                currency: 'BDT',
                tran_id: tran_id, // use unique tran_id for each api call
                success_url: `http://localhost:5000/payment/success/${tran_id}`,
                fail_url: `http://localhost:5000/payment/failed/${tran_id}`,
                cancel_url: 'http://localhost:3030/cancel',
                ipn_url: 'http://localhost:3030/ipn',
                shipping_method: 'Courier',
                product_name: order.title,
                product_category: 'Electronic',
                product_profile: 'general',
                cus_name: order.name,
                cus_email: order.email,
                cus_add1: 'Dhaka',
                cus_add2: 'Dhaka',
                cus_city: 'Dhaka',
                cus_state: 'Dhaka',
                cus_postcode: '1000',
                cus_country: 'Bangladesh',
                cus_phone: '01711111111',
                cus_fax: '01711111111',
                ship_name: 'Customer Name',
                ship_add1: 'Dhaka',
                ship_add2: 'Dhaka',
                ship_city: 'Dhaka',
                ship_state: 'Dhaka',
                ship_postcode: 1000,
                ship_country: 'Bangladesh',
            };
            const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
            sslcz.init(data).then(apiResponse => {
                // Redirect the user to payment gateway
                let GatewayPageURL = apiResponse.GatewayPageURL
                res.send({ url: GatewayPageURL });

                const finalOrder = {
                    product,
                    person: order,
                    paidStatus: false,
                    tranjectionId: tran_id
                };

                const result = Order.insertOne(finalOrder);

                console.log('Redirecting to: ', GatewayPageURL)
            });



            // this is for fail payment route 
            app.post("/payment/failed/:tranId", async (req, res) => {

                const result = await Order.deleteOne({
                    tranjectionId: req.params.tranId,

                });

                if (result.deletedCount) {
                    res.redirect(`http://localhost:5173/payment/failed/${req.params.tranId}`);
                };


                console.log(result);



            });



            app.post("/payment/success/:tranId", async (req, res) => {

                console.log(req.params.tranId)

                const result = await Order.updateOne(
                    { tranjectionId: req.params.tranId },
                    {
                        $set: {
                            paidStatus: true
                        }
                    }
                )
                if (result.modifiedCount > 0) {
                    res.redirect(`http://localhost:5173/payment/success/${req.params.tranId}`)
                }



            })


        })



        // jwt token create
        app.post('/jwt', (req, res) => {
            const data = req.body

            const token = jwt.sign(data, process.env.JWT_TOKEN, {
                expiresIn: "1d"
            })
            res.send({ token })
        })
        // ends

        // verify admin 
        const verifyAdmin = async (req, res, next) => {

            const email = req.decoded.email

            const query = { email: email }

            const userdata = await user.findOne(query)

            if (userdata?.role !== 'admin') {

                return res.status(403).send({ err: true, message: 'forbidden message' })


            }
            next()


        }


        // announcement post 
        app.post("/sociaannouncementlpost", async (req, res) => {

            const data = req.body

            const result = await announcement.insertOne(data)

            res.send(result)


        })
        // ends

        // announcement cursor 
        app.get("/cursorannouncement", async (req, res) => {

            const curosr = announcement.find()

            const result = await curosr.toArray()

            res.send(result)

        })

        // announcement cursor
        app.delete('/cursorannouncement/:id', async (req, res) => {

            const id = req.params.id

            const filter = { _id: new ObjectId(id) }

            const result = await announcement.deleteOne(filter)
            res.send(result)

        })
        // ends



        // social media main cursor

        app.get("/allpost", async (req, res) => {
            const cursor = socialdb.find().sort({ _id: -1 })

            const result = await cursor.toArray()

            res.send(result)

        })

        // show on the profile
        app.get("/personPost", verifyjwt, async (req, res) => {

            // get the email from the query.
            const email = req.query.email

            // this is check email is ase ki nai.

            if (!email) {
                res.send([])

            }

            const authorization = req.decoded.email

            // this is check the email is same or not.

            if (email !== authorization) {
                return res.status(403).send({ err: "access not valide" })
            }

            const query = { email: email }



            const result = await socialdb.find(query).sort({ _id: -1 }).toArray()

            res.send(result)
        })




        // social media post


        app.post("/socialpost", async (req, res) => {

            const data = req.body

            const result = await socialdb.insertOne(data)

            res.send(result)


        })





        // all user

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

        // all users

        app.post("/users", async (req, res) => {
            const data = req.body

            const result = await user.insertOne(data)

            res.send(result)

        })


        // user get  
        app.get('/user', verifyjwt, verifyAdmin, async (req, res) => {
            const cursor = await user.find().toArray()
            res.send(cursor)
        })
        // ends


        // admin chacking 

        app.get('/user/admin/:email', verifyjwt, async (req, res) => {

            const email = req.params.email //per user email getting

            // verify the admin email and user email same or not
            if (req.decoded.email !== email) {
                res.send({ admin: false })
            }

            const query = { email: email } // find the email
            const userdata = await user.findOne(query) // in this email 

            const result = { admin: userdata?.role === 'admin' } // sodi kono admin thake aii data tey 

            res.send(result)


        })

        // user role admin or not 

        app.patch("/user/admin/:id", async (req, res) => {

            // get the user id
            const id = req.params.id


            // filter the id
            const filter = { _id: new ObjectId(id) }


            // here is the setiing update
            const updateDoc = {
                $set: {
                    role: 'admin'
                }
            }
            // result making
            const result = await user.updateOne(filter, updateDoc)

            // sending the result
            res.send(result)

        })


        // teacher get  
        app.get('/uteacher', async (req, res) => {
            const cursor = await teachers.find().sort({ _id: -1 }).toArray()
            res.send(cursor)
        })
        // ends

        // teachers video detailes 

        app.get("/teacherDetail/:id", async (req, res) => {

            const id = req.params.id

            const filter = { _id: new ObjectId(id) }

            const result = await teachers.findOne(filter)

            res.send(result)


        })


        // teachers video detailes  ends


        // event page
        app.post('/event', async (req, res) => {
            const data = req.body


            const result = await event.insertOne(data)

            res.send(result)
        })
        // ends

        // event cursor


        // sort({ _id: -1 })

        app.get('/event', async (req, res) => {

            const cursor = await event.find().sort({ _id: -1 }).toArray()
            res.send(cursor)


        })

        // ends

        // event spasific detelse
        app.get('/event/:id', async (req, res) => {

            const id = req.params.id

            const filter = { _id: new ObjectId(id) }

            const result = await event.findOne(filter)

            res.send(result)

        })

        // event spasific detelse ends

        // event delete system

        app.delete('/eventdelete/:id', async (req, res) => {

            const id = req.params.id

            const filter = { _id: new ObjectId(id) }

            const result = await event.deleteOne(filter)

            res.send(result)

        })




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


            const filter = { _id: new ObjectId(id) }

            // make teh result
            const result = await food.findOne(filter)

            res.send(result)

        })
        // here is teh cartpost
        app.post("/carts", async (req, res) => {
            const data = req.body


            const result = await cart.insertOne(data)



            res.send(result)

        })

        // ends
        app.get("/carts", verifyjwt, async (req, res) => {

            const email = req.query.email


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


        // here is the book get method 
        app.get("/books", async (req, res) => {
            const cursor = booksdb.find()

            const result = await cursor.toArray()

            res.send(result)
        })
        // ends

        // here is the book post method 

        app.post("/booksPost", async (req, res) => {
            const bodydata = req.body

            const result = await booksdb.insertOne(bodydata)
            res.send(result)
        })


        // ends

        // bolg cursor

        app.get("/blogs", async (req, res) => {

            const curosr = blog.find()

            const result = await curosr.toArray()
            res.send(result)

        })

        // here is blg post request

        app.post("/blogpost", async (req, res) => {


            const postdata = req.body

            const result = await blog.insertOne(postdata)
            res.send(result)


        })

        // user save post

        app.post("/comment", async (req, res) => {

            const body = req.body

            const result = await comment.insertOne(body)

            res.send(result)



        })

        // user save post ends


        // this is book read page 

        app.get("/redbook/:id", async (req, res) => {

            const id = req.params.id

            const filterOneById = { _id: new ObjectId(id) }

            const result = await booksdb.findOne(filterOneById)

            res.send(result)


        })


        // this is book read page ends



        // here is the all courses functionality 

        app.get("/courses", async (req, res) => {
            const cursor = CoursesDb.find()

            const result = await cursor.toArray()

            res.send(result)
        })
        // ends

        // courses post method

        app.post("/addcourse", async (req, res) => {

            const coursedatabody = req.body;

            const result = await CoursesDb.insertOne(coursedatabody)

            res.send(result)


        })

        // courses post method ends

        // get sing course 

        app.get("/courseA/:id", async (req, res) => {

            const id = req.params.id

            const filterOneById = { _id: new ObjectId(id) }

            const result = await CoursesDb.findOne(filterOneById)

            res.send(result)


        })



        // get sing course ends 




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


