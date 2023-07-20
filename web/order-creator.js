import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "./shopify.js";
import fs from "fs";
import { parse } from "csv-parse";
import path, { resolve } from "path";
import { fileURLToPath } from "url";
import { rejects } from "assert";
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

async function readCSVFile() {
  const data_new = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(__dirname + "/new.csv")
      .pipe(parse({ delimiter: ",", from_line: 2 }))
      .on("data", function (row) {
        data_new.push(row);
      })
      .on("end", function () {
        resolve(data_new);
      })
      .on("error", function (error) {
        reject(error);
      });
  });
}

async function randomTitle() {
  const data = await readCSVFile();
  // console.log("---------",data[0]);
  const adjective = data[Math.floor(Math.random() * data.length)];
  //  console.log("-------------",adjective);

  return adjective;
}
// randomTitle();

// const printAddress = async () => {
//   const items = await randomTitle();

//   console.log("=======",items[0]);
// };
// printAddress();

// async function randomPrice() {
//  const data= await readCSVFile();
//    console.log(data.length);
//  const adjective = data[Math.floor(Math.random() * data.length)];
//  console.log("-------------",adjective[3]);
//  return `${adjective[3]}`;
// }

export const DEFAULT_PRODUCTS_COUNT = 1;
const CREATE_PRODUCTS_MUTATION = `
mutation draftOrderCreate($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder {
       
        id
      order {
        id
      }
      status
        
      }
    }
  }
`;
const DRAFT_ORDER_COMPLETE = `
mutation draftOrderComplete($id: ID!) {
    draftOrderComplete(id: $id) {
      draftOrder {
        id
        order {
          id
        }
      }
    }
  }
  `;

export default async function orderCreator(
  session,
  count = DEFAULT_PRODUCTS_COUNT
) {
  const client = new shopify.api.clients.Graphql({ session });
  

  try {
    for (let i = 0; i < count; i++) {

    //   const a = await randomTitle();
      console.log("---------Enter");

  
      const pro_id= await client.query({
        data: {
          query: CREATE_PRODUCTS_MUTATION,
          variables: {
            input: {
              "customerId": "gid://shopify/Customer/7223657890075",
              "note": "Test draft order",
              "email": "test.user@shopify.com",
              "taxExempt": true,
              "shippingLine": {
                "title": "Custom Shipping",
                "price": 4.55
              },
              "shippingAddress": {
                "address1": "123 Main St",
                "city": "Waterloo",
                "province": "Ontario",
                "country": "Canada",
                "zip": "A1A 1A1"
              },
              "billingAddress": {
                "address1": "456 Main St",
                "city": "Toronto",
                "province": "Ontario",
                "country": "Canada",
                "zip": "Z9Z 9Z9"
              },
             
              "lineItems": [
               
                {
                  "variantId": "gid://shopify/ProductVariant/45754251346203",
                  "quantity": 2
                }
              ],
             
            }
          }
          
        },
      });

      console.log("pro_id=========>",`${pro_id.body.data.draftOrderCreate.draftOrder.id}`);

      const res= await client.query({
        data: {
          query: DRAFT_ORDER_COMPLETE,
          variables: {
            input: {
                id:`${pro_id.body.data.draftOrderCreate.draftOrder.id}`
            }
          }
        }
        });
        console.log("RES------",res.body.data);

    }
  } catch (error) {
    if (error instanceof GraphqlQueryError) {
      throw new Error(
        `${error.message}\n${JSON.stringify(error.response, null, 2)}`
      );
    } else {
      throw error;
    }
  }
}
