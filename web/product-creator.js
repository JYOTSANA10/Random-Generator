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
randomTitle();

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
  mutation populateProduct($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
        
        
      }
    }
  }
`;

export default async function productCreator(
  session,
  count = DEFAULT_PRODUCTS_COUNT
) {
  const client = new shopify.api.clients.Graphql({ session });
  const a = await randomTitle();
  console.log("=========", a[3], "---");

  const random = Math.floor(Math.random() * (30000 - 1000) + 1000);
  console.log("random", random);

  try {
    for (let i = 0; i < count; i++) {
      await client.query({
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
              variants: [
                {
                  price: `${a[25]}`,
                  sku: `${random}`,
                  // inventoryQuantities: [
                  //   {
                  //     availableQuantity: 1,
                  //     locationId: "gid://shopify/Location/81699209507",
                  //   },
                  // ],
                  options: ["Color"] 

                },
              ],
            },
          },
        },
      });
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
