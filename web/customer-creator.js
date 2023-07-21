import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "./shopify.js";
import fs from "fs";
import { parse } from "csv-parse";
import path, { resolve } from "path";
import { fileURLToPath } from "url";
import { rejects } from "assert";
// import { createHmac } 'node:crypto';
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

async function readCSVFile() {
  const data_new = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(__dirname + "/customers.csv")
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
//   console.log("---------",data[0]);
//    var id = createHmac.randomBytes(3).toString('hex');
//    console.log("id---------",id);


  const adjective = data[Math.floor(Math.random() * data.length)];
   console.log("-------------",adjective);

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

export const DEFAULT_PRODUCTS_COUNT = 10;
const CREATE_PRODUCTS_MUTATION = `
mutation customerCreate($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer {
        id
      }
    }
  }
`;
let data_arr=[];
export default async function customerCreator(
  session,
  count = DEFAULT_PRODUCTS_COUNT
) {
  const client = new shopify.api.clients.Graphql({ session });
  

  try {
    for (let i = 0; i < count; i++) {

        var zip1 = Math.random().toString(36).slice(2, 5).toUpperCase();
        var zip2 = Math.random().toString(36).slice(2, 5).toUpperCase();

       console.log("zip---------",zip1,zip2);

        const a = await randomTitle();
        console.log("=========", a[0]);

        
      const customer_id = await client.query({
        data: {
          query: CREATE_PRODUCTS_MUTATION,
          variables: {
            input: {
                firstName: `${a[0]}`,
                lastName: `${a[1]}`,
                phone:`${a[5]}`,
                email: `${a[2]}`,
                "acceptsMarketing": true,
                "addresses": [
                  {
                    "address1": `${a[3]}`,
                    "city": `${a[4]}`,
                    "phone": `${a[5]}`, 
                    "zip": zip1+" "+zip2,
                    "lastName": `${a[1]}`,
                    "firstName": `${a[0]}`,
                    "country": `${a[7]}`
                  }
                ],
            },
          },
        },
      });

      console.log("customer_id--------",customer_id.body.data.customerCreate.customer);
      data_arr.push(customer_id.body.data.customerCreate.customer)
    }
    data_arr = data_arr.filter(function(item) {
      return item !== null
    })
    return data_arr;

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
