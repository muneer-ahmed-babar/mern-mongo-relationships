const mongoose = require("mongoose");
const {Schema} = mongoose;

main()
  .then(() => console.log("connection successful"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/relationDemo");
}

const orderSchema = new Schema({
  item: String,
  price: Number,
});

//   But orders doesn't hold full order details — it holds a list of IDs,
//   each one pointing to a document in the Order collection (ref: "Order" tells Mongoose where to look).
//   This is the "reference" style relationship, like a foreign key in SQL.
const customerSchema = new Schema({
  name: String,
  orders: [
    {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
});

// customerSchema.pre("findOneAndDelete", async () => {
//   console.log("PRE MIDDLEWARE");
// });

// After a customer is deleted, automatically delete all their linked orders too
// (cascade delete) — otherwise those orders would be left orphaned in the DB
customerSchema.post("findOneAndDelete", async (customer) => {
  if (customer.orders.length) {
    let res = await Order.deleteMany({ _id: { $in: customer.orders } });
    console.log(res);
  }
});

const Order = mongoose.model("Order", orderSchema);
const Customer = mongoose.model("Customer", customerSchema);

// Fetch the first customer in the collection and replace their order IDs
// with the full order documents (item, price) using populate
const findCustomer = async () => {
  let result = await Customer.find({}).populate("orders");
  console.log(result[0]);
};

findCustomer();

// Create a new customer along with one new order, and link them together
const addCust = async () => {
  let newCust = new Customer({
    name: "Areesha Javed",
  });

  let newOrder = new Order({
    item: "Lollipop",
    price: 50,
  });

  newCust.orders.push(newOrder);

  await newOrder.save();
  await newCust.save();

  console.log("added new customer");
};

// Delete a specific customer by ID — the post middleware above will
// automatically clean up all of their linked orders too (cascade deletion)
const delCust = async () => {
  let data = await Customer.findOneAndDelete({ _id: "6aa266efc2edee418f207ff4" });
  console.log(data);
};

// addCust();
delCust();


// const addCustomer = async () => {
//   let cust1 = new Customer({
//     name: "Rahul Kumar",
//   });

//   let order1 = await Order.findOne({ item: "Chips" });
//   let order2 = await Order.findOne({ item: "Chocolate" });

//   cust1.orders.push(order1);
//   cust1.orders.push(order2);

//   let result = await cust1.save();
//   console.log(result);
// };

// addCustomer();

// const addOrders = async () => {
//   let res = await Order.insertMany([
//     { item: "Somasa", price: 12 },
//     { item: "Chips", price: 10 },
//     { item: "Chocolate", price: 40 },
//   ]);
//   console.log(res);
// };

// addOrders();