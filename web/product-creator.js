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

export const DEFAULT_PRODUCTS_COUNT = 10;
const CREATE_PRODUCTS_MUTATION = `
  mutation populateProduct($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
        variants(first: 1) {
          nodes {
          id
          }
        }
        
      }
    }
  }
`;
let data_arr=[];
export default async function productCreator(
  session,
  count = DEFAULT_PRODUCTS_COUNT
) {
  const client = new shopify.api.clients.Graphql({ session });

  try {
    for (let i = 0; i < count; i++) {
      const a = await randomTitle();
      console.log("---------", a[3]);

      const random = Math.floor(Math.random() * (30000 - 1000) + 1000);

      const res=await client.query({
        data: {
          query: CREATE_PRODUCTS_MUTATION,
          variables: {
            input: {
              title: `${a[3]}`,
              descriptionHtml: `${a[7]}`,
              images: [
                {
                  altText: "Image",
                  src: `${a[29]}`,
                },
              ],
              tags: [`${a[27]}`],
              variants: [
                {
                  price: `${a[25]}`||"300",
                  sku: `${random}`,
                  // inventoryQuantities: [
                  //   {
                  //     availableQuantity: 1,
                  //     locationId: "gid://shopify/Location/81699209507",
                  //   },
                  // ],
                  options: ["Red"],
                },
              ],
            },
          },
        },
      });
      console.log("customer_id--------",res.body.data.productCreate.product.variants.nodes[0]);
      data_arr.push(res.body.data.productCreate.product.variants.nodes[0])
    }
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
